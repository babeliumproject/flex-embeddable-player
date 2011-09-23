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
	this.exerciseName;
	this.exerciseTitle;
	this.exerciseId;

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
	}

	this.setupVideoPlayer = function() {
		// bpPlayer.addEventListener('onVideoPlayerReady','videoPlayerReadyListener');
		// bpPlayer.addEventListener('onVideoStartedPlaying','videoStartedPlayingListener');
		this.bpPlayer.addEventListener('onRecordingAborted','bpExercises.recordingAbortedListener');
		this.bpPlayer.addEventListener('onRecordingFinished','bpExercises.recordingFinishedListener');
	}

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

		this.prepareExercise();
		this.resetCueManager();
	}

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
	}

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
	}

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
			for ( var i in info) {
				if (info[i].characterName != undefined && info[i].characterName != "NPC") {
					instance.characterNames.push(info[i].characterName);
					$('#roleCombo').append('<option value="' + info[i].characterName + '">' + info[i].characterName + '</option>');
				}
			}
		}
	}

	this.resetCueManager = function() {
		this.cueManager.reset();
		this.bpPlayer.removeEventListener('onEnterFrame', 'enterFrameListener');
	}

	this.prepareCueManager = function() {
		this.cueManager.setVideo(this.exerciseId);

		this.cueManager.addEventListener('onSubtitlesRetrieved',this.onSubtitlesRetrieved);

		this.selectedLocale = $('#localeCombo option:selected').text();
		this.cueManager.setCuesFromSubtitleUsingLocale(this.selectedLocale);
		this.bpPlayer.removeEventListener('onEnterFrame', 'bpExercises.enterFrameListener');
		this.bpPlayer.addEventListener('onEnterFrame', 'bpExercises.enterFrameListener');
	}

	this.enterFrameListener = function(event) {
		this.cueManager.monitorCuePoints(event);
	}

	// cuemanagerevent
	this.onSubtitlesRetrieved = function() {
		instance.setupPlayCommands();
	}

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
	}

	this.setupReplayCommands = function() {
		var auxList = this.cueManager.getCuelist();

		if (auxList.length <= 0)
			return;

		for ( var i in auxList) {
			auxList[i].setStartCommand(new onReplayRecordingCuePoint(auxList[i], this.bpPlayer));
			auxList[i].setEndCommand(new onReplayRecordingCuePoint(null, this.bpPlayer));
		}

		this.cueManagerReady = true;
	}

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

		this.cueManagerReady = true;
	}

	/**
	 * On recording end successfully
	 */
	// RecordingEvent
	this.recordingFinishedListener = function(recFilename) {
		// Store last recorded response's filename
		this.recordedFilename = recFilename;
		console.log("Rec file name: " + recFilename);

		// Set the videoplayer to playback both the exercise and the
		// last response.
		this.bpPlayer.videoSource(this.exerciseName);
		this.bpPlayer.state(this.bpPlayerStates.PLAY_BOTH_STATE);
		this.bpPlayer.secondSource(recordedFilename);

		this.bpPlayer.seek(false);
		this.bpPlayer.stopVideo();
	}

	/**
	 * On recording aborted
	 */
	// RecordingEvent
	this.recordingAbortedListener = function() {
		alert("Devices not working");
		this.recordingError();
	}

	this.recordingError = function() {
		this.hideArrows();
		this.bpPlayer.unattachUserDevices();
		this.bpPlayer.state(this.bpPlayerStates.PLAY_STATE);

		this.bpPlayer.removeEventListener('onEnterFrame','bpExercises.onEnterFrameListener');

		// Restore the panels
		$('#exerciseInfoPanel').show();
		$('#recordingEndOptions').hide();
	}

	this.showArrows = function() {

		this.bpPlayer.arrows(true);
		this.bpPlayer.setArrows(this.cueManager.cues2rolearray(), this.selectedRole);
	}

	this.hideArrows = function() {
		this.bpPlayer.arrows(false);
		this.bpPlayer.removeArrows();
	}

	this.saveResponseCallback = function(data) {

		var subtitlesAreUsed = this.bpPlayer.subtitlePanelVisible;
		var subtitleId = this.cueManager.currentSubtitle;
		var roleId = 0;
		var responseId = data.responseId;
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
			'responseAttempt' : false,
			'responseId' : responseId,
			'incidenceDate' : '',
			'subtitlesAreUsed' : subtitlesAreUsed,
			'subtitleId' : subtitleId,
			'exerciseRoleId' : roleId
		};

		bpServices.send(false, 'exerciseSaveResponse', parameters, instance.statisticRecSave);

	}

	// Videplyarevent
	this.videoStartedPlayingListener = function() {
		this.exerciseStartedPlaying = true;
		if (/* DataModel.getInstance().isLoggedIn && */this.cueManagerReady && this.rolesReady && this.localesReady && this.exerciseStartedPlaying) {
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
				bpServices.send(false, 'watchExercise', parameters, function(data){});
		}
	}

	this.statisticRecAttempt = function() {
		var subtitlesAreUsed = this.bpPlayer.subtitlePanelVisible;
		var subtitleId = this.cueManager.currentSubtitle;
		var roleId = 0;
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

		bpServices.send(false,'exerciseAttemptResponse', parameters, instance.saveResponseCallback);
	}

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
				// TODO
				// statisticRecAttempt();
			});

			// Watch both
			$('#watchExerciseAndResponseBtn').click(function() {
				instance.showArrows();
				instance.setupRecordingCommands();
				instance.bpPlayer.videoSource(instance.exerciseName);
				instance.bpPlayer.state(instance.bpPlayerStates.PLAY_BOTH_STATE);
				instance.bpPlayer.secondSource(instance.recordedFilename);
				instance.bpPlayer.seek(false);
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

			$('#abortRecordingBtn').click(function() {
				instance.recordingError();
				instance.prepareExercise();
				instance.resetCueManager();
			});

			// Save response
			$('#saveResponseBtn').click(function() {
				// TODO

				if(bpConfig.user === undefined){
					alert("You must be logged in in order to save your response");
					return;
				}

				var userCredCount = 0;
				if(bpConfig.user.creditCount !== undefined)
					userCredCount = bpConfig.user.creditCount;
				if (userCredCount - bpConfig.evaluationRequestCredits >= 0) {
					// This must be changed by some function that takes a snapshot of the Response video
					var responseThumbnail = "nothumb.png";
					var subtitleId = instance.cueManager.currentSubtitle;

					// Prepare an AJAX call to the appointed service
					var parameters = {
						'id' : 0,
						'exerciseId' : instance.exerciseId,
						'fileIdentifier' : instance.recordedFilename,
						'isPrivate' : true,
						'thumbnailUri' : responseThumbnail,
						'source' : 'Red5',
						'duration' : instance.bpPlayer.duration,
						'addingDate' : null,
						'ratingAmount' : 0,
						'characterName' : instance.selectedRole,
						'transcriptionId' : 0,
						'subtitleId' : subtitleId
					};

					bpServices.send(false,'saveResponse',parameters,instance.saveResponseCallback);

					// Restore the panels
					$('#exerciseInfoPanel').show();
					$('#recordingEndOptions').hide();

					instance.resetComponent();
				} else {
					$('#insufficientCreditsDialog').dialog('open');
				}
			});
	});
}
