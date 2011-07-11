function onReplayRecordingCuePoint(cue, subHolder)
{
	this.VP = subHolder;
	this.cue = cue;

	this.execute = function(){
		if(cue){
			VP.setSubtitle(cue.text, cue.textColor);
			var time = cue.endTime - cue.startTime;
			VP.startTalking(cue.role, time);
		} else
			VP.setSubtitle('');
	}	
}