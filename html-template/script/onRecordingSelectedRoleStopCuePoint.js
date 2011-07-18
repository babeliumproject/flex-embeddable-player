function onRecordingSelectedRoleStopCuePoint(VP){
	this.VP=VP;

	this.execute = function(){
		this.VP.setSubtitle("");
		this.VP.muteVideo(false);
		this.VP.muteRecording(true);
		this.VP.highlight(false);
	}
}