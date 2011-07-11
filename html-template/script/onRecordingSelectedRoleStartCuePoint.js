function onRecordingSelectedRoleStartCuePoint(cue, VP){
	
	this.VP=VP;
	this.cue = cue;

	this.execute = function(){
		VP.setSubtitle(cue.text, cue.textColor);
		VP.muteVideo(true);
		VP.muteRecording(false);
		var time= cue.endTime - cue.startTime;
		VP.startTalking(cue.role, time);
		VP.highlight = true;
	}
}