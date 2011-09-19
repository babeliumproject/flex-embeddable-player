function exercise() {

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
		this.bpPlayer.addEventListener('onRecordingAborted',
				'recordingAbortedListener');
		this.bpPlayer.addEventListener('onRecordingFinished',
				'recordingFinishedListener');
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
		console.log("CommToken: " + bpServices.commToken);
		bpServices.send(false, 'getExerciseRoles', parameters,
				'bpExercises.onRolesRetrieved');

		// Ajax call to the appointed REST service
		var parameters = {
			"exerciseId" : this.exerciseId
		};
		bpServices.send(false, 'getExerciseLocales', parameters,
				'bpExercises.onLocalesRetrieved');
	}

	this.onLocalesRetrieved = function(data) {
		$('#localeCombo').empty();

		if (data == null) {
			$('#localeCombo').attr('disabled', 'disabled');
			this.localesReady = false;
		} else {
			$('#localeCombo').removeAttr('disabled');
			var info = data['response'];
			for(var i in info) {
				if (info[i] != undefined )
					$('#localeCombo').append('<option value="' + info[i] + '">' + info[i] + '</option>');
			}
			this.localesReady = true;

			// Preparing subtitles
			bpExercises.prepareCueManager();
		}
	}

	this.onRolesRetrieved = function(data) {

		$('#roleCombo').empty();
		this.characterNames = [];

		if (data == null) {
			$('#roleCombo').attr('disabled', 'disabled');
			this.rolesReady = false;
		} else {
			$('#roleCombo').removeAttr('disabled');
			this.rolesReady = true;
			var info = data['response'];
			for ( var i in info) {
				if (info[i].characterName != undefined
						&& info[i].characterName != "NPC") {
					this.characterNames.push(info[i].characterName);
					$('#roleCombo').append(
							'<option value="' + info[i].characterName + '">'
									+ info[i].characterName + '</option>');
				}
			}
		}
	}

	this.resetCueManager = function() {
		this.cueManager.reset();
		this.bpPlayer.removeEventListener('onEnterFrame', 'enterFrameListener');
	}

	this.prepareCueManager = function() {
		// TODO
		this.cueManager.setVideo(this.exerciseId);

		this.cueManager.addEventListener('onSubtitlesRetrieved',
				this.onSubtitlesRetrieved);

		// cueManager.addEventListener(CueManagerEvent.SUBTITLES_RETRIEVED,
		// onSubtitlesRetrieved);

		this.selectedLocale = $('#localeCombo option:selected').text();
		this.cueManager.setCuesFromSubtitleUsingLocale(this.selectedLocale);
		this.bpPlayer.removeEventListener('onEnterFrame', 'enterFrameListener');
		this.bpPlayer.addEventListener('onEnterFrame', 'enterFrameListener');

		// VP.removeEventListener(StreamEvent.ENTER_FRAME,
		// cueManager.monitorCuePoints);
		// VP.addEventListener(StreamEvent.ENTER_FRAME,
		// cueManager.monitorCuePoints);

	}

	this.enterFrameListener = function(event) {
		this.cueManager.monitorCuePoints(event);
	}

	// cuemanagerevent
	this.onSubtitlesRetrieved = function() {
		this.setupPlayCommands();
	}

	this.setupPlayCommands = function() {
		var auxList = cueManager.getCuelist();
		if (auxList.length <= 0)
			return;

		for ( var i in auxList) {
			auxList[i].setStartCommand(new onPlaybackCuePoint(auxList[i],
					bpPlayer));
			auxList[i].setEndCommand(new onPlaybackCuePoint(null, bpPlayer));
		}

		this.cueManagerReady = true;

		this.videoStartedPlayingListener(null);
	}

	this.setupReplayCommands = function() {
		var auxList = cueManager.getCuelist();

		if (auxList.length <= 0)
			return;

		for ( var i in auxList) {
			auxList[i].setStartCommand(new onReplayRecordingCuePoint(
					auxList[i], bpPlayer));
			auxList[i].setEndCommand(new onReplayRecordingCuePoint(null,
					bpPlayer));
		}

		this.cueManagerReady = true;
	}

	this.setupRecordingCommands = function() {
		var auxList = cueManager.getCuelist();

		if (auxList.length <= 0)
			return;

		for ( var i in auxList) {

			if (auxList[i].role != selectedRole) {
				auxList[i].setStartCommand(new onRecordingOtherRoleCuePoint(
						auxList[i], bpPlayer));
				auxList[i]
						.setEndCommand(new onPlaybackCuePoint(null, bpPlayer));
			} else {
				auxList[i]
						.setStartCommand(new onRecordingSelectedRoleStartCuePoint(
								auxList[i], bpPlayer));
				auxList[i]
						.setEndCommand(new onRecordingSelectedRoleStopCuePoint(
								bpPlayer));
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
		this.bpPlayer.videoSource(exerciseName);
		this.bpPlayer.state(bpPlayerStates.PLAY_BOTH_STATE);
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
		this.bpPlayer.state(bpPlayerStates.PLAY_STATE);

		this.bpPlayer.removeEventListener('onEnterFrame',
				'onEnterFrameListener');

		// Restore the panels
		$('#exerciseInfoPanel').show();
		$('#recordingEndOptions').hide();
	}

	this.showArrows = function() {

		this.bpPlayer.arrows(true);
		this.bpPlayer.setArrows(cueManager.cues2rolearray(), selectedRole);
	}

	this.hideArrows = function() {
		this.bpPlayer.arrows(false);
		this.bpPlayer.removeArrows();
	}

	this.saveResponseCallback = function(data) {

		var subtitlesAreUsed = bpPlayer.subtitlePanelVisible;
		var subtitleId = cueManager.currentSubtitle;
		var roleId = 0;
		var responseId = data.responseId;
		for ( var i in roles) {
			if (roles[i].characterName == selectedRole) {
				roleId = roles[i].id;
				break;
			}
		}

		// Ajax call to the appointed REST service
		var videoData = {
			'id' : 0,
			'userSessionId' : 0,
			'exerciseId' : exerciseId,
			'responseAttempt' : false,
			'responseId' : responseId,
			'incidenceDate' : '',
			'subtitlesAreUsed' : subtitlesAreUsed,
			'subtitleId' : subtitleId,
			'exerciseRoleId' : roleId
		};
		var srvClass = 'UserVideoHistory';
		var srvMethod = 'exerciseSaveResponse';
		var srvParams = videoData;

		var srvQueryString = server + '?class=' + srvClass + '&method='
				+ srvMethod + '&arg=' + srvParams;
		$.getJSON(srvQueryString, statisticRecSave(data)).error(function() {
			alert("Couldn't save the statistic data.")
		});

	}

	// Videplyarevent
	this.videoStartedPlayingListener = function() {
		this.exerciseStartedPlaying = true;
		if (/* DataModel.getInstance().isLoggedIn && */this.cueManagerReady
				&& this.rolesReady && this.localesReady
				&& this.exerciseStartedPlaying) {
			this.exerciseStartedPlaying = false;
			var subtitlesAreUsed = this.bpPlayer.subtitlePanelVisible;
			var subtitleId = this.cueManager.currentSubtitle;
			var videoData = {
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
			var srvClass = 'UserVideoHistory';
			var srvMethod = 'watchExercise';
			var srvParams = videoData;

			var srvQueryString = server + '?class=' + srvClass + '&method='
					+ srvMethod + '&arg=' + srvParams;
			if (exerciseId > 0 && subtitleId > 0)
				$.getJSON(srvQueryString, function(data) { /* Do sth here */
				}).error(function() {
					alert("Couldn't save the statistic data.")
				});
		}
	}

	this.statisticRecAttempt = function() {
		var subtitlesAreUsed = bpPlayer.subtitlePanelVisible;
		var subtitleId = cueManager.currentSubtitle;
		var roleId = 0;
		for ( var i in roles) {
			if (roles[i].characterName == selectedRole) {
				roleId = roles[i].id;
				break;
			}
		}

		// Ajax call to the appointed REST service
		var videoData = {
			'id' : 0,
			'userSessionId' : 0,
			'exerciseId' : exerciseId,
			'responseAttempt' : true,
			'responseId' : 0,
			'incidenceDate' : '',
			'subtitlesAreUsed' : subtitlesAreUsed,
			'subtitleId' : subtitleId,
			'exerciseRoleId' : roleId
		};
		var srvClass = 'UserVideoHistory';
		var srvMethod = 'exerciseAttemptResponse';
		var srvParams = base64_encode(JSON.stringify(videoData));

		var srvQueryString = server + '?class=' + srvClass + '&method='
				+ srvMethod + '&arg=' + srvParams;

		$.getJSON(srvQueryString, function(data) {
			saveResponseCallback(data);
		}).error(function() {
			alert("Couldn't save the statistic data.")
		});
	}

	$(document).ready(function() {
		
			$('#recordingEndOptions').hide();
			$("#localeCombo").change(function() {
				this.resetCueManager();
				this.prepareCueManager();
			});

			// Mouse click on record button
			$('#startRecordingBtn').click(function() {
				// Hide and show the needed panels
				$('#exerciseInfoPanel').hide();
				$('#recordingEndOptions').show();
				// Commands with selected role
				selectedRole = $('#roleCombo option:selected').text();
				this.setupRecordingCommands();

				// Recording mode
				if ($("input[name=recmethod]:checked").val() == 'micOnly') {
					this.bpPlayer.state(bpPlayerStates.RECORD_MIC_STATE);
				} else {
					this.bpPlayer.state(bpPlayerStates.RECORD_BOTH_STATE);
				}
				// Prepare arrows
				this.showArrows();
					
				// Save statistical data
				// TODO
				// statisticRecAttempt();
			});

			// Watch both
			$('#watchExerciseAndResponseBtn').click(function() {
				this.showArrows();
				this.setupRecordingCommands();
				this.bpPlayer.videoSource(exerciseName);
				this.bpPlayer.state(bpPlayerStates.PLAY_BOTH_STATE);
				this.bpPlayer.secondSource(recordedFilename);
				this.bpPlayer.seek(false);
			});

			$('#watchResponseBtn').click(function() {
				this.showArrows();
				this.setupReplayCommands();

				this.bpPlayer.videoSource(recordedFilename);
				this.bpPlayer.state(bpPlayerStates.PLAY_STATE);

				this.bpPlayer.seek(false);
			});

			// Record again
			$('#recordAgainBtn').click(function() {
				this.bpPlayer.videoSource(exerciseName);
				this.setupRecordingCommands();
				this.showArrows();

				// Recording mode
				if ($("input[name=recmethod]:checked").val() == 'micOnly') {
					this.bpPlayer.state(bpPlayerStates.RECORD_MIC_STATE);
				} else {
					this.bpPlayer.state(bpPlayerStates.RECORD_BOTH_STATE);
				}

				// Save this new record attempt
				this.statisticRecAttempt();
			});

			$('#abortRecordingBtn').click(function() {
				this.recordingError();
				this.prepareExercise();
				this.resetCueManager();
			});

			// Save response
			$('#saveResponseBtn').click(function() {
				// TODO
				// Centralized data
				var userCredCount = 30;
				var credsEvalRequest = 20;
				if (userCredCount - credsEvalRequest >= 0) {
					// This must be changed by some function that takes a snapshot of the Response video
					var responseThumbnail = "nothumb.png";
					var subtitleId = cueManager.currentSubtitle;

					// Prepare an AJAX call to the appointed service
					var responseData = {
						'id' : 0,
						'exerciseId' : exerciseId,
						'fileIdentifier' : recordedFilename,
						'isPrivate' : true,
						'thumbnailUri' : responseThumbnail,
						'source' : 'Red5',
						'duration' : bpPlayer.duration,
						'addingDate' : new Date(),
						'ratingAmount' : 0,
						'characterName' : selectedRole,
						'transcriptionId' : 0,
						'subtitleId' : subtitleId
					};
					var srvClass = 'Response';
					var srvMethod = 'saveResponse';
					var srvParams = responseData;

					var srvQueryString = server+'?class='+srvClass+'&method='+srvMethod+'&arg='+srvParams;
					$.getJSON(srvQueryString,saveResponseCallback(data))
						.error(function() {
							alert("Couldn't save your response.")
					});

					// Restore the panels
					$('#exerciseInfoPanel').show();
					$('#recordingEndOptions').hide();

					this.resetComponent();
				} else {
					$('#insufficientCreditsDialog').dialog('open');
				}
			});
	});
}
