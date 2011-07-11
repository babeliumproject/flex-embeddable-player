function onPlaybackCuePoint(cue, videoPlayer, dg)
{
	//Retrieve the videoPlayer object using DOM
	this.VP=videoPlayer;
	//This object should reflect a DataGrid of ActionScript or an HTML table
	//this.dg=dg;
	this.cue=cue;

	this.execute = function()
	{
		if (cue){
			VP.setSubtitle(cue.text,cue.textColor);
			//var index:int = CuePointManager.getInstance().getCueIndex(cue);
			//if(dg != null && dg.rowCount > index)
			//	dg.selectedIndex = index;
		} else {
				VP.setSubtitle('');
		}
	}
}