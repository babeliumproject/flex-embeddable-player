/**
 * This tests flex<->js connection
 */

var bplayer = null;
var PLAY_STATE = 0;
var PLAY_BOTH_STATE = 1;

function onBabeliaPlayerReady(playerid)
{
	bplayer = document.getElementById(playerid);
	
	if ( !bplayer ) 
		return;
	
	ex = {'id':73,'name':'U1MbBtkIGZQ.flv', 'title':'Sintel'};
	testInit(bplayer, ex);

	/*
	// Play button
	$("input[name='btnPlay']").click(
		function()
		{
			bplayer.resumeVideo();
		});
	
	// Pause button
	$("input[name='btnPause']").click(
		function()
		{
			bplayer.pauseVideo();
		});
	
	// Stop button
	$("input[name='btnStop']").click(
		function()
		{
			bplayer.stopVideo();
		});
	
	// Seek textarea
	$("input[name='txtSeek']").keypress(
		function(event)
		{
			if (event.keyCode == 13 ) // Enter
			{
				bplayer.seekTo($("input[name='txtSeek']").val());
			}
		});
		  
	
	// Subtitles radio
	$("input[name='raSubs']").change(
		function()
		{
			bplayer.subtitles($("input[name='raSubs']:checked").val() == 1? true: false);
		});
	
	// Roles radio
	$("input[name='raRoles']").change(
		function()
		{
			bplayer.arrows($("input[name='raRoles']:checked").val() == 1? true: false);
		});
	
	// Subtitling Controls radio
	$("input[name='raCtrlSubs']").change(
		function()
		{
			bplayer.subtitlingControls($("input[name='raCtrlSubs']:checked").val() == 1? true: false);
		});
	
	// Video Number radio
	$("input[name='raNumVid']").change(
		function()
		{
			if ( $("input[name='raNumVid']:checked").val() == 1 )
				bplayer.state(PLAY_STATE);
			else
			{
				bplayer.state(PLAY_BOTH_STATE);
				bplayer.secondSource(exerciseFolder+"tdes_1170_qa.flv");
			}
		});
	
	// Video1
	$("input[name='txtVid1']").keypress(
		function(event)
		{
			if (event.keyCode == 13 ) // Enter
			{
				bplayer.stopVideo();
				bplayer.videoSource($("input[name='txtVid1']").val());
				bplayer.resumeVideo();
			}
		});
	
	// Video2
	$("input[name='txtVid2']").keypress(
		function(event)
		{
			if (event.keyCode == 13 ) // Enter
			{
				bplayer.stopVideo();
				bplayer.secondSource($("input[name='txtVid2']").val());
				bplayer.resumeVideo();
			}
		});
	
	// Role radio
	$("input[name='raFlechas']").change(
		function()
		{
			// Mostrar/Ocultar flechas
			if ( $("input[name='raFlechas']:checked").val() == 0 )
			{
				bplayer.removeArrows();
				return;
			}
			
			// Desplegamos roles si no lo están
			if ( $("input[name='raRoles']:checked").val() != 1 )
			{
				$("input[name='raRoles']:eq(0)").attr("checked", true);
				bplayer.arrows(true);
			}
			
			// Desplegamos flechas
			var flechas = new Array();
			flechas[0] = new Object();
			flechas[0].time = 1;
			flechas[0].role = "User2";
			
			flechas[1] = new Object();
			flechas[1].time = 7;
			flechas[1].role = "User";
			
			flechas[2] = new Object();
			flechas[2].time = 13;
			flechas[2].role = "User2";
			
			flechas[3] = new Object();
			flechas[3].time = 16;
			flechas[3].role = "User";
			
			flechas[4] = new Object();
			flechas[4].time = 21;
			flechas[4].role = "User2";
			
			flechas[5] = new Object();
			flechas[5].time = 25;
			flechas[5].role = "User";
			
			flechas[6] = new Object();
			flechas[6].time = 31;
			flechas[6].role = "User2";
			
			// Asignar flechas
			bplayer.setArrows(flechas, "User");
			
			// Comienza a hablar
			bplayer.startTalking("Usuario", 3);
		});
	*/
}