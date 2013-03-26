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


Following these steps you should be able to register Moodle instances in your Babelium server.

JavaScript API Reference
------------------------
This is a list of functions available through the JavaScript API of the player

###Functions
disableControls
enableControls
endVideo
muteRecording
muteVideo
pauseVideo
playVideo
removeArrows
resumeVideo
seekTo
setArrows
setSubtitle
startTalking
stopVideo
toggleControls
unattachUserDevices
			
###Properties
arrows
autoPlay
autoScale
controlsEnabled
duration
secondSource
seek
skin
getState
setState
streamTime
subtitles
subtitlingControls
subtitlePanelVisible
exerciseSource
responseSource
highlight

####Adding an event listener

**player.addEventListener(event:String, listener:String):Void**
	Adds a listener function for the specified event. The Events section below identifies the different events that the player might fire. The listener is a string that specifies the function that will execute when the specified event fires.

####Removing an event listener

**player.removeEventListener(event:String, listener:String):Void**
	Removes a listener function for the specified event. The Events section below identifies the different events that the player might fire. The listener is a string that specifies the function that will execute when the specified event fires.

###Events

onEnterFrame
onRecordingAborted
onRecordingFinished
onVideoStartedPlaying
onMetadataRetrieved

