function onExerciseSelected(exercise){

	//Store selected exercises's information
	_exerciseName=exercise.name;
	_exerciseTitle=exercise.title;
	_exerciseId=exercise.id;
	_currentExercise=exercise;

	// Need to retrieve again exercise's information
	_rolesReady=false;
	_localesReady=false;
	_cueManagerReady=false;
	
	//If the user is logged-in we should have enabled the rating and report widget below the videoplayer
	//in that case set the exercise data on this widget aswell
	
	//TODO
	
	showSelectedExercise();
	prepareExercise();
	resetCueManager();
}



/**
 * Preparing exercise
 */
private function prepareExercise():void
{
	// Prepare new video in VideoPlayer
	VP.stopVideo();
	VP.state=VideoPlayerBabelia.PLAY_STATE;
	VP.videoSource=EXERCISE_FOLDER + '/' + _exerciseName;

	// Retrieving roles for selected exercise
	var auxExRol:ExerciseRoleVO=new ExerciseRoleVO();
	auxExRol.exerciseId=_exerciseId;
	new ExerciseRoleEvent(ExerciseRoleEvent.GET_EXERCISE_ROLES, auxExRol).dispatch();

	// Retrieving available locales for selected exercise's
	// subtitles
	var auxEx:ExerciseVO=new ExerciseVO();
	auxEx.id=_exerciseId;
	new ExerciseEvent(ExerciseEvent.GET_EXERCISE_LOCALES, auxEx).dispatch();
}

/**
 * On locales retrieved
 */
private function set onLocalesRetrieved(value:Boolean):void
{
	if (value)
	{
		_locales=DataModel.getInstance().availableExerciseLocales;

		if (_locales == null)
		{
			availableLocales.enabled=false;
			_localesReady=false;
		}
		else
		{
			availableLocales.enabled=true;
			_localesReady=true;

			// Preparing subtitles
			prepareCueManager();
		}

		DataModel.getInstance().availableExerciseLocalesRetrieved=false;
	}
}

/**
 * On roles retrieved
 */
private function set onRolesRetrieved(value:Boolean):void
{
	if (value)
	{
		_roles=DataModel.getInstance().availableExerciseRoles.getItemAt(DataModel.RECORDING_MODULE) as ArrayCollection;
		_characterNames.removeAll();

		if (_roles == null)
		{
			availableRoles.enabled=false;
			_rolesReady=false;
		}
		else
		{
			availableRoles.enabled=true;
			_rolesReady=true;

			for each (var role:ExerciseRoleVO in _roles)
			{
				if (role.characterName != "NPC")
					_characterNames.addItem(role.characterName);
			}
		}

		DataModel.getInstance().availableExerciseRolesRetrieved.setItemAt(false, DataModel.RECORDING_MODULE);
	}
}

/**
 * Reset Cuepoint Manager
 */
private function resetCueManager():void
{
	_cueManager.reset();
	VP.removeEventListener(StreamEvent.ENTER_FRAME, _cueManager.monitorCuePoints);
	_cueManager.removeEventListener(CueManagerEvent.SUBTITLES_RETRIEVED, onSubtitlesRetrieved);

}

/**
 * Prepare Cuepoint Manager
 */
private function prepareCueManager():void
{
	var cached:Boolean=_cueManager.setVideo(_exerciseId);

_cueManager.addEventListener(CueManagerEvent.SUBTITLES_RETRIEVED, onSubtitlesRetrieved);
_cueManager.setCuesFromSubtitleUsingLocale(availableLocales.selectedItem.code);

VP.removeEventListener(StreamEvent.ENTER_FRAME, _cueManager.monitorCuePoints);
VP.addEventListener(StreamEvent.ENTER_FRAME, _cueManager.monitorCuePoints);
}

/**
 * On subtitles retrieved
 */
private function onSubtitlesRetrieved(e:CueManagerEvent):void
{
	setupPlayCommands();
}

/**
 * Setup commands for playing sample video
 */
private function setupPlayCommands():void
{
	var auxList:ArrayCollection=_cueManager.getCuelist();

if (auxList.length <= 0)
	return;

for each (var cueobj:CueObject in auxList)
{
	cueobj.setStartCommand(new ShowHideSubtitleCommand(cueobj, VP));
	cueobj.setEndCommand(new ShowHideSubtitleCommand(null, VP));
}

_cueManagerReady=true;
onVideoStartedPlaying(null);
}

/**
 * Setup commands for playing the recorded response
 */
private function setupReplayCommands():void
{
	var auxList:ArrayCollection=_cueManager.getCuelist();

if (auxList.length <= 0)
	return;

for each (var cueobj:CueObject in auxList)
{
	cueobj.setStartCommand(new ReplayResponseCommand(cueobj, VP));
	cueobj.setEndCommand(new ReplayResponseCommand(null, VP));
}

_cueManagerReady=true;
}

/**
 * Setup recording commands
 */
private function setupRecordingCommands():void
{
	var auxList:ArrayCollection=_cueManager.getCuelist();

if (auxList.length <= 0)
	return;

for each (var cueobj:CueObject in auxList)
{
	if (cueobj.role != _selectedRole)
	{
		cueobj.setStartCommand(new RecordingOtherRoleCommand(cueobj, VP));

		cueobj.setEndCommand(new ShowHideSubtitleCommand(null, VP));
	}
	else
	{
		cueobj.setStartCommand(new StartRecordingSelectedRoleCommand(cueobj, VP));

		cueobj.setEndCommand(new StopRecordingSelectedRoleCommand(VP));
	}
}

_cueManagerReady=true;
}

/**
 * On locale combo box changed
 */
 private function onLocaleComboChanged(e:Event):void
 {
	 resetCueManager();
	 prepareCueManager();
 }

 /**
  * Show/Hide selected exercise
  */
 private function showSelectedExercise():void
 {
	 videoPlayerAndRecordingControls.includeInLayout=true;
	 videoPlayerAndRecordingControls.visible=true;

	 // Update URL
	 BabeliaBrowserManager.getInstance().updateURL(BabeliaBrowserManager.index2fragment(ViewChangeEvent.VIEWSTACK_EXERCISE_MODULE_INDEX), BabeliaBrowserManager.VIEW, _exerciseName);

	 _exerciseSelected=true;
 }

 private function hideSelectedExercise():void
 {
	 videoPlayerAndRecordingControls.includeInLayout=false;
	 videoPlayerAndRecordingControls.visible=false;

	 _exerciseSelected=false;
 }

 

 /**
  * On start recording clicked
  */
 private function onStartRecordingClicked(e:MouseEvent):void
 {
	 panelSelectedExercise.includeInLayout=false;
	 panelSelectedExercise.visible=false;
	 recordingEndOptions.includeInLayout=true;
	 recordingEndOptions.visible=true;

	 // Commands with selected role
	 _selectedRole=availableRoles.selectedItem.toString();
	 setupRecordingCommands();

	 // Recording mode
	 if (micOnly.selected)
		 VP.state=VideoPlayerBabelia.RECORD_MIC_STATE;
	 else
		 VP.state=VideoPlayerBabelia.RECORD_BOTH_STATE;

	 // Prepare arrows
	 showArrows();

	 // Disable events and tabs
	 DataModel.getInstance().recordingExercise=true;

	 // Save statistical data
	 statisticRecAttempt();
 }

 private function statisticRecAttempt():void
 {
	 var subtitlesAreUsed:Boolean=VP.subtitlePanelVisible;
 var subtitleId:int=_cueManager.currentSubtitle;
 var roleId:int=0;
 for each (var role:ExerciseRoleVO in _roles)
 {
	 if (role.characterName == _selectedRole)
	 {
		 roleId=role.id;
		 break;
	 }
 }
 var videoData:UserVideoHistoryVO=new UserVideoHistoryVO(0, 0, _exerciseId, true, 0, '', subtitlesAreUsed, subtitleId, roleId);
 new UserVideoHistoryEvent(UserVideoHistoryEvent.STAT_ATTEMPT_RESPONSE, videoData).dispatch();
 }

 /**
  * On recording end successfully
  */
 private function onRecordingEnd(e:RecordingEvent):void
 {
	 // Store last recorded response's filename
	 _recordedFilename=e.fileName;

	 DataModel.getInstance().recordingExercise=false;

	 // Set the videoplayer to playback both the exercise and the
	 // last response.
	 VP.videoSource=EXERCISE_FOLDER + '/' + _exerciseName;
	 VP.state=VideoPlayerBabelia.PLAY_BOTH_STATE;
	 VP.secondSource=RESPONSE_FOLDER + '/' + _recordedFilename

	 VP.seek=false;
	 VP.stopVideo();
 }

 /**
  * On recording aborted
  */
 private function onRecordingAborted(e:RecordingEvent):void
 {
	 CustomAlert.error(resourceManager.getString('myResources', 'DEVICES_NOT_WORKING'));
	 recordingError();
 }

 /**
  * On cam access denied
  */
 private function onCamAccessDenied(e:RecordingEvent):void
 {
	 CustomAlert.error(resourceManager.getString('myResources', 'DEVICES_NOT_WORKING'));
	 recordingError();
 }

 /**
  * On mic access denied
  */
 private function onMicAccessDenied(e:RecordingEvent):void
 {
	 CustomAlert.error(resourceManager.getString('myResources', 'DEVICES_NOT_WORKING'));
	 recordingError();
 }

 private function recordingError():void
 {
	 DataModel.getInstance().recordingExercise=false;
	 hideArrows();
	 VP.unattachUserDevices();
	 VP.state=VideoPlayerBabelia.PLAY_STATE;
	 VP.removeEventListener(StreamEvent.ENTER_FRAME, _cueManager.monitorCuePoints);

	 recordingEndOptions.includeInLayout=false;
	 recordingEndOptions.visible=false;
	 panelSelectedExercise.visible=true;
	 panelSelectedExercise.includeInLayout=true;

 }

 /**
  * Show Arrows
  */
 private function showArrows():void
 {
	 VP.arrows=true;
	 VP.setArrows(_cueManager.cues2rolearray(), _selectedRole);
 }

 /**
  * Hide Arroes
  */
 private function hideArrows():void
 {
	 VP.arrows=false;
	 VP.removeArrows();
 }

 /**
  * On tab change - reset selected video and stop streaming
  */
 private function set onTabChange(value:Boolean):void
 {
	 if(_creationComplete && DataModel.getInstance().oldContentViewStackIndex == ViewChangeEvent.VIEWSTACK_EXERCISE_MODULE_INDEX)
		 resetComponent();
 }

 private function resetComponent():void
 {
	 VP.endVideo(); // Stop video
	 VP.setSubtitle(""); // Clear subtitles if any
	 VP.videoSource=""; // Reset video source
	 VP.state=VideoPlayerBabelia.PLAY_STATE; // Reset the player
	 // window to display
	 // only the exercise

	 VP.arrows=false; // Hide arrows

	 _exerciseTitle=resourceManager.getString('myResources', 'LABEL_EXERCISE_TITLE');
	 _currentExercise=null; // Reset current exercise

	 hideSelectedExercise(); // Information of selected exercise

	 exerciseList.exerciseListDataGroup.selectedIndex = -1;

	 // Remove cueManager's Listeners
	 _cueManager.removeEventListener(CueManagerEvent.SUBTITLES_RETRIEVED, onSubtitlesRetrieved);

	 // Remove the current exercise's info
	 ratingShareReport.exerciseData=null;
 }

 // Watch both
 private function onWatchExerciseAndResponse(e:Event):void
 {
	 showArrows();
	 setupRecordingCommands();

	 VP.videoSource=EXERCISE_FOLDER + '/' + _exerciseName;
	 VP.state=VideoPlayerBabelia.PLAY_BOTH_STATE;
	 VP.secondSource=RESPONSE_FOLDER + '/' + _recordedFilename

	 VP.seek=false;
 }

 // Watch response
 private function onWatchResponse(e:Event):void
 {
	 showArrows();
	 setupReplayCommands();

	 VP.videoSource=RESPONSE_FOLDER + '/' + _recordedFilename;
	 VP.state=VideoPlayerBabelia.PLAY_STATE;

	 VP.seek=false;
 }

 // Record again
 private function onRecordAgain(e:Event):void
 {
	 VP.videoSource=EXERCISE_FOLDER + '/' + _exerciseName;
	 setupRecordingCommands();
	 showArrows();
	 DataModel.getInstance().recordingExercise=true;

	 // Recording mode
	 if (micOnly.selected)
		 VP.state=VideoPlayerBabelia.RECORD_MIC_STATE;
	 else
		 VP.state=VideoPlayerBabelia.RECORD_BOTH_STATE;

	 // Save this new record attempt
	 statisticRecAttempt();
 }

 private function onAbortRecording(e:Event):void
 {
	 recordingError();
	 prepareExercise();
	 resetCueManager();
 }

 // Save response
 private function onSaveResponse(e:Event):void
 {

	 var userCredCount:int=DataModel.getInstance().loggedUser.creditCount;
 var credsEvalRequest:int=DataModel.getInstance().prefDic['evaluationRequestCredits'];
 if (userCredCount - credsEvalRequest >= 0)
 {
	 // This must be changed by some function that takes a
	 // snapshot of the Response video
	 var responseThumbnail:String="nothumb.png";
 var subtitleId:int=_cueManager.currentSubtitle;
 var responseData:ResponseVO=new ResponseVO(0, _exerciseId, _recordedFilename, true, responseThumbnail, "Red5", VP.duration, (new Date().toString()), 0, _selectedRole, 0, subtitleId);

 // Third, save response
 new ResponseEvent(ResponseEvent.SAVE_RESPONSE, responseData).dispatch();

 recordingEndOptions.includeInLayout=false;
 recordingEndOptions.visible=false;
 panelSelectedExercise.includeInLayout=true;
 panelSelectedExercise.visible=true;


 resetComponent();
 }
 else
 {
	 CustomAlert.error(resourceManager.getString('myResources', 'ERROR_INSUFICCIENT_CREDITS'));
 }
 }

 private function set statisticRecSave(value:Boolean):void
 {
	 if (DataModel.getInstance().savedResponseId)
	 {
		 var subtitlesAreUsed:Boolean=VP.subtitlePanelVisible;
	 var subtitleId:int=_cueManager.currentSubtitle;
	 var roleId:int=0;
	 var responseId:int=DataModel.getInstance().savedResponseId;
	 for each (var role:ExerciseRoleVO in _roles)
	 {
		 if (role.characterName == _selectedRole)
		 {
			 roleId=role.id;
			 break;
		 }
	 }
	 var videoData:UserVideoHistoryVO=new UserVideoHistoryVO(0, 0, _exerciseId, false, responseId, '', subtitlesAreUsed, subtitleId, roleId);
	 new UserVideoHistoryEvent(UserVideoHistoryEvent.STAT_SAVE_RESPONSE, videoData).dispatch();
	 }
 }

 private function onVideoStartedPlaying(e:VideoPlayerEvent):void
 {
	 _exerciseStartedPlaying=true;
	 if (DataModel.getInstance().isLoggedIn && _cueManagerReady && _rolesReady && _localesReady && _exerciseStartedPlaying)
	 {
		 _exerciseStartedPlaying=false;
		 var subtitlesAreUsed:Boolean=VP.subtitlePanelVisible;
		 var subtitleId:int=_cueManager.currentSubtitle;
		 var videoData:UserVideoHistoryVO=new UserVideoHistoryVO(0, 0, _exerciseId, false, 0, '', subtitlesAreUsed, subtitleId, 0);
		 if (_exerciseId > 0 && subtitleId > 0)
			 new UserVideoHistoryEvent(UserVideoHistoryEvent.STAT_EXERCISE_WATCH, videoData).dispatch();
	 }
 }