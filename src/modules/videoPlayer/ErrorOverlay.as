package modules.videoPlayer
{
	import flash.display.GradientType;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.geom.Matrix;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	
	public class ErrorOverlay extends Sprite
	{
		
		private var dWidth:uint = 640;
		private var dHeight:uint = 480;

		private var box:Shape;
		private var message:TextField;
		
		public function ErrorOverlay()
		{
			super();
			updateChildren(dWidth,dHeight);
			
		}
		
		public function updateChildren(nWidth:Number, nHeight:Number):void{
			
			var nWidthBox:Number = nWidth*0.7;
			var nHeightBox:Number = nHeight*0.3;
			
			if(box != null && this.contains(box))
				this.removeChild(box);
			if(message != null && this.contains(message))
				this.removeChild(message);
			
			this.graphics.clear();
			this.graphics.beginFill(0x000000,1);
			this.graphics.drawRect(0,0,nWidth,nHeight);
			this.graphics.endFill();
			
			
			
			box = new Shape();
			var matr:Matrix = new Matrix();
			matr.createGradientBox(nWidthBox, nHeightBox, 90*Math.PI/180, 0, 0);
			box.graphics.clear();
			box.graphics.beginGradientFill(GradientType.LINEAR, [0xF5F5F5,0xE6E6E6], [1,1],[120,255],matr);
			box.graphics.lineStyle(3, 0x8A8A8A);
			box.graphics.drawRoundRect(nWidth/2-(nWidthBox/2),nHeight/2-(nHeightBox/2),nWidthBox,nHeightBox,16);
			
			box.graphics.endFill();
			
			message = new TextField();
			message.htmlText = "<font size=\"20\" face=\"Arial\">Video server connection unavailable</font>";
			message.selectable = false;
			message.autoSize = TextFieldAutoSize.CENTER;
			message.x = nWidth/2 - message.textWidth/2;
			message.y = nHeight/2 - message.textHeight/2;
			
	
			
			this.addChild(box);
			this.addChild(message);
		}
		
		
	}
}