function cuePointManager(){
	
	this.cuelist=[];//new ArrayCollection();
	this.exerciseId=-1;
	this.subtitleId=-1;
	
	//this.cache={};
	//this.cached=false;
	
	this.roleColors = [0xffffff, 0xfffd22, 0x69fc00, 0xfd7200, 0x056cf9, 0xff0f0b, 0xc314c9, 0xff6be5];
	this.colorDictionary = [];

	
	this.prototype.reset = function(){
		exerciseId=-1;
		subtitleId=-1;
		//cached=false;
		cuelist = [];
	}
	

	this.prototype.setVideo = function(videoId){
		this.exerciseId=videoId;

		/*
		if (cache[this.exerciseId] != null)
		{
			var cachedCuelist:CueObjectCache=cache[this.exerciseId] as CueObjectCache;

			if (cachedCuelist.getCachedTime() + 300000 > flash.utils.getTimer())
			{
				this.setCueList(cachedCuelist.getCueList());
				return true;
			}
		}
		*/
		return false;
	}
	

	this.prototype.currentSubtitle = function(){
		return subtitleId;
	}
	
	this.prototype.addCue = function(cueobj){
		cuelist.push(cueobj);
		cuelist.sort(sortByStartTime);
	}

	this.prototype.setCueAt = function(cueobj, pos){
		cuelist.setItemAt(cueobj, pos);
	}

	this.prototype.getCueAt = function(pos){
		return cuelist[pos];
	}

	this.prototype.removeCueAt = function(pos){
		return cuelist.removeItemAt(pos);
	}

	this.prototype.getCueIndex = function(cueobj){
		return cuelist.getItemIndex(cueobj);
	}

	this.prototype.removeAllCue = function(){
		cuelist = [];
	}

	this.prototype.setCueList = function (cuelist){
		this.cuelist=cuelist;
		saveCache(); // auto-cache
	}
	
	this.prototype.sortByStartTime = function(a,b){
		if (a.startTime > b.startTime) return 1;
		if (a.startTime < b.startTime) return -1;
		return 0;
	}
	
	this.prototype.sortByEndTime = function(a,b){
		if (a.endTime > b.endTime) return 1;
		if (a.endTime < b.endTime) return -1;
		return 0;
	}

	this.prototype.setCueListStartCommand = function(command){
		for (var i in cuelist){
			cuelist[i].setStartCommand(command);
		}
	}

	this.prototype.setCueListEndCommand = function(command){	
		for (var i in cuelist){
			cuelist[i].setEndCommand(command);
		}
	}


	/**
	 * Save cache of cuepoints
	 **/
	this.prototype.saveCache = function(){
		if (cache[this.exerciseId] != null)
		{
			var cachedVideo:CueObjectCache=cache[this.exerciseId] as CueObjectCache;
			cachedVideo.setCachedTime(flash.utils.getTimer());
			cachedVideo.setCueList(cuelist);
		}
		else
		{
			cache[this.exerciseId]=new CueObjectCache(flash.utils.getTimer(), cuelist);
		}
	}


	/**
	 * Callback function - OnEnterFrame
	 *
	 **/
	//streamevent
	this.prototype.monitorCuePoints = function(ev){
		var curTime=ev.time;

		for (var i in cuelist)
		{
			if (((curTime - 0.08) < cuelist[i].startTime && cuelist[i].startTime < (curTime + 0.08)))
			{
				cuelist[i].executeStartCommand();
				break;
			}

			if (((curTime - 0.08) < cuelist[i].endTime && cuelist[i].endTime < (curTime + 0.08)))
			{
				cuelist[i].executeEndCommand();
				break;
			}
		}
	}


	/**
	 * Get cuepoints from subtitle
	 **/
	this.prototype.setCuesFromSubtitleUsingLocale = function(language){
		var subtitle:SubtitleAndSubtitleLinesVO=new SubtitleAndSubtitleLinesVO();
		subtitle.exerciseId=this.exerciseId;
		subtitle.language=language;

		// add this manager as iresponder and get subtitle lines
		new SubtitleDelegate(this).getSubtitleLines(subtitle);
	}

	this.prototype.setCuesFromSubtitleUsingId = function(subtitleId){
		new SubtitleDelegate(this).getSubtitleLinesUsingId(subtitleId);
	}

	//subtitlelinevo
	this.prototype.addCueFromSubtitleLine = function(subline){
		var found = false;
		var color = roleColors[0];
		for(var i=0; i < colorDictionary.length; i++){
			if(colorDictionary[i] == subline.exerciseRoleId){
				found = true;
				color = roleColors[i];
				break;
			}
		}
		if(!found){
			colorDictionary.push(subline.exerciseRoleId);
			color = roleColors[colorDictionary.length-1];
		}
		
		var cueObj=new CueObject(subline.subtitleId, subline.showTime, subline.hideTime, subline.text, subline.exerciseRoleId, subline.exerciseRoleName,null,null,color);
		this.addCue(cueObj);
	}

	/**
	 * Getting cuelists for set their commands
	 **/
	this.prototype.getCuelist = function(){
		return cuelist;
	}

	/**
	 * Return cuepoint list in array mode with startTime and role
	 **/
	this.prototype.cues2rolearray = function(){
		var arrows = [];
		var cuelist = this.getCuelist();
		for each (var i in cuelist)
			arrows.push({startTime: cuelist[i].startTime, endTime: cuelist[i].endTime, role: cuelist[i].role});

		return arrows;
	}


	/**
	 * Implements IResponder methods for subtitle lines retrieve
	 **/
	this.prototype.result = function(data){
		var result=data.result;

		if (typeof result == 'object' && !isEmpty(result))
		{
			var resultCollection:ArrayCollection=new ArrayCollection(ArrayUtil.toArray(result));

			if (resultCollection.length > 0 && resultCollection.getItemAt(0) is SubtitleLineVO)
			{
				colorDictionary = new Array();
				for (var i:int=0; i < resultCollection.length; i++)
				{
					addCueFromSubtitleLine(resultCollection.getItemAt(i) as SubtitleLineVO);
				}
				subtitleId=(resultCollection.getItemAt(0) as SubtitleLineVO).subtitleId;
			}
		}
		//sortByStartTime();

		dispatchEvent(new CueManagerEvent(CueManagerEvent.SUBTITLES_RETRIEVED));
	}

	this.prototype.fault = function(info){
		var faultEvent:FaultEvent=info as FaultEvent;
		CustomAlert.error(ResourceManager.getInstance().getString('myResources','ERROR_WHILE_RETRIEVING_SUBTITLE_LINES'));
	}
	
	
}