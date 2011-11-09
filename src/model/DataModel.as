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
		
		public function DataModel(){
			netConnection = new NetConnection();
		}
		
		public static function getInstance():DataModel
		{
			if ( !instance )
				instance = new DataModel();
			return instance;
		}
		
		//NetConnection management variables
		public var netConnection:NetConnection;
		[Bindable] public var netConnected:Boolean;
		[Bindable] public var netConnectOngoingAttempt:Boolean;
		
		//Exercise uploading related data
		public var server: String = "embedbabelium";
		public var red5Port: String = "1935";
		public var uploadDomain:String = "http://"+server+"/";
		[Bindable] public var streamingResourcesPath:String = "rtmp://" + server + "/oflaDemo";
		public var evaluationStreamsFolder:String="evaluations";
		public var responseStreamsFolder:String="responses";
		public var exerciseStreamsFolder:String="exercises";
		
		// Variables to manage the input devices
		public var microphone:Microphone;
		public var camera:Camera;
		public var micCamAllowed:Boolean = false;
		public var cameraWidth:int = 320;
		public var cameraHeight:int = 240;
		
		/**
		 *
		 * @param uri
		 * @param proxy
		 * @param encoding
		 */
		public function connect(uri:String, proxy:String='none', encoding:uint=3):void
		{
			//We check if another connect attempt is still ongoing
			if (!netConnectOngoingAttempt)
			{
				netConnectOngoingAttempt = true;
				
				// Initialize the NetConnection in the model.
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
					trace("Connecting to " + uri);
					// Create connection with the server.
					netConnection.connect(uri);
				}
				catch (e:ArgumentError)
				{
					// Invalid parameters.
					switch (e.errorID)
					{
						case 2004:
							trace("Invalid server location: " + uri);
							netConnectOngoingAttempt = false;
							netConnected=false;
							break;
						default:
							netConnectOngoingAttempt = false;
							netConnected=false;
							break;
					}
				}
				catch (e:IOError)
				{
					netConnectOngoingAttempt = false;
					netConnected=false;
				}
				catch (e:SecurityError)
				{
					netConnectOngoingAttempt = false;
					netConnected=false;
				}
			}
		}
		
		/**
		 *
		 *
		 */
		public function close():void
		{
			// Close the NetConnection.
			if(netConnection){
				netConnection.close();
			}
		}
		
		/**
		 *
		 * @param event
		 */
		protected function netStatus(event:NetStatusEvent):void
		{
			netConnectOngoingAttempt = false;
			
			var info:Object=event.info;
			var statusCode:String=info.code;
			
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
					netConnected = false;
					trace("Connection to server failed");
					break;
				
				case "NetConnection.Connect.Closed":
					netConnected = false;
					trace("Connection to server closed");
					break;
				
				case "NetConnection.Connect.InvalidApp":
					netConnected = false;
					trace("Application not found on server");
					break;
				
				case "NetConnection.Connect.AppShutDown":
					netConnected = false;
					trace("Application has been shutdown");
					break;
				
				case "NetConnection.Connect.Rejected":
					netConnected = false;
					trace("No permissions to connect to the application");
					break;
				
				default:
					// statements
					break;
			}
		}
		
		/**
		 * The Red5 oflaDemo returns bandwidth stats.
		 */
		public function onBWDone():void
		{
			
		}
		
		/**
		 *
		 * @param event
		 */
		protected function netSecurityError(event:SecurityErrorEvent):void
		{
			netConnectOngoingAttempt = false;
			trace("Security error - " + event.text);
		}
		
		/**
		 *
		 * @param event
		 */
		protected function netIOError(event:IOErrorEvent):void
		{
			netConnectOngoingAttempt = false;
			trace("Input/output error - " + event.text);
		}
		
		/**
		 *
		 * @param event
		 */
		protected function netASyncError(event:AsyncErrorEvent):void
		{
			netConnectOngoingAttempt = false;
			trace("Asynchronous code error - " + event.error);
		}	

	}
}