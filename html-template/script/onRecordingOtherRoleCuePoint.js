function onRecordingOtherRoleCuePoint(cue, VP)
{
	//Retrieve the videoPlayer object using DOM
	this.VP = VP;
	this.cue = cue;

	this.execute = function()
	{
			VP.setSubtitle(cue.text, cue.textColor);
			var time = cue.endTime - cue.startTime;
			VP.startTalking(cue.role, time);
			VP.highlight = false;
	}
}