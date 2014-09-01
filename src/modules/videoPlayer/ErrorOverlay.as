package modules.videoPlayer
{
	import flash.display.Bitmap;
	import flash.display.GradientType;
	import flash.display.Loader;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.filters.DropShadowFilter;
	import flash.geom.Matrix;
	import flash.net.URLRequest;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFieldType;
	import flash.text.TextFormat;
	
	import model.ConnectionManager;
	
	import mx.resources.ResourceBundle;
	import mx.resources.ResourceManager;
	
	public class ErrorOverlay extends Sprite
	{
		
		private var dWidth:uint = 640;
		private var dHeight:uint = 480;

		private var box:Shape;
		private var errorMsg:TextField;
		private var text:String;
		
		private var backgrImg:Bitmap;
		
		public function ErrorOverlay()
		{
			super();
			loadAsset(ConnectionManager.getInstance().uploadDomain+"resources/images/popup_bgr_wrong.png");
			text = ResourceManager.getInstance().getString('myResources',"NO_CONNECTION") ? ResourceManager.getInstance().getString('myResources',"NO_CONNECTION") : "Communication lost. Trying to reconnect...";
			updateChildren(dWidth,dHeight);
		}
		
		public function setText(msg:String):void{
			if(msg.length)
				text = msg;
			updateChildren(0,0); //keep current dimensions
		}
		
		public function updateChildren(nWidth:Number, nHeight:Number):void{
			if(nWidth && nHeight){
				dWidth = nWidth;
				dHeight = nHeight;
			}
			
			var nWidthBox:Number = dWidth*0.85;
			var nHeightBox:Number = dHeight*0.8;
			if(box != null && this.contains(box))
				this.removeChild(box);
			if(backgrImg != null && this.contains(backgrImg))
				this.removeChild(backgrImg);
			if(errorMsg != null && this.contains(errorMsg))
				this.removeChild(errorMsg);
			
			this.graphics.clear();
			this.graphics.beginFill(0x000000,1);
			this.graphics.drawRect(0,0,dWidth,dHeight);
			this.graphics.endFill();		
			
			box = new Shape();
			var matr:Matrix = new Matrix();
			matr.createGradientBox(nWidthBox, nHeightBox, 90*Math.PI/180, 0, 0);
			box.graphics.clear();
			box.graphics.beginGradientFill(GradientType.LINEAR, [0xF5F5F5,0xE6E6E6], [1,1],[120,255],matr);
			box.graphics.lineStyle(1, 0xa7a7a7);
			box.graphics.drawRect(dWidth/2-(nWidthBox/2),dHeight/2-(nHeightBox/2),nWidthBox,nHeightBox);
			
			box.graphics.endFill();
			
			var _textFormat:TextFormat = new TextFormat();
			_textFormat.align = "center";
			_textFormat.font = "Arial";
			_textFormat.bold = true;
			_textFormat.size = Math.floor(nHeightBox * .08);
		
			errorMsg = new TextField();
			errorMsg.text = text; 
			errorMsg.setTextFormat(_textFormat);
			errorMsg.width = dWidth * .8;
			errorMsg.autoSize = TextFieldAutoSize.CENTER;
			errorMsg.wordWrap=true;
			//errorMsg.background=true; //position debug
			//errorMsg.backgroundColor=0xff0000;
			errorMsg.x = dWidth/2 - errorMsg.width/2;
			errorMsg.y = dHeight/2 - errorMsg.height/2;
			
			this.addChild(box);
			this.addChild(errorMsg);
			
			if(backgrImg){
				backgrImg.width=191;
				backgrImg.height=192;
				
				var scaleC:Number= nHeightBox * .9 / backgrImg.height;
				
				backgrImg.x = (dWidth/2) + (nWidthBox/2) - (backgrImg.width * scaleC);
				backgrImg.y = (dHeight/2) - (nHeightBox/2);
				
				
				backgrImg.width*=scaleC;
				backgrImg.height*=scaleC;
				
				this.addChild(backgrImg);
			}
		}
		
		private function loadAsset(url:String):void{
			var loader:Loader = new Loader();
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE, completeHandler);
			loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
			
			var request:URLRequest = new URLRequest(url);
			loader.load(request);
		}
		
		private function completeHandler(event:Event):void{
			var loader:Loader = Loader(event.target.loader);
			backgrImg = Bitmap(loader.content);
		}
		
		private function ioErrorHandler(event:IOErrorEvent):void{
			trace("Unable to load image: " + event);
		}
	}
}