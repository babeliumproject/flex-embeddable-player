var bpPlayer = null;
var cueManager = null;
var server = 'http://babeliumhtml5/rest/rest';

/**
 * Not needed. The video folders are specified internally
 * var EXERCISE_FOLDER = 'exercises';
 * var RESPONSE_FOLDER = 'responses';
*/

var bpPlayerStates = {PLAY_STATE: 0, PLAY_BOTH_STATE: 1, RECORD_MIC_STATE: 2, RECORD_BOTH_STATE: 3};

var currentExercise = null;
var exerciseName;
var exerciseTitle;
var exerciseId;

var rolesReady = false;
var localesReady = false;
var cueManagerReady = false;

var locales = [];
var characterNames = [];
var roles = [];

var selectedRole;
var recordedFilename;

function testInit(videoPlayer, ex){
	bpPlayer = videoPlayer;
	cueManager = new cuePointManager();
	onExerciseSelected(ex);
}

function onExerciseSelected(exercise){

	//Store selected exercise's information
	exerciseName=exercise.name;
	exerciseTitle=exercise.title;
	exerciseId=exercise.id;
	currentExercise=exercise;
	rolesReady=false;
	localesReady=false;
	cueManagerReady=false;
	
	//If the user is logged-in we should have enabled the rating and report widget below the videoplayer
	//in that case set the exercise data on this widget aswell
	//TODO	
	
	prepareExercise();
	resetCueManager();
}

function prepareExercise()
{
	// Prepare new video in VideoPlayer
	bpPlayer.stopVideo();
	bpPlayer.state(bpPlayerStates.PLAY_STATE);
	bpPlayer.videoSource(exerciseName);

	//Ajax call to the appointed REST service
	var auxExRol = exerciseId;
	var srvClass = 'ExerciseRole';
	var srvMethod = 'getExerciseRoles';
	var srvParams = auxExRol;
	
	var srvQueryString = server + '?class=' + srvClass + '&method=' + srvMethod + '&arg=' + srvParams;
	$.getJSON(srvQueryString, null, function(data){
		onRolesRetrieved(data);
	}).error(function(){
		console.log("Couldn't retrieve the roles for this exercise.");
	});
	
	//Ajax call to the appointed REST service
	var auxEx = exerciseId;
	var srvClass = 'Exercise';
	var srvMethod = 'getExerciseLocales';
	var srvParams = auxEx;
	var srvQueryString = server + '?class=' + srvClass + '&method=' + srvMethod + '&arg=' + srvParams;
	$.getJSON(srvQueryString, null, function(data){
		onLocalesRetrieved(data);
	}).error(function(){ 
		console.log("Couldn't retrieve the available subtitle languages of the current exercise.") 
	});
	
}

function onLocalesRetrieved(data){
	var srvClass = 'Exercise';
	var srvMethod = 'getExerciseLocales';
	//console.log("Exercise subtitle languages retrieved");
	$('#localeCombo').empty();

	if (locales == null){
		$('#localeCombo').attr('disabled','disabled');
		localesReady=false;
	}else{
		$('#localeCombo').removeAttr('disabled');
		var info = data[srvClass][srvMethod];
		$.each(info, function(i,item){
			if(item != undefined && item != 'success')
				$('#localeCombo').append('<option value="'+item+'">'+item+'</option>');
		});
		localesReady=true;
	
		// Preparing subtitles
		prepareCueManager();
	}
}

function onRolesRetrieved(data){
	var srvClass = 'ExerciseRole';
	var srvMethod = 'getExerciseRoles';
	//console.log("Exercise roles retrieved");
	$('#roleCombo').empty();
	characterNames = [];

	if (data == null){
		$('#roleCombo').attr('disabled','disabled');
		rolesReady=false;
	} else {
		$('#roleCombo').removeAttr('disabled');
		rolesReady=true;
		var info = data[srvClass][srvMethod];
		$.each(info, function(i,item){
			if(item.characterName != undefined && item.characterName != "NPC"){
				characterNames.push(item.characterName);
				$('#roleCombo').append('<option value="'+item.characterName+'">'+item.characterName+'</option>');
			}
		});
	}
}


function resetCueManager(){
	cueManager.reset();
	bpPlayer.removeEventListener('onEnterFrame','enterFrameListener');
}

function prepareCueManager(){
	//TODO
	cueManager.setVideo(exerciseId);
	
	cueManager.addEventListener('onSubtitlesRetrieved', onSubtitlesRetrieved);
	
	//cueManager.addEventListener(CueManagerEvent.SUBTITLES_RETRIEVED, onSubtitlesRetrieved);
	
	selectedLocale=$('#localeCombo option:selected').text();
	cueManager.setCuesFromSubtitleUsingLocale(selectedLocale);
	bpPlayer.removeEventListener('onEnterFrame','enterFrameListener');
	bpPlayer.addEventListener('onEnterFrame','enterFrameListener');

	//VP.removeEventListener(StreamEvent.ENTER_FRAME, cueManager.monitorCuePoints);
	//VP.addEventListener(StreamEvent.ENTER_FRAME, cueManager.monitorCuePoints);
	
}

function enterFrameListener(event){
	cueManager.monitorCuePoints(event);
}

//cuemanagerevent
function onSubtitlesRetrieved(){
	setupPlayCommands();
}

function setupPlayCommands(){
	var auxList=cueManager.getCuelist();
	if (auxList.length <= 0)
		return;

	for (var i in auxList){
		auxList[i].setStartCommand(new onPlaybackCuePoint(auxList[i], bpPlayer));
		auxList[i].setEndCommand(new onPlaybackCuePoint(null, bpPlayer));
	}

	cueManagerReady=true;
	
	onVideoStartedPlaying(null);
}

function setupReplayCommands(){
	var auxList=cueManager.getCuelist();

	if (auxList.length <= 0)
		return;

	for (var i in auxList){
		auxList[i].setStartCommand(new onReplayRecordingCuePoint(auxList[i], bpPlayer));
		auxList[i].setEndCommand(new onReplayRecordingCuePoint(null, bpPlayer));
	}

	cueManagerReady=true;
}

function setupRecordingCommands(){
	var auxList=cueManager.getCuelist();

	if (auxList.length <= 0)
		return;

	for (var i in auxList){
		
		if (auxList[i].role != selectedRole){
			console.log('Not your role: '+auxList[i].role + '/' + selectedRole);
			auxList[i].setStartCommand(new onRecordingOtherRoleCuePoint(auxList[i], bpPlayer));
			auxList[i].setEndCommand(new onPlaybackCuePoint(null, bpPlayer));
		} else {
			console.log('Your role: '+auxList[i].role + '/' + selectedRole);
			auxList[i].setStartCommand(new onRecordingSelectedRoleStartCuePoint(auxList[i], bpPlayer));
			auxList[i].setEndCommand(new onRecordingSelectedRoleStopCuePoint(bpPlayer));
		}
	}

	cueManagerReady=true;
}

/**
 * On recording end successfully
 */
//RecordingEvent
function onRecordingEnd(){
	 // Store last recorded response's filename
	 recordedFilename=e.fileName;

	 // Set the videoplayer to playback both the exercise and the
	 // last response.
	 bpPlayer.videoSource=exerciseName;
	 bpPlayer.state=VideoPlayerBabelia.PLAY_BOTH_STATE;
	 bpPlayer.secondSource=recordedFilename;

	 bpPlayer.seek=false;
	 bpPlayer.stopVideo();
}

 /**
  * On recording aborted
  */
//RecordingEvent
function onRecordingAborted(){
	alert("Devices not working");
	recordingError();
}

 /**
  * On cam access denied
  */
//RecordingEvent
function onCamAccessDenied(){
	alert("Devices not working");
	recordingError();
}

/**
 * On mic access denied
 */
//RecordingEvent
function onMicAccessDenied(){
	alert("Devices not working");
	recordingError();
}

function recordingError(){
	hideArrows();
	bpPlayer.unattachUserDevices();
	bpPlayer.state=bpPlayerStates.PLAY_STATE;

	bpPlayer.removeEventListener('onEnterFrame','onEnterFrameListener');

	//Restore the panels
	$('#exerciseInfoPanel').show();
	$('#recordingEndOptions').hide();	 
}

function showArrows(){
	
	bpPlayer.arrows(true);
	bpPlayer.setArrows(cueManager.cues2rolearray(), selectedRole);
 }


function hideArrows(){
	 bpPlayer.arrows(false);
	 bpPlayer.removeArrows();
}

function saveResponseCallback(data){
	
	var subtitlesAreUsed=bpPlayer.subtitlePanelVisible;
	var subtitleId=cueManager.currentSubtitle;
	var roleId=0;
	var responseId=data.responseId;
	for (var i in roles){
	 	if (roles[i].characterName == selectedRole){
	 		roleId=roles[i].id;
	 		break;
	 	}
	}
	
	//Ajax call to the appointed REST service
 	var videoData={'id': 0, 'userSessionId': 0, 'exerciseId' : exerciseId, 'responseAttempt': false, 'responseId': responseId, 'incidenceDate':'', 'subtitlesAreUsed': subtitlesAreUsed, 'subtitleId': subtitleId, 'exerciseRoleId': roleId};
	var srvClass = 'UserVideoHistory';
	var srvMethod = 'exerciseSaveResponse';
	var srvParams = videoData;
	
	var srvQueryString = server + '?class=' + srvClass + '&method=' + srvMethod + '&arg=' + srvParams;
	$.getJSON(srvQueryString, statisticRecSave(data)).error(function(){ alert("Couldn't save the statistic data.") });
	
 }

//Videplyarevent
function onVideoStartedPlaying(){
	 exerciseStartedPlaying=true;
	 if (/*DataModel.getInstance().isLoggedIn &&*/ cueManagerReady && rolesReady && localesReady && exerciseStartedPlaying)
	 {
		 exerciseStartedPlaying=false;
		 var subtitlesAreUsed=bpPlayer.subtitlePanelVisible;
		 var subtitleId=cueManager.currentSubtitle;
		 var videoData={'id': 0, 'userSessionId': 0, 'exerciseId' : exerciseId, 'responseAttempt': false, 'responseId': 0, 'incidenceDate':'', 'subtitlesAreUsed': subtitlesAreUsed, 'subtitleId': subtitleId, 'exerciseRoleId': 0};
		 var srvClass = 'UserVideoHistory';
		 var srvMethod = 'watchExercise';
		 var srvParams = videoData;
		 
		 var srvQueryString = server + '?class=' + srvClass + '&method=' + srvMethod + '&arg=' + srvParams;
		 if (exerciseId > 0 && subtitleId > 0)
			 $.getJSON(srvQueryString, function(data){ /*Do sth here*/ }).error(function(){ alert("Couldn't save the statistic data.") });
	 }
}

function statisticRecAttempt(){
	var subtitlesAreUsed=bpPlayer.subtitlePanelVisible;
 	var subtitleId=cueManager.currentSubtitle;
 	var roleId=0;
 	for (var i in roles)
 	{
 		if (roles[i].characterName == selectedRole){
 			roleId=roles[i].id;
 			break;
 		}
 	}
 
 	//Ajax call to the appointed REST service
 	var videoData={'id': 0, 'userSessionId': 0, 'exerciseId' : exerciseId, 'responseAttempt': true, 'responseId': 0, 'incidenceDate':'', 'subtitlesAreUsed': subtitlesAreUsed, 'subtitleId': subtitleId, 'exerciseRoleId': roleId};
	var srvClass = 'UserVideoHistory';
	var srvMethod = 'exerciseAttemptResponse';
	var srvParams = base64_encode(JSON.stringify(videoData));
	
	var srvQueryString = server + '?class=' + srvClass + '&method=' + srvMethod + '&arg=' + srvParams;
	
	
	$.getJSON(srvQueryString, function(data){
		saveResponseCallback(data);
	}).error(function(){ 
		alert("Couldn't save the statistic data.") 
	});
}

$(document).ready(function(){
	
	$('#recordingEndOptions').hide();
	
	$("#localeCombo").change(function() { 
		resetCueManager();
		prepareCueManager();
		
	});

	//Mouse click on record button
	$('#startRecordingBtn').click(function() {
	
		//Hide and show the needed panels
		$('#exerciseInfoPanel').hide();
		$('#recordingEndOptions').show();

		// Commands with selected role
		selectedRole=$('#roleCombo option:selected').text();
		setupRecordingCommands();

		// Recording mode
		if($("input[name=recmethod]:checked").val() == 'micOnly'){
			console.log("Record method: microphone only");
			bpPlayer.state(bpPlayerStates.RECORD_MIC_STATE);
		}else{
			console.log("Record method: microphone and webcam");
			bpPlayer.state(bpPlayerStates.RECORD_BOTH_STATE);
		}
		// Prepare arrows
		showArrows();

		// Save statistical data
		//TODO
		//statisticRecAttempt();
	});


	// Watch both
	$('#watchExerciseAndResponseBtn').click(function(){
		showArrows();
		setupRecordingCommands();

		bpPlayer.videoSource=exerciseName;
		bpPlayer.state=bpPlayerStates.PLAY_BOTH_STATE;
		bpPlayer.secondSource=recordedFilename

		bpPlayer.seek=false;
	});

	$('#watchResponseBtn').click(function(){
		showArrows();
		setupReplayCommands();

		bpPlayer.videoSource=recordedFilename;
		bpPlayer.state=bpPlayerStates.PLAY_STATE;

		bpPlayer.seek=false;
	});

	// Record again
	$('#recordAgainBtn').click(function(){
		bpPlayer.videoSource=exerciseName;
		setupRecordingCommands();
		showArrows();
	 
		// Recording mode
		var micOnly = $("input[name='micOnly']:checked").val();
	 
		if (!isEmpty(micOnly))
			bpPlayer.state=bpPlayerStates.RECORD_MIC_STATE;
		else
			bpPlayer.state=bpPlayerStates.RECORD_BOTH_STATE;

		// Save this new record attempt
		statisticRecAttempt();
	});

	$('#abortRecordingBtn').click(function(){
		recordingError();
		prepareExercise();
		resetCueManager();
	});

	// Save response
	$('#saveResponseBtn').click(function(){
	
		//TODO
		//Centralized data
		var userCredCount = 30;
		var credsEvalRequest= 20;

		if (userCredCount - credsEvalRequest >= 0){
			// This must be changed by some function that takes a
			// snapshot of the Response video
			var responseThumbnail="nothumb.png";
			var subtitleId=cueManager.currentSubtitle;
 		
			//Prepare an AJAX call to the appointed service
			var responseData={'id':0, 'exerciseId':exerciseId, 'fileIdentifier':recordedFilename, 'isPrivate':true, 'thumbnailUri':responseThumbnail, 'source':'Red5', 'duration':bpPlayer.duration, 'addingDate':new Date(), 'ratingAmount':0, 'characterName':selectedRole, 'transcriptionId':0, 'subtitleId':subtitleId};
			var srvClass = 'Response';
			var srvMethod = 'saveResponse';
			var srvParams = responseData;
 		
			var srvQueryString = server + '?class=' + srvClass + '&method=' + srvMethod + '&arg=' + srvParams;
			$.getJSON(srvQueryString, saveResponseCallback(data)).error(function(){ alert("Couldn't save your response.") });

			//Restore the panels
			$('#exerciseInfoPanel').show();
			$('#recordingEndOptions').hide();

			resetComponent();
		} else {
			$('#insufficientCreditsDialog').dialog('open');
		}
	});

});


