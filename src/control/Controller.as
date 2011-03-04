package control {
	import com.adobe.cairngorm.control.FrontController;
	
	import commands.*;
	import events.*;

	public class Controller extends FrontController {
		//All the application's actions are managed from this controller
		public function Controller() {
			super();
			
			//Connection management commands
			addCommand(SetupConnectionEvent.EVENT_SETUP_CONNECTION, SetupConnectionCommand);
			addCommand(StartConnectionEvent.EVENT_START_CONNECTION, StartConnectionCommand);
			addCommand(CloseConnectionEvent.EVENT_CLOSE_CONNECTION, CloseConnectionCommand);

		}

	}
}