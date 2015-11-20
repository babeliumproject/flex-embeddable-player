package control
{
	import com.babeliumproject.player.VideoRecorder;
	import com.babeliumproject.player.events.VideoPlayerEvent;
	import com.babeliumproject.player.events.babelia.RecordingEvent;
	import com.babeliumproject.player.events.babelia.StreamEvent;
	
	import flash.events.Event;
	import flash.external.ExternalInterface;
	import flash.utils.Dictionary;
	import flash.utils.getQualifiedClassName;
	
	import mx.collections.ArrayCollection;
	import mx.utils.ObjectUtil;

	
	public class Extern
	{
		private static var instance:Extern;
		
		protected static const LEGAL_JS_FUNCTION_NAME:RegExp=/^[a-zA-Z0-9_.$]+$/;
		
		private var VP:VideoRecorder;
		
		private var jsListeners:Dictionary = new Dictionary();
		

		public function Extern(){
			return;
		}
		
		public static function sanitizeArg(arg:Object):Object
		{
			var argCollection:*=null;
			var item:*=null;
			if (arg == null)
			{
				return null;
			}
			switch (getQualifiedClassName(arg.constructor))
			{
				case "Array":
				case "Object":
				{
					argCollection=arg is Array ? ([]) : ({});
					for (item in arg)
					{
						
						argCollection[checkName(item)]=sanitizeArg(arg[item]);
					}
					return argCollection;
				}
				case "Number":
				case "Boolean":
				{
					return arg;
				}
				case "String":
				{
				}
				default:
				{
					return String(arg).replace(/\\/g, "\\\\").replace(/\r\n/g, " ");
					break;
				}
			}
		}
		
		public static function checkName(param:String):String
		{
			if (param.match(LEGAL_JS_FUNCTION_NAME))
			{
				return param;
			}
			throw new SecurityError("Illegal ExternalInterface call argument \'" + param + "\'.");
		} 

		public function setup(player:VideoRecorder):void
		{
			this.VP = player;
			
			addCallback('disableControls',VP.disableControls);
			addCallback('dispose',VP.dispose);
			addCallback('enableControls',VP.enableControls);
			addCallback('endVideo',VP.endVideo);
			addCallback('forcedMute',VP.forcedMute);
			addCallback('forcedUnMute',VP.forcedUnMute);
			addCallback('getVolume',VP.getVolume);
			addCallback('isMuted',VP.isMuted);
			addCallback('loadVideoByUrl',VP.loadVideoByUrl);
			addCallback('mute',VP.mute);
			addCallback('pauseVideo', VP.pauseVideo);
			addCallback('playVideo', VP.playVideo);
			addCallback('resetComponent',VP.resetComponent);
			addCallback('resumeVideo',VP.resumeVideo);
			addCallback('seekTo',VP.seekTo);
			addCallback('setVolume', VP.setVolume);
			addCallback('stopVideo', VP.stopVideo);
			addCallback('toggleControls',VP.toggleControls);
			addCallback('unMute',VP.unMute);
			
			addCallback('forcedMuteParallel',VP.forcedMuteParallel);
			addCallback('forcedUnMuteParallel',VP.forcedUnMuteParallel);
			addCallback('getMicGain',VP.getMicGain);
			addCallback('hideCaption',VP.hideCaption);
			addCallback('isParallelMuted',VP.isParallelMuted);
			addCallback('loadRecordVideo',VP.loadRecordVideo);
			addCallback('muteParallel', VP.muteParallel);
			addCallback('recordVideo', VP.recordVideo);
			addCallback('removeArrows', VP.removeArrows);
			addCallback('setArrows',VP.setArrows);
			addCallback('setCaptions', VP.setCaptions);
			addCallback('setMicGain', VP.setMicGain);
			addCallback('setTimeMarkers', VP.setTimeMarkers);
			addCallback('showCaption', VP.showCaption);
			addCallback('unattachUserDevices', VP.unattachUserDevices);
			addCallback('unMuteParallel', VP.unMuteParallel);
			
			//Get/set function that should be wrapped
			
			addCallback('enableAutoPlay', function():void{VP.autoPlay=true});
			addCallback('disableAutoPlay', function():void{VP.autoPlay=false});
			addCallback('isAutoPlayEnabled', function():Boolean{ return VP.autoPlay});
			/*
			addCallback('autoScale', VP.autoScale=true);
			addCallback('manualScale', VP.autoScale=false);
			addCallback('isAutoScaled', VP.autoScale);
			addCallback('getDuration', VP.duration);
			addCallback('setHeight', VP.height);
			addCallback('getHeight', VP.height);
			addCallback('seekUsingScrubber',VP.seekUsingScrubber=Boolean);
			addCallback('setSkinUrl',VP.skinUrl);
			addCallback('getVideoDisplayHeight',VP.videoDisplayHeight);
			addCallback('setVideoDisplayHeight', VP.videoDisplayHeight=Number);
			addCallback('getVideoDisplayWidth', VP.videoDisplayWidth);
			addCallback('setVideoDisplayWidth', VP.videoDisplayWidth=Number);
			addCallback('interpolateVideo', VP.videoSmooting=true);
			addCallback('unInterpolateVideo', VP.videoSmooting=false);
			addCallback('isVideoInterpolated', VP.videoSmooting);
			addCallback('setWidth', VP.width=Number);
			addCallback('getWidth', VP.width);
			
			addCallback('displayCaptions', VP.displayCaptions=true);
			addCallback('hideCaptions', VP.displayCaptions=false);
			addCallback('areCaptionsDisplayed',VP.displayCaptions);
			addCallback('highlightedControls', VP.highlight=true);
			addCallback('mateControls', VP.highlight=false);
			addCallback('areControlsHighlighted', VP.highlight);
			addCallback('pollTimeline',VP.pollTimeline=true);
			addCallback('unPollTimeline', VP.pollTimeline=false);
			addCallback('isTimelinePolled', VP.pollTimeline);
			addCallback('getCurrentTime', VP.streamTime);
			addCallback('displaySubtitlingControls', VP.subtitlingControls=true);
			addCallback('hideSubtitlingControls', VP.subtitlingControls=false);
			addCallback('areSubtitlingControlsVisible',VP.subtitlingControls);
			
			onMetaData
			onSubtitlingEvent
			overlayClicked
			*/
			
			//Events
			addCallback("addEventListener",addEventListener);
			addCallback("removeEventListener",removeEventListener);
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
		private function addCallback(functionName:String, closure:Function):void
		{
			ExternalInterface.addCallback(functionName,closure);
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
		public function onVideoPlayerReady():void
		{
			ExternalInterface.call("onPlayerReady", ExternalInterface.objectID);
		}	
		
		public function onUserDeviceAccessDenied(e:RecordingEvent):void{
			ExternalInterface.call(jsListeners['onUserDeviceAccessDenied']);
		}
		
		public function onRecordingEnd(event:RecordingEvent):void{
			ExternalInterface.call(jsListeners['onRecordingEnd']);
		}
		
		public function onVideoPlayerError(event:VideoPlayerEvent):void{
			ExternalInterface.call(jsListeners['onVideoPlayerError'], event.code, event.message);
		}
		
		
		//private function addEventListener(event:String, listener:String):void{ //added generic argument type and count to avoid a Windows Flash player bug
		private function addEventListener(...args):void{
			if(args.length < 2 )
				return;
			var listener:String = (args[1] is String) ? args[1] : null;
			var event:String = (args[0] is String) ? args[0] : null;
			if(!listener || !event)
				return;
			
			switch(event){
				
				case 'onRecordingEnd':
					jsListeners['onRecordingEnd'] = listener;
					VP.addEventListener(RecordingEvent.END, onRecordingEnd);
					break;
				
				case 'onUserDeviceAccessDenied':
					jsListeners['onUserDeviceAccessDenied'] = listener;
					VP.addEventListener(RecordingEvent.USER_DEVICE_ACCESS_DENIED, onUserDeviceAccessDenied);
					break;
				
				case 'onVideoPlayerError':
					jsListeners['onVideoPlayerError'] = listener;
					VP.addEventListener(VideoPlayerEvent.ON_ERROR, onVideoPlayerError);
				
				case 'onVideoPlayerReady':
					jsListeners['onVideoPlayerReady'] = listener;
					VP.addEventListener(VideoPlayerEvent.ON_READY, onVideoPlayerReady);
					break;
				default:
					break;
			}
		}
		
		private function removeEventListener(...args):void{
			if(args.length < 2 )
				return;
			var listener:String = (args[1] is String) ? args[1] : null;
			var event:String = (args[0] is String) ? args[0] : null;
			if(!listener || !event)
				return;
			
			switch(event){
				
				case 'onUserDeviceAccessDenied':
					if(jsListeners['onUserDeviceAccessDenied'])
						delete jsListeners['onUserDeviceAccessDenied'];
					VP.removeEventListener(RecordingEvent.USER_DEVICE_ACCESS_DENIED, onUserDeviceAccessDenied);
					break;
				case 'onRecordingEnd':
					if(jsListeners['onRecordingEnd'])
						delete jsListeners['onRecordingEnd'];
					VP.removeEventListener(RecordingEvent.END, onRecordingEnd);
					break;
				case 'onVideoPlayerError':
					if(jsListeners['onVideoPlayerError'])
						delete jsListeners['onVideoPlayerError'];
					VP.removeEventListener(VideoPlayerEvent.ON_ERROR, onVideoPlayerError);
					break;	
				case 'onVideoPlayerReady':
					if(jsListeners['onVideoPlayerReady'])
						delete jsListeners['onVideoPlayerReady'];
					VP.removeEventListener(VideoPlayerEvent.ON_READY, onVideoPlayerReady);
				default:
					break;
			}
		}
		
	}
}