package control
{
	import flash.external.ExternalInterface;
	import flash.utils.Dictionary;
	
	import model.DataModel;
	
	import modules.videoPlayer.VideoPlayerBabelia;
	import modules.videoPlayer.events.babelia.StreamEvent;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	import mx.utils.ObjectUtil;
	
	import view.CustomAlert;
	
	public class Extern
	{
		private static var instance:Extern;
		private var VP:VideoPlayerBabelia;
		
		private var jsListeners:Dictionary = new Dictionary();
		
		/**
		 * Constructor
		 */
		public function Extern(){}
		
		/**
		 * Initialize
		 * Adds CallBacks
		 */
		public function setup(VP:VideoPlayerBabelia):void
		{
			this.VP = VP;
			
			// Functions
			addCB("disableControls",VP.disableControls);
			addCB("enableControls",VP.enableControls);
			addCB("endVideo",VP.endVideo);
			addCB("muteRecording",VP.muteRecording);
			addCB("muteVideo",VP.muteVideo);
			addCB("pauseVideo",VP.pauseVideo);
			addCB("playVideo",VP.playVideo);
			addCB("removeArrows",VP.removeArrows);
			addCB("resumeVideo",VP.resumeVideo);
			addCB("seekTo",VP.seekTo);
			addCB("setArrows",setArrows);
			addCB("setSubtitle",setSubtitle);
			addCB("startTalking",VP.startTalking);
			addCB("stopVideo",VP.stopVideo);
			addCB("toggleControls",VP.toggleControls);
			addCB("unattachUserDevices",VP.unattachUserDevices);
			
			
			// Properties
			addCB("arrows",arrows);
			addCB("autoPlay",autoPlay);
			addCB("autoScale",autoScale);
			addCB("controlsEnabled",controlsEnabled);
			addCB("duration",duration);
			addCB("secondSource",secondSource);
			addCB("seek",seek);
			addCB("skin",skin);
			addCB("state",state);
			addCB("streamTime",streamTime);
			addCB("subtitles",subtitles);
			addCB("subtitlingControls",subtitlingControls);
			addCB("videoSource",videoSource);
			addCB("highlight",highlight);
			
			//Events
			addCB("addEventListener",addEventListener);
			addCB("removeEventListener",removeEventListener);
		}
		
		/**
		 * Instance of Extern
		 */
		public static function getInstance():Extern
		{
			if ( !instance )
				instance = new Extern()
			
			return instance;
		}
		
		/**
		 * Add callbacks for external controls
		 */
		private function addCB(func:String, callback:Function):void
		{
			ExternalInterface.addCallback(func,callback);
		}
		
		/**
		 * Videoplayer Ready
		 */
		public function onVideoPlayerReady():void
		{
			ExternalInterface.call("onBabeliaPlayerReady", ExternalInterface.objectID);
		}
		
		public function onEnterFrame(e:StreamEvent):void{
			ExternalInterface.call(jsListeners['onEnterFrame'], e.time);
		}
		
		/**
		 * Resize dimensions
		 */
		public function resizeWidth(width:Number):void
		{
			ExternalInterface.call( 
				"function( id, w ) { document.getElementById(id).style.width = w + 'px'; }", 
				ExternalInterface.objectID, 
				width 
			);
		}
		
		public function resizeHeight(height:Number):void
		{
			ExternalInterface.call( 
				"function( id, h ) { document.getElementById(id).style.height = h + 'px'; }", 
				ExternalInterface.objectID, 
				height 
			);
		}

		
		/*************************
		 * Tunneling VP Properties
		 ************************/
		
		private function arrows(flag:Boolean):void
		{
			VP.arrows = flag;
		}
		
		private function autoPlay(flag:Boolean):void
		{
			VP.autoPlay = flag;
		}
		
		private function autoScale(flag:Boolean):void
		{
			VP.autoScale = flag;
		}
		
		private function controlsEnabled(flag:Boolean):void
		{
			VP.controlsEnabled = flag;
		}
		
		private function duration():Number
		{
			return VP.duration;
		}
		
		private function setSubtitle(text:String, color:uint):void{
			VP.setSubtitle(text,color);
		}
		
		private function secondSource(video:String):void
		{
			VP.secondSource = DataModel.getInstance().responseStreamsFolder + "/" + video;
		}
		
		private function seek(flag:Boolean):void
		{
			VP.seek = flag;
		}
		
		private function skin(skinfile:String):void
		{
			VP.skin = skinfile;
		}
		
		private function state(st:int):void
		{
			VP.state = st;
		}
		
		private function streamTime():Number
		{
			return VP.streamTime;
		}
		
		private function subtitles(flag:Boolean):void
		{
			VP.subtitles = flag;
		}
		
		private function subtitlingControls(flag:Boolean):void
		{
			VP.subtitlingControls = flag;
		}
		
		private function videoSource(video:String):void
		{
			VP.videoSource = DataModel.getInstance().exerciseStreamsFolder + "/" + video;
		}
		
		private function highlight(flag:Boolean):void{
			VP.highlight = flag;
		}
		
		private function setArrows(arrows:Array, role:String):void
		{
			var aux:ArrayCollection = new ArrayCollection(arrows);
			
			//for ( var i:int = 0; i < arrows.length; i++ )
			//	aux.addItem({time: arrows[i].startTime, role: arrows[i].role});
			
			VP.setArrows(aux, role);
		}
		
		private function addEventListener(event:String, listener:String):void{
			
			switch(event){
				case 'onEnterFrame':
					if(listener){
						jsListeners['onEnterFrame'] = listener;
						VP.addEventListener(StreamEvent.ENTER_FRAME, onEnterFrame);
					}
					break;
				default:
					break;
			}
		}
		
		private function removeEventListener(event:String, listener:String):void{
			switch(event){
				case 'onEnterFrame':
					if(jsListeners['onEnterFrame'])
						delete jsListeners['onEnterFrame'];
					VP.removeEventListener(StreamEvent.ENTER_FRAME, onEnterFrame);
					break;
				default:
					break;
			}
		}
		
	}
}