This repository is the code for [Babelium's][] embeddable player.

[Babelium's]: http://babeliumproject.com

Here you will find the latest version of the embeddable player.

The player is currently available in 3 languages: English, Spanish and Basque.

Cloning the repository
----------------------
To run the development version of Babelium first clone the git repository.

	$ git clone git://github.com/babeliumproject/flex-embeddable-player.git babelium-flex-embeddable-player

Now the entire project should be in the `babelium-flex-embeddable-player/` directory.


Compiling the embeddable video player
-------------------------------------
These are the steps you need to take to compile the standalone player from the source code.

Download and unpack Flex SDK 4.6

	$ wget http://download.macromedia.com/pub/flex/sdk/flex_sdk_4.6.zip
	$ unzip flex_sdk_4.6.zip

Make a locale for Basque language (because it is not included by default):

	$ cd <flex_home>/bin
	$ ./copylocale en_US eu_ES

Fill the `build.properties` file for the embeddable player:

	$ cd babelium-flex-embeddable-player
	$ cp build.properties.template build.properties
	$ vi build.properties

Remember when editing the `build.properties` file you have to point the home folder of Flex SDK **FLEX_HOME**. For most time you can leave the rest of the fields unchanged.

	$ ant

The compiled files are placed in the `dist` folder.

Copy the embeddable video player to the target directory

	$ cd babelium-flex-embeddable-player/dist
	$ cp babeliumPlayer.* <target_directory>/

If you wan to use the embeddable player to give Moodle access to your Babelium server read below.

Enabling Moodle support in the Babelium server
--------------------------------------------
If you are using your own Babelium server and want to enable Moodle instances to access the exercises stored there, you have to take additional steps, such as placing some API files and compiling a special version of the video player.

Clone the Moodle plugin repository:

	$ git clone git://github.com/babeliumproject/moodle-plugins.git babelium-moodle-plugins

Now the entire project should be in the `babelium-moodle-plugins/` directory.

Copy the Moodle API files and the Moodle site registration script:

	$ cd babelium-moodle-plugins/patches
	$ cp -r api <babelium_home>/
	$ cp -r css <babelium_home>/
	$ cp moodleapi.php <babelium_directory>/

Copy the video merging script to the Babelium script folder:

	$ cd babelium-moodle-plugins/patches
	$ cp script/* <babelium_script_directory>/

Copy the placeholder video to display while the videos are still not merged:

	$ cd babelium-moodle-plugins/patches/media
	$ cp placeholder_merge.flv <red5_home>/webapps/vod/streams

Apply the provided SQL patch to enable Moodle site registration

	$ mysql -u <babeliumdbuser> -p
	> use <babeliumdbname>;
	> source babelium-moodle-plugins/patches/sql/moodle_patch.sql;

Fill the data of `<babelium_home>/api/services/utils/Config.php` (or copy from `<babelium_home>/services/utils/Config.php`) and check if the paths in `<babelium_home>/api/services/utils/VideoProcessor.php` are right.

Copy the embeddable video player files to the Babelium home directory.

	$ cd babelium-flex-embeddable-player/dist
	$ cp babeliumPlayer.* <babelium_directory>/


Finally, don't forget to update your Apache's configuration file by adding the following line inside the 
Document section:

  Header set Access-Control-Allow-Origin "*"

This will allow your embeddable-player to use remote Javascript calls, even if the called scripts are located 
on a a different server.

Following these steps you should be able to register Moodle instances in your Babelium server.

JavaScript API Reference
------------------------
This section describes how developers can interact with the embeddable player using the Javascript API.

###Functions
This is a list of functions available through the JavaScript API of the player.

####Video loading functions

* ```javascript
bpPlayer.exerciseSource(exerciseId:String):Void
```

 This function loads the specified exercise and starts playing it if autoplay is enabled.

 * The `exerciseId` parameter specifies the ID of an exercise available in Babelium's server.

* ```javascript
bpPlayer.responseSource(responseId:String):Void
```

 This function loads the specified response and starts playing it if autoplay is enabled.

 * The `responseId` parameter specifies the ID of an exercise response (made following an exercise) available in Babelium's server.

* ```javascript 
bpPlayer.secondSource(videoId:String):Void
```

 This function loads a second video to play it side by side with the previously loaded exercise or response video.

 * The `videoId` parameter specifies the ID of either an exercise or a response (usually response) that need be played side-by-side with the previously loaded video. The video player stage gets splitted in two and displaying the previously loaded video on the left and the new video on the right. The videos are "loosely" synchronized to keep the playback as accurate as possible.

* ```javascript
bpPlayer.autoPlay(enableAutoplay:Boolean):Void
```

 This function determines whether videos should start playing automatically when loaded or not. When autoplay is disabled the user has to press the play button for the video to start playing.
 
 * The `enableAutoplay` parameter specifies whether the video should start playing automatically when any video loading function is called.

####Playback functions

**Playing a video**

* ```javascript
bpPlayer.playVideo():Void
```

 Plays the currently loaded video.

* ```javascript
bpPlayer.pauseVideo():Void
```
 
 Pauses the currently loaded video.

* ```javascript
bpPlayer.resumeVideo():Void
```

 Resumes the playback of the currently loaded video.

* ```javascript
bpPlayer.stopVideo():Void
```

 Stops the currently loaded video.

* ```javascript
bpPlayer.seekTo(time:Number):Void
```

 Seeks to a specified time in the video.
 * The `time` parameter specifies the point in time where to jump in the playback. If the given number is greater than the duration of the video, the function call is ignored. The behaviour when the video is different depending on the current status of the video player.

* ```javascript
bpPlayer.endVideo():Void
```

 Clears the video display. Useful if you want to clear the remnant video frames after calling `stopVideo()`.

**Changing the video volume**

* ```javascript
bpPlayer.muteVideo(mute:Boolean):Void
```

 Mutes the currently loaded video.
 * The `mute` parameter specifies if the currently playing video should be muted or unmuted. Unmuting restores the video volume to its previous value.

####Recording functions

* ```javascript
bpPlayer.muteRecording(mute:Boolean):Void
```

 Mutes the ongoing recording stream.
 * The `mute` parameter specifies if the stream that is being recorded should be muted or unmuted. Unmuting restores the stream volume to its previous value.

* ```javascript
bpPlayer.setArrows(arrowTimestamps:Array, roleId:String):Void
```

 When recording a response the user chooses a role to impersonate. For an exercise to be available for recording it should have some associated event timestamps. These timestamps tell the video player when each character in the video should be speaking. The arrows point the beginning of each time gap the chosen character is speaking.

 * The `arrowTimestamps` parameter is a set of time event objects with format `{'startTime': Number, 'endTime': Number, 'role': String}`. It tells the video player where to place the arrow controls when the user is recording an exercise.
 * The `roleId` parameter tells the video player what role do the provided arrow timestamps belong to.

* ```javascript
bpPlayer.removeArrows():Void
```

 Removes the arrow controls

* ```javascript
bpPlayer.setSubtitle(text:String, colour:Number):Void
```
 
 Displays the provided text as a subtitle in the video player with the given colour. Usually the exercises have an associated set of subtitles that needs be loaded beforehand. Using this function in conjunction with the `onEnterFrame` event allows developers to display the subtitles the way they like best.

 * The `text` parameter is the text of the subtitle to be displayed.
 * The `colour` parameter is a number with the desired HTML colour code for the displayed text.

* ```javascript
bpPlayer.startTalking(roleId:String, duration:Number):Void
```

 When recording a response it displays a box telling the user how much time the current character has left to speak.
 * The `roleId` parameter tells the video player what role does the box belong to.
 * The `duration` parameter tells the video player the time window available to speak for the specified role.

* ```javascript
bpPlayer.unattachUserDevices():Void
```

 After finishing a recording unattaches any attached user devices like microphones or webcams so that other processes have them available.

####Video information

* ```javascript
bpPlayer.duration():Number
```

 Returns the duration in seconds of the currently playing video.

####Playback status

* ```javascript
bpPlayer.streamTime():Number
```

 Returns current timestamp in seconds of the currently playing video.

* ```javascript
bpPlayer.getState():Number
```

 Returns the current state of the video player

* ```javascript
bpPlayer.setState(newState:Number):Void
```

 Changes the layout and state of the video player to perform different actions.
 * The `newState` parameter specifies the new state the video player should be put into. Below is a list of the accepted states.

* **Video player states**

 <table>
  <tr>
    <th>Code</th><th>Name</th><th>Description</th>
  </tr>
  <tr>
    <td>0</td><td>PLAY_STATE</td><td>The video player is playing only a video.</td>
  </tr>
  <tr>
    <td>1</td><td>PLAY_BOTH_STATE</td><td> The video player is playing two videos side-by-side using loose synchronization.</td>
  </tr>
  <tr>
    <td>2</td><td>RECORD_MIC_STATE</td><td>A response is being recorded, and the user is using only a microphone device.</td>
  </tr>
  <tr>
    <td>3</td><td>RECORD_BOTH_STATE</td><td>A response is being recorded, and the user is using a webcam device.</td>
  </tr>
</table>

			
####Video player UI functions
* ```javascript
bpPlayer.arrows(displayArrows:Boolean):Void
```

 Display the panel that shows the role speaking arrows.
 * The `displayArrows` parameter specifies if the video player should display the arrow panel or not.

* ```javascript
bpPlayer.autoScale(autoscaleVideo:Boolean):Void
```

 Scales the video to the size of the stage maintaining the aspect ratio as close as possible or scales it to fill the whole stage.
 * The `autoscaleVideo` parameter specifies if the video should be scaled keeping its aspect ratio or scaled to fill the video stage.

* ```javascript
bpPlayer.disableControls():Void
```

 Disables the user to interact with any UI control.

* ```javascript
bpPlayer.enableControls():Void
```

 Enables the user to interact with any UI control.

* ```javascript
bpPlayer.toggleControls():Void
```

 Displays or hides the UI controls.

* ```javascript
bpPlayer.seek(enableSeek:Boolean):Void
```

 Determines whether the timeline bar should be interactive or not.
 * The `enableSeek` parameter specifies whether users can click on the timeline bar or not.

* ```javascript
bpPlayer.skin(skinFileUrl:String):Void
```

 Allows loading a skin file for the video player controls. Skin files consist of an XML that describes the colours and shapes of the UI controls. You can see an example XML in the folder *src/resources/skins/white.xml* of the source code.
 * The `skinFileUrl` parameter specifies the URL of an skin XML file.

* ```javascript
bpPlayer.subtitles(displaySubtitles:Boolean):Void
```

 Determines whether subtitles should be displayed or not.
 * The `displaySubtitles` parameter specifies if the subtitles should be displayed or not.

* ```javascript
bpPlayer.highlight(displayRoleHighlight:Boolean):Void
```

 When recording a response, determines if the video player should glow when the turn of the the chosen role arrives.
 * The `displayRoleHighlight` parameter specifies if the video player should glow when the playback reaches a point in which the chosen role is speaking.

####Managing event listeners

* ```javascript
player.addEventListener(event:String, listener:String):Void
```

 Adds a listener function for the specified event. The Events section below identifies the different events that the player might fire. The listener is a string that specifies the function that will execute when the specified event fires.

* ```javascript
player.removeEventListener(event:String, listener:String):Void
```

 Removes a listener function for the specified event. The Events section below identifies the different events that the player might fire. The listener is a string that specifies the function that will execute when the specified event fires.

###Events

* `onEnterFrame`

 This event fires each time the flash plugin refreshes the display list of the video player object. This happens at a variable rate but usually is between 15-30 per second on average computers using a regular amount of CPU. The value that the API passes to your event listener function will specify a Number that corresponds to the current playback timestamp in seconds. This event is useful for actions that require high accuracy or need to be synchronized.

* `onRecordingAborted`

 This event fires when the recording of a video fails for some reason.

* `onRecordingFinished`

 This event fires when the recording of a response finishes successfully. The value that the API passes to your event listener will specify a String that corresponds to the ID of the newly recorded response.

* `onVideoStartedPlaying`

 This event fires each time a video starts playing in the stage.

* `onMetadataRetrieved`

 This event fires when metadata about the video gets retrieved from the server. The value that the API passes to your event listener will specify an Object with various data about the video such as duration, width, height...

###Event handlers

Your HTML pages that display the video player must implement the callback functions named `onPlayerReady` and `onConnectionReady`. The API will call this functions when the player is fully loaded, connected to the streaming server and the API is ready to receive calls.

* `onPlayerReady(playerId)`

 Called when the player is fully loaded and the API is ready to receive calls.	

* `onConnectionReady(playerId)`

 Called when the player is successfully connected to the streaming server.



