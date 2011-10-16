package control
{
	import flash.events.Event;
	import flash.external.ExternalInterface;
	import flash.utils.Dictionary;
	
	import model.DataModel;
	
	import modules.videoPlayer.VideoPlayerBabelia;
	import modules.videoPlayer.events.VideoPlayerEvent;
	import modules.videoPlayer.events.babelia.RecordingEvent;
	import modules.videoPlayer.events.babelia.StreamEvent;
	
	import mx.collections.ArrayCollection;
	import mx.utils.ObjectUtil;

	
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
			addCB("subtitlePanelVisible",subtitlePanelVisible);
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
			ExternalInterface.call("onPlayerReady", ExternalInterface.objectID);
		}
		
		/**
		 * Tell JS that the connection is being successfully established
		 */
		public function onConnectionReady():void{
			ExternalInterface.call("onConnectionReady", ExternalInterface.objectID);
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
		
		/**
		 * Event handlers
		 */
		public function onEnterFrame(e:StreamEvent):void{
			ExternalInterface.call(jsListeners['onEnterFrame'], e.time);
		}
		
		public function onRecordingAborted(e:RecordingEvent):void{
			ExternalInterface.call(jsListeners['onRecordingAborted']);
		}
		
		public function onRecordingFinished(e:RecordingEvent):void{
			ExternalInterface.call(jsListeners['onRecordingFinished'], e.fileName);
		}
		
		public function onVideoStartedPlaying(e:VideoPlayerEvent):void{
			ExternalInterface.call(jsListeners['onVideoStartedPlaying']);
		}
		
		public function onMetadataRetrieved(e:Event):void{
			ExternalInterface.call(jsListeners['onMetadataRetrieved'],e);
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
		
		private function subtitlePanelVisible():Boolean{
			return VP.subtitlePanelVisible;
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
			
			if(!listener)
				return;
			
			switch(event){
				case 'onEnterFrame':
					jsListeners['onEnterFrame'] = listener;
					VP.addEventListener(StreamEvent.ENTER_FRAME, onEnterFrame);
					break;
				case 'onRecordingAborted':
					jsListeners['onRecordingAborted'] = listener;
					VP.addEventListener(RecordingEvent.ABORTED, onRecordingAborted);
					break;
				case 'onRecordingFinished':
					jsListeners['onRecordingFinished'] = listener;
					VP.addEventListener(RecordingEvent.END, onRecordingFinished);
					break;
				case 'onVideoStartedPlaying':
					jsListeners['onVideoStartedPlaying'] = listener;
					VP.addEventListener(VideoPlayerEvent.VIDEO_STARTED_PLAYING, onVideoStartedPlaying);
					break;
				case 'onMetadataRetrieved':
					jsListeners['onMetadataRetrieved'] = listener;
					VP.addEventListener(VideoPlayerEvent.METADATA_RETRIEVED, onMetadataRetrieved);
				case 'onVideoPlayerReady':
					//jsListeners['onVideoPlayerReady'] = listener;
					//VP.addEventListener(VideoPlayerEvent.CONNECTED, onVideoPlayerReady);
					break;
				default:
					break;
			}
		}
		
		private function removeEventListener(event:String, listener:String):void{
			
			if(!listener)
				return;		
			
			switch(event){
				case 'onEnterFrame':
					if(jsListeners['onEnterFrame'])
						delete jsListeners['onEnterFrame'];
					VP.removeEventListener(StreamEvent.ENTER_FRAME, onEnterFrame);
					break;
				case 'onRecordingAborted':
					if(jsListeners['onRecordingAborted'])
						delete jsListeners['onRecordingAborted'];
					VP.removeEventListener(RecordingEvent.ABORTED, onRecordingAborted);
					break;
				case 'onRecordingFinished':
					if(jsListeners['onRecordingFinished'])
						delete jsListeners['onRecordingFinished'];
					VP.removeEventListener(RecordingEvent.END, onRecordingFinished);
					break;
				case 'onVideoStartedPlaying':
					if(jsListeners['onVideoStartedPlaying'])
						delete jsListeners['onVideoStartedPlaying'];
					VP.removeEventListener(VideoPlayerEvent.VIDEO_STARTED_PLAYING, onVideoStartedPlaying);
					break;	
				case 'onMetadataRetrieved':
					if(jsListeners['onMetadataRetrieved'])
						delete jsListeners['onMetadataRetrieved'];
					VP.removeEventListener(VideoPlayerEvent.METADATA_RETRIEVED, onMetadataRetrieved);
				default:
					break;
			}
		}
		
	}
}