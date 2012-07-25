package model
{
	import flash.errors.IOError;
	import flash.events.AsyncErrorEvent;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.media.Camera;
	import flash.media.Microphone;
	import flash.net.FileReference;
	import flash.net.NetConnection;
	import flash.utils.Dictionary;


	public class DataModel
	{
		//This solution for singleton implementation was found in
		//http://life.neophi.com/danielr/2006/10/singleton_pattern_in_as3.html		
		public static var instance:DataModel;

		public function DataModel()
		{
			netConnection=new NetConnection();
		}

		public static function getInstance():DataModel
		{
			if (!instance)
				instance=new DataModel();
			return instance;
		}
		
		//Streaming constants
		public static const RTMP:String = "rtmp";
		public static const RTMPT:String = "rtmpt";
		public static const RTMPS:String = "rtmps";
		public static const RTMPE:String = "rtmpe";
		
		public static const RTMP_PORT:uint=1935;
		public static const RTMPT_PORT:uint=80;

		//NetConnection management variables
		public var netConnection:NetConnection;
		public var bandwidthInfo:Object;
		[Bindable] public var netConnected:Boolean;
		[Bindable] public var netConnectOngoingAttempt:Boolean;

		//Domain setup
		public var server:String='embedbabelium';
		public var uploadDomain:String="http://" + server + "/";
		
		//Streaming resource setup
		[Bindable] public var streamingResourcesPath:String=streamingProtocol+"://" + server + ":"+ streamingPort + "/" + streamingApp;
		public var streamingProtocol:String=RTMP;
		public var streamingPort:uint=RTMP_PORT;
		public var streamingApp:String="vod";
		public var evaluationStreamsFolder:String="evaluations";
		public var responseStreamsFolder:String="responses";
		public var exerciseStreamsFolder:String="exercises";
		
		// Variables to manage the input devices
		public var microphone:Microphone;
		public var camera:Camera;
		public var micCamAllowed:Boolean=false;
		public var cameraWidth:int=320;
		public var cameraHeight:int=240;
		
		private var encapsulateRTMP:Boolean=false;
		private var proxy:String='none';
		private var encoding:uint=3;

		/**
		 * Attempts to connect to the streaming server using the settings of DataModel and the provided proxy and AMF encodings
		 * @param proxy
		 * @param encoding
		 */
		public function connect(proxy:String='none', encoding:uint=3):void
		{
			this.proxy=proxy;
			this.encoding=encoding;
			//We check if another connect attempt is still ongoing
			if (!netConnectOngoingAttempt)
			{
				netConnectOngoingAttempt=true;

				if(netConnection)
					netConnection = new NetConnection();
				netConnection.client=this;

				netConnection.objectEncoding=encoding;
				netConnection.proxyType=proxy;
				// Setup the NetConnection and listen for NetStatusEvent and SecurityErrorEvent events.
				netConnection.addEventListener(NetStatusEvent.NET_STATUS, netStatus);
				netConnection.addEventListener(AsyncErrorEvent.ASYNC_ERROR, netASyncError);
				netConnection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, netSecurityError);
				netConnection.addEventListener(IOErrorEvent.IO_ERROR, netIOError);
				// connect to server
				try
				{
					streamingProtocol = encapsulateRTMP ?  RTMPT : RTMP;
					streamingPort = encapsulateRTMP ?  RTMPT_PORT : RTMP_PORT;
					streamingResourcesPath = streamingProtocol+"://"+server+":"+streamingPort+"/"+streamingApp;
					trace("Connecting to " + streamingResourcesPath);
					// Create connection with the server.
					netConnection.connect(streamingResourcesPath);
				}
				catch (e:ArgumentError)
				{
					// Invalid parameters.
					switch (e.errorID)
					{
						case 2004:
							trace("Invalid server location: " + streamingResourcesPath);
							netConnectOngoingAttempt=false;
							netConnected=false;
							break;
						default:
							trace("Undetermined problem while connecting with: " + streamingResourcesPath);
							netConnectOngoingAttempt=false;
							netConnected=false;
							break;
					}
				}
				catch (e:IOError)
				{
					trace("IO error while connecting to: " + streamingResourcesPath);
					netConnectOngoingAttempt=false;
					netConnected=false;
				}
				catch (e:SecurityError)
				{
					trace("Security error while connecting to: " + streamingResourcesPath);
					netConnectOngoingAttempt=false;
					netConnected=false;
				}
				catch (e:Error)
				{
					trace("Unidentified error while connecting to: " + streamingResourcesPath);
					netConnectOngoingAttempt=false;
					netConnected=false;
				}
			}
		}

		/**
		 * Closes the currently active NetConnection
		 */
		public function close():void
		{
			if (netConnection)
			{
				netConnection.close();
			}
		}

		/**
		 * Callback dispatched when info about the current connection attempt is received from the server
		 * @param event
		 */
		protected function netStatus(event:NetStatusEvent):void
		{
			netConnectOngoingAttempt=false;

			var info:Object=event.info;
			var statusCode:String=info.code;

			try
			{
				switch (statusCode)
				{
					case "NetConnection.Connect.Success":
						//Set a flag in the model to denote the successful connection
						netConnected=true;

						// find out if it's a secure (HTTPS/TLS) connection
						if (event.target.connectedProxyType == "HTTPS" || event.target.usingTLS)
							trace("Connected to secure server");
						else
							trace("Connected to server");
						break;

					case "NetConnection.Connect.Failed":
						trace("Connection to server failed");
						if(!encapsulateRTMP)
							encapsulateRTMP = true;
						else
							netConnected=false;
						connect(proxy,encoding);
						break;

					case "NetConnection.Connect.Closed":
						trace("Connection to server closed");
						netConnected=false;
						break;

					case "NetConnection.Connect.InvalidApp":
						trace("Application not found on server");
						netConnected=false;
						break;

					case "NetConnection.Connect.AppShutDown":
						trace("Application has been shutdown");
						netConnected=false;
						break;

					case "NetConnection.Connect.Rejected":
						trace("No permissions to connect to the application");
						netConnected=false;
						break;

					default:
						// statements
						break;
				}
			}
			catch (e:Error)
			{
				trace("NetStatus threw an error: " + e.message);
				netConnected=false;
			}
		}
		
		/**
		 * Details of the ongoing bandwidth measurement between the client and the server
		 * @param info
		 */
		protected function onBWCheck(info:Object=null):void{
			if(info){
				/*
				trace("[bwCheck] count: "+info.count+" cumLatency: "+info.cumLatency+" latency: "+info.latency+" sent: "+info.sent+" timePassed: "+info.timePassed);
				var payload:Array = info.payload as Array;
				var payloadTrace:String = '';
				for (var i:int; i<payload.length; i++){
				payloadTrace += " ("+i+") "+payload[i];
				}
				trace("payload: "+payloadTrace);
				*/
			}
		}
		
		/**
		 * Results of the bandwidth measurement
		 * @param info
		 */
		protected function onBWDone(info:Object=null):void
		{
			if(info){
				bandwidthInfo = info;
				trace("[bwDone] deltaDown: "+info.deltaDown+" deltaTime: "+info.deltaTime+" kbitDown: "+info.kbitDown+" latency: "+info.latency);
			}
		}
		

		/**
		 *
		 * @param event
		 */
		protected function netSecurityError(event:SecurityErrorEvent):void
		{
			netConnectOngoingAttempt=false;
			trace("Security error - " + event.text);
		}

		/**
		 *
		 * @param event
		 */
		protected function netIOError(event:IOErrorEvent):void
		{
			netConnectOngoingAttempt=false;
			trace("Input/output error - " + event.text);
		}

		/**
		 *
		 * @param event
		 */
		protected function netASyncError(event:AsyncErrorEvent):void
		{
			netConnectOngoingAttempt=false;
			trace("Asynchronous code error - " + event.error);
		}

	}
}
