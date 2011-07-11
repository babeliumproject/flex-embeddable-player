function cueObject(subtitleId, startTime, endTime=-1, text=null, roleId=0, role=null, startCommand=null, endCommand=null, textColor=0xffffff)
{
	this.subtitleId=subtitleId;
	this.startTime=startTime;
	this.endTime=endTime;
	this.text=text;
	this.roleId=roleId;
	this.role=role;
	this.startCommand=startCommand;
	this.endCommand=endCommand;
	this.textColor=textColor;
		
	this.startCommand;
	this.endCommand;

	this.prototype.executeStartCommand = function(){
		startCommand.execute();
	}
		
	this.prototype.executeEndCommand = function(){
		endCommand.execute();
	}
		
	this.prototype.setStartCommand = function(command){
		this.startCommand = command;
	}
		
	this.prototype.setEndCommand = function(command){
		this.endCommand=command;
	}

}