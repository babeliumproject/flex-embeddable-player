function onRecordingSelectedRoleStopCuePoint(VP){
	this.VP=VP;

	this.execute = function(){
		VP.setSubtitle("");
		VP.muteVideo(false);
		VP.muteRecording(true);
		VP.highlight = false;
	}
}