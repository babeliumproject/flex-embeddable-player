function exercise() {

	// http://stackoverflow.com/questions/4818615/using-getjson-with-callback-within-a-javascript-object	
	var instance = this;

	this.bpPlayer = null;
	this.cueManager = null;

	/**
	 * Not needed. The video folders are specified internally var
	 * EXERCISE_FOLDER = 'exercises'; var RESPONSE_FOLDER = 'responses';
	 */

	this.bpPlayerStates = {
		PLAY_STATE : 0,
		PLAY_BOTH_STATE : 1,
		RECORD_MIC_STATE : 2,
		RECORD_BOTH_STATE : 3
	};

	this.currentExercise = null;
	this.currentResponse = null;

	this.rolesReady = false;
	this.localesReady = false;
	this.cueManagerReady = false;

	this.locales = [];
	this.characterNames = [];
	this.roles = [];

	this.selectedRole = null;
	this.selectedLocale = null;
	this.recordedFilename = null;

	this.loadExercise = function(videoPlayer, ex) {
		this.bpPlayer = videoPlayer;
		this.cueManager = new cuePointManager();
		this.setupVideoPlayer();
		this.onExerciseSelected(ex);
		$('#bplayer-title').html(ex.title);
	};

	this.loadResponse = function(videoPlayer, resp){
		this.bpPlayer = videoPlayer;
		this.cueManager = new cuePointManager();
		this.onResponseSelected(resp);
		document.getElementById("bplayer-title").innerHTML = resp.title;
	};	

	this.setupVideoPlayer = function() {
		// bpPlayer.addEventListener('onVideoPlayerReady','videoPlayerReadyListener');
		// bpPlayer.addEventListener('onVideoStartedPlaying','videoStartedPlayingListener');
		this.bpPlayer.addEventListener('onRecordingAborted','bpExercises.recordingAbortedListener');
		this.bpPlayer.addEventListener('onRecordingFinished','bpExercises.recordingFinishedListener');
	};

	this.onExerciseSelected = function(exercise) {
		// Store selected exercise's information
		this.exerciseName = exercise.name;
		this.exerciseTitle = exercise.title;
		this.exerciseId = exercise.id;
		this.currentExercise = exercise;
		this.rolesReady = false;
		this.localesReady = false;
		this.cueManagerReady = false;

		// If the user is logged-in we should have enabled the rating and report
		// widget below the videoplayer
		// in that case set the exercise data on this widget aswell
		// TODO
		//if(bpConfig.user != undefined && bpConfig.user.name != undefined){
			//Load the rating, tags, and report
		//}

		this.prepareExercise();
		this.resetCueManager();
	};

	this.onResponseSelected = function(response) {
		this.currentResponse = response;
		console.log(this.currentResponse);
		this.cueManagerReady = false;
		this.resetCueManager();
		this.prepareResponse();
	};

	this.prepareExercise = function() {
		// Prepare new video in VideoPlayer
		this.bpPlayer.stopVideo();
		this.bpPlayer.state(this.bpPlayerStates.PLAY_STATE);
		this.bpPlayer.videoSource(this.exerciseName);

		// Ajax call to the appointed REST service
		var parameters = {
			"exerciseId" : this.exerciseId
		};
		bpServices.send(false, 'getExerciseRoles', parameters,  instance.onRolesRetrieved);

		// Ajax call to the appointed REST service
		var parameters = {
			"exerciseId" : this.exerciseId
		};
		bpServices.send(false, 'getExerciseLocales', parameters, instance.onLocalesRetrieved);
	};

	this.prepareResponse = function() {
		
		this.prepareCueManagerEvaluation();
	};

	/**
	 * Service callback, use the 'instance' variable to access local scope
	 */
	this.onLocalesRetrieved = function(data) {
		$('#localeCombo').empty();

		if (data == null) {
			$('#localeCombo').attr('disabled', 'disabled');
			instance.localesReady = false;
		} else {
			$('#localeCombo').removeAttr('disabled');
			var info = data['response'];
			for(var i in info) {
				if (info[i] != undefined )
					$('#localeCombo').append('<option value="' + info[i] + '">' + info[i] + '</option>');
			}
			instance.localesReady = true;

			// Preparing subtitles
			instance.prepareCueManager();
		}
	};

	/**
	 * Service callback, use the 'instance' variable to access local scope
	 */
	this.onRolesRetrieved = function(data) {

		$('#roleCombo').empty();
		instance.characterNames = [];

		if (data == null) {
			$('#roleCombo').attr('disabled', 'disabled');
			instance.rolesReady = false;
		} else {
			$('#roleCombo').removeAttr('disabled');
			instance.rolesReady = true;
			var info = data['response'];
			instance.roles = info;
			for ( var i in info) {
				if (info[i].characterName != undefined && info[i].characterName != "NPC") {
					instance.characterNames.push(info[i].characterName);
					$('#roleCombo').append('<option value="' + info[i].characterName + '">' + info[i].characterName + '</option>');
				}
			}
		}
	};

	this.resetCueManager = function() {
		this.cueManager.reset();
		this.bpPlayer.removeEventListener('onEnterFrame', 'bpExercises.enterFrameListener');
	};

	this.prepareCueManager = function() {
		this.cueManager.setVideo(this.exerciseId);

		this.cueManager.addEventListener('onSubtitlesRetrieved',this.onSubtitlesRetrieved);

		this.selectedLocale = $('#localeCombo option:selected').text();
		this.cueManager.setCuesFromSubtitleUsingLocale(this.selectedLocale);
		this.bpPlayer.removeEventListener('onEnterFrame', 'bpExercises.enterFrameListener');
		this.bpPlayer.addEventListener('onEnterFrame', 'bpExercises.enterFrameListener');
	};

	this.prepareCueManagerEvaluation = function(){
		this.cueManager.addEventListener('onSubtitlesRetrieved', this.onSubtitlesRetrieved);
		this.cueManager.setCuesFromSubtitleUsingId(this.currentResponse.fk_subtitle_id);

		this.bpPlayer.removeEventListener('onEnterFrame', 'bpExercises.enterFrameListener');
		this.bpPlayer.addEventListener('onEnterFrame', 'bpExercises.enterFrameListener');
	};

	this.enterFrameListener = function(event) {
		this.cueManager.monitorCuePoints(event);
	};

	/**
	 * Callback from another scope, use the 'instance' variable to access local properties/methods
	 */
	this.onSubtitlesRetrieved = function() {
		if(instance.currentResponse == undefined)
			instance.setupPlayCommands();
		else{
			instance.bpPlayer.state(instance.bpPlayerStates.PLAY_BOTH_STATE);
			instance.bpPlayer.videoSource(instance.currentResponse.name);
			instance.bpPlayer.secondSource(instance.currentResponse.file_identifier);
			instance.selectedRole = instance.currentResponse.character_name;
			instance.setupRecordingCommands();
			//instance.showArrows();
			instance.bpPlayer.addEventListener('onMetadataRetrieved', 'bpExercises.onMetadataRetrieved');
		}
	};

	this.onMetadataRetrieved = function(event) {
		this.showArrows();
	};

	this.setupPlayCommands = function() {
		var auxList = this.cueManager.getCuelist();
		if (auxList.length <= 0)
			return;

		for ( var i in auxList) {
			auxList[i].setStartCommand(new onPlaybackCuePoint(auxList[i],this.bpPlayer));
			auxList[i].setEndCommand(new onPlaybackCuePoint(null, this.bpPlayer));
		}
		this.cueManagerReady = true;

		this.videoStartedPlayingListener(null);
	};

	this.setupReplayCommands = function() {
		var auxList = this.cueManager.getCuelist();

		if (auxList.length <= 0)
			return;

		for ( var i in auxList) {
			auxList[i].setStartCommand(new onReplayRecordingCuePoint(auxList[i], this.bpPlayer));
			auxList[i].setEndCommand(new onReplayRecordingCuePoint(null, this.bpPlayer));
		}

		this.cueManagerReady = true;
	};

	this.setupRecordingCommands = function() {
		var auxList = this.cueManager.getCuelist();

		if (auxList.length <= 0)
			return;

		for ( var i in auxList) {

			if (auxList[i].role != this.selectedRole) {
				auxList[i].setStartCommand(new onRecordingOtherRoleCuePoint(auxList[i], this.bpPlayer));
				auxList[i].setEndCommand(new onPlaybackCuePoint(null, this.bpPlayer));
			} else {
				auxList[i].setStartCommand(new onRecordingSelectedRoleStartCuePoint(auxList[i], this.bpPlayer));
				auxList[i].setEndCommand(new onRecordingSelectedRoleStopCuePoint(this.bpPlayer));
			}
		}
		this.bpPlayer.seek(false);
		this.cueManagerReady = true;
	};

	/**
	 * On recording end successfully
	 */
	// RecordingEvent
	this.recordingFinishedListener = function(recFilename) {
		// Store last recorded response's filename
		this.recordedFilename = recFilename;
		console.log("Response recording ended");

		var s = document.getElementById("id_submitbutton");
                s.disabled = false;

		// Set the videoplayer to playback both the exercise and the
		// last response.
		this.bpPlayer.videoSource(this.exerciseName);
		this.bpPlayer.state(this.bpPlayerStates.PLAY_BOTH_STATE);
		this.bpPlayer.secondSource(this.recordedFilename);

		this.bpPlayer.seek(false);
		this.bpPlayer.stopVideo();
	};

	/**
	 * On recording aborted
	 */
	// RecordingEvent
	this.recordingAbortedListener = function() {
		alert("Devices not working");
		this.recordingError();
	};

	this.recordingError = function() {
		this.hideArrows();
		this.bpPlayer.unattachUserDevices();
		this.bpPlayer.state(this.bpPlayerStates.PLAY_STATE);

		this.bpPlayer.removeEventListener('onEnterFrame','bpExercises.onEnterFrameListener');

		// Restore the panels
		$('#exerciseInfoPanel').show();
		$('#recordingEndOptions').hide();
	};

	this.showArrows = function() {

		this.bpPlayer.arrows(true);
		this.bpPlayer.setArrows(this.cueManager.cues2rolearray(), this.selectedRole);
	};

	this.hideArrows = function() {
		this.bpPlayer.arrows(false);
		this.bpPlayer.removeArrows();
	};

	this.saveResponse = function(){
		if(bpConfig.user == undefined){
			alert("You must be logged in in order to save your response");
			return;
		}

		var s = document.getElementById("id_submitbutton");
		s.disabled = true;

		var subtitleId = instance.cueManager.currentSubtitle();
		var duration = instance.bpPlayer.duration();

		// Prepare an AJAX call to the appointed service
		var parameters = {
			'userId' : bpConfig.user.id,
			'exerciseId' : instance.exerciseId,
			'fileIdentifier' : instance.recordedFilename,
			'isPrivate' : true,
			'source' : 'Red5',
			'duration' : duration,
			'addingDate' : null,
			'ratingAmount' : 0,
			'characterName' : instance.selectedRole,
			'transcriptionId' : 0,
			'subtitleId' : subtitleId
		};

		bpServices.send(false,'admSaveResponse',parameters,instance.saveResponseCallback);

		// Restore the panels
		$('#exerciseInfoPanel').show();
		$('#recordingEndOptions').hide();
	};

	 /**
         * Service callback, use the 'instance' variable to access local scope
         */
	this.saveResponseCallback = function(data) {

		if(data['response'] == undefined)
			return;

		//Reset component
		instance.bpPlayer.endVideo(); // Stop video
                instance.hideArrows();
		instance.bpPlayer.unattachUserDevices();
		instance.bpPlayer.state(instance.bpPlayerStates.PLAY_STATE);
                //instance.bpPlayer.removeEventListener('onEnterFrame','bpExercises.onEnterFrameListener'); 
		instance.setupPlayCommands();		

		var result = data['response'];

		var subtitlesAreUsed = instance.bpPlayer.subtitlePanelVisible;
		var subtitleId = instance.cueManager.currentSubtitle();
		var roleId = 0;
		var responseId = result.responseId;
		var responseFileIdentifier = result.responseFileIdentifier;
		console.log("ResponseID: "+responseId);

		
		var mform = document.forms['mform1'];
		mform.elements["data1"].value = responseId;
		mform.elements["data2"].value = responseFileIdentifier;
		console.log(document.getElementById("mform1"));
		var s = document.getElementById("id_submitbutton");
                s.disabled = false;
		mform.submit();

		/* Leave statistics aside for now 
		var roles = instance.roles;
		for (var i in roles) {
			if (roles[i].characterName == instance.selectedRole) {
				roleId = roles[i].id;
				break;
			}
		}


		// Ajax call to the appointed REST service
		var parameters = {
			'id' : 0,
			'userSessionId' : 0,
			'exerciseId' : instance.exerciseId,
			'responseAttempt' : false,
			'responseId' : responseId,
			'incidenceDate' : '',
			'subtitlesAreUsed' : subtitlesAreUsed,
			'subtitleId' : subtitleId,
			'exerciseRoleId' : roleId
		};

		bpServices.send(false, 'exerciseSaveResponse', parameters, null);
		*/
	};

	/**
         * Service callback, use the 'instance' variable to access local scope
         */
	this.onResponsePublished = function(data){
		if(data['response'] == undefined)
			return;
		var result = data['response'];
		bpConfig.user.creditCount = result.creditCount;
		//TODO notify the view elements of the change to reflect the new value
		alert("Your response has been published. Thanks for your collaboration."); 
	};

	// Videplyarevent
	this.videoStartedPlayingListener = function() {
		this.exerciseStartedPlaying = true;
		if (bpConfig.user.name != undefined && this.cueManagerReady && this.rolesReady && this.localesReady && this.exerciseStartedPlaying) {
			this.exerciseStartedPlaying = false;
			var subtitlesAreUsed = this.bpPlayer.subtitlePanelVisible;
			var subtitleId = this.cueManager.currentSubtitle;
			var parameters = {
				'id' : 0,
				'userSessionId' : 0,
				'exerciseId' : this.exerciseId,
				'responseAttempt' : false,
				'responseId' : 0,
				'incidenceDate' : '',
				'subtitlesAreUsed' : subtitlesAreUsed,
				'subtitleId' : subtitleId,
				'exerciseRoleId' : 0
			};
			if (this.exerciseId > 0 && subtitleId > 0)
				bpServices.send(false, 'watchExercise', parameters, null);
		}
	};

	this.statisticRecAttempt = function() {
		var subtitlesAreUsed = this.bpPlayer.subtitlePanelVisible();
		var subtitleId = this.cueManager.currentSubtitle();
		var roleId = 0;
		var roles = this.roles;
		for ( var i in roles) {
			if (roles[i].characterName == this.selectedRole) {
				roleId = roles[i].id;
				break;
			}
		}

		// Ajax call to the appointed REST service
		var parameters = {
			'id' : 0,
			'userSessionId' : 0,
			'exerciseId' : this.exerciseId,
			'responseAttempt' : true,
			'responseId' : 0,
			'incidenceDate' : '',
			'subtitlesAreUsed' : subtitlesAreUsed,
			'subtitleId' : subtitleId,
			'exerciseRoleId' : roleId
		};

		bpServices.send(false,'exerciseAttemptResponse', parameters, function(data){});
	};
		
	this.resetComp = function(){
		this.bpPlayer.endVideo(); // Stop video
		this.bpPlayer.setSubtitle(""); // Clear subtitles if any
		this.bpPlayer.videoSource(""); // Reset video source
		this.bpPlayer.state(this.bpPlayerStates.PLAY_STATE); //Reset the player window to display only the exercise

		this.hideArrows(); // Hide arrows

		
		//exerciseTitle=resourceManager.getString('myResources', 'LABEL_EXERCISE_TITLE');
		//_currentExercise=null; // Reset current exercise

		//hideSelectedExercise(); // Information of selected exercise
				
		//exerciseList.exerciseListDataGroup.selectedIndex = -1;

		// Remove cueManager's Listeners
		//this.cueManager.removeEventListener(CueManagerEvent.SUBTITLES_RETRIEVED, onSubtitlesRetrieved);

		//Remove the current exercise's info
		//ratingShareReport.exerciseData=null;
	};

/*
	this.initBoth = function(videoPlayer, ex, response){
 		this.bpPlayer = videoPlayer;
        	this.cueManager = new cuePointManager();
        	this.setupVideoPlayer();
		this.exerciseName = exercise.name;
		this.exerciseTitle = exercise.title;
		this.exerciseId = exercise.id;
		this.currentExercise = exercise;
		this.rolesReady = false;
		this.localesReady = false;
		this.cueManagerReady = false;

		this.showBoth(response);
        	$('#bplayer-title').html(ex.title);
	}


	this.showBoth = function(response){
		instance.showArrows();
		instance.setupRecordingCommands();
		instance.bpPlayer.videoSource(instance.exerciseName);
		instance.bpPlayer.state(instance.bpPlayerStates.PLAY_BOTH_STATE);
		instance.bpPlayer.secondSource(response);
		instance.bpPlayer.seek(false);
	}*/


	$(document).ready(function() {
		
			$('#recordingEndOptions').hide();
			$("#localeCombo").change(function() {
				instance.resetCueManager();
				instance.prepareCueManager();
			});

			// Mouse click on record button
			$('#startRecordingBtn').click(function() {
				// Hide and show the needed panels
				$('#exerciseInfoPanel').hide();
				$('#recordingEndOptions').show();
				// Commands with selected role
				instance.selectedRole = $('#roleCombo option:selected').text();
				instance.setupRecordingCommands();

				// Recording mode
				if ($("input[name=recmethod]:checked").val() == 'micOnly') {
					instance.bpPlayer.state(instance.bpPlayerStates.RECORD_MIC_STATE);
				} else {
					instance.bpPlayer.state(instance.bpPlayerStates.RECORD_BOTH_STATE);
				}
				// Prepare arrows
				instance.showArrows();
					
				// Save statistical data
				instance.statisticRecAttempt();
			});

			// Watch both
			$('#watchExerciseAndResponseBtn').click(function() {
				this.showBoth(instance.recordedFilename);
			});

			$('#watchResponseBtn').click(function() {
				instance.showArrows();
				isntance.setupReplayCommands();

				instance.bpPlayer.videoSource(instance.recordedFilename);
				instance.bpPlayer.state(instance.bpPlayerStates.PLAY_STATE);

				instance.bpPlayer.seek(false);
			});

			// Record again
			$('#recordAgainBtn').click(function() {
				instance.bpPlayer.videoSource(instance.exerciseName);
				instance.setupRecordingCommands();
				instance.showArrows();

				// Recording mode
				if ($("input[name=recmethod]:checked").val() == 'micOnly') {
					instance.bpPlayer.state(instance.bpPlayerStates.RECORD_MIC_STATE);
				} else {
					instance.bpPlayer.state(instance.bpPlayerStates.RECORD_BOTH_STATE);
				}

				// Save this new record attempt
				instance.statisticRecAttempt();
			});

			/*
			$('#abortRecordingBtn').click(function() {
				instance.recordingError();
				instance.prepareExercise();
				instance.resetCueManager();
			});*/

			// Save response
			/*
			$('#saveResponseBtn').click(function() {
				// TODO

				if(bpConfig.user === undefined){
					alert("You must be logged in in order to save your response");
					return;
				}

				//var userCredCount = 0;
				//if(bpConfig.user.creditCount !== undefined)
				//	userCredCount = bpConfig.user.creditCount;
				//if (userCredCount - bpConfig.evaluationRequestCredits >= 0) {
					// This must be changed by some function that takes a snapshot of the Response video
					var responseThumbnail = "nothumb.png";
					var subtitleId = instance.cueManager.currentSubtitle();

					var duration = instance.bpPlayer.duration();

					// Prepare an AJAX call to the appointed service
					var parameters = {
						'userId' : bpConfig.user.id,
						'exerciseId' : instance.exerciseId,
						'fileIdentifier' : instance.recordedFilename,
						'isPrivate' : true,
						'thumbnailUri' : responseThumbnail,
						'source' : 'Red5',
						'duration' : duration,
						'addingDate' : null,
						'ratingAmount' : 0,
						'characterName' : instance.selectedRole,
						'transcriptionId' : 0,
						'subtitleId' : subtitleId
					};

					bpServices.send(false,'admSaveResponse',parameters,instance.saveResponseCallback);

					// Restore the panels
					$('#exerciseInfoPanel').show();
					$('#recordingEndOptions').hide();
				//} else {
				//	$('#insufficientCreditsDialog').dialog('open');
				//}
			});*/
	});
}
