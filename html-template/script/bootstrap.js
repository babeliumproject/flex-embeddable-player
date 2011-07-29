

//Declare a global variable to hold the DOM reference of the videoplayer so that it can be referenced trhoughout the app
var bplayer = null;

var bpServices = new services();
//services.getCommunicationToken();

/**
 * Callback from SWF file that suggests the videoplayer is being successfully initialized
 * @param playerid
 */
function onBabeliaPlayerReady(playerid)
{
	bplayer = document.getElementById(playerid);
	
	if ( !bplayer ) {
		Alert('There was a problem while loading the video player.');
		return;
	}
	
	//Load the exercises module using the "Sintel" sample video
	var ex = {'id':73,'name':'U1MbBtkIGZQ.flv', 'title':'Sintel'};
	testInit(bplayer, ex);
}