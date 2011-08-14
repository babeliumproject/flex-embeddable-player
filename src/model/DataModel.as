package model
{
	import business.NetConnectionDelegate;
	
	import com.adobe.cairngorm.model.IModelLocator;
	
	import flash.media.Camera;
	import flash.media.Microphone;
	import flash.net.FileReference;
	import flash.net.NetConnection;
	import flash.utils.Dictionary;
	
	import mx.collections.ArrayCollection;
	
	
	public class DataModel implements IModelLocator
	{
		//This solution for singleton implementation was found in
		//http://life.neophi.com/danielr/2006/10/singleton_pattern_in_as3.html		
		public static var instance:DataModel = new DataModel();
		
		[Bindable] public static var GAPS_TO_ABORT_RECORDING:int = 3;
		
		//NetConnection management variables
		[Bindable] public var netConnectionDelegate:NetConnectionDelegate;
		[Bindable] public var netConnection:NetConnection;
		[Bindable] public var netConnected:Boolean;
		[Bindable] public var netConnectOngoingAttempt:Boolean;
		
		//Exercise uploading related data
		[Bindable] public var server: String = "localhost";
		[Bindable] public var red5Port: String = "1935";
		[Bindable] public var uploadDomain:String = "http://"+server+"/";
		[Bindable] public var streamingResourcesPath:String = "rtmp://" + server + "/oflaDemo";
		[Bindable] public var evaluationStreamsFolder:String="evaluations";
		[Bindable] public var responseStreamsFolder:String="responses";
		[Bindable] public var exerciseStreamsFolder:String="exercises";
		
		// Variables to manage the input devices
		[Bindable] public var microphone:Microphone;
		[Bindable] public var camera:Camera;
		[Bindable] public var micCamAllowed:Boolean = false;
		[Bindable] public var gapsWithNoSound:int = 0;
		[Bindable] public var soundDetected:Boolean = false;
		[Bindable] public var cameraWidth:int = 320;
		[Bindable] public var cameraHeight:int = 240;
		
		public function DataModel(){
			if (instance)
				throw new Error("DataModel can only be accessed through DataModel.getInstance()");
		}
		
		public static function getInstance():DataModel{
			return instance;
		}

	}
}