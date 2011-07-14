function cuePointManager(){
	
	this.cuelist=[];//new ArrayCollection();
	this.cpmExerciseId=-1;
	this.subtitleId=-1;
	
	this.roleColors = [0xffffff, 0xfffd22, 0x69fc00, 0xfd7200, 0x056cf9, 0xff0f0b, 0xc314c9, 0xff6be5];
	this.colorDictionary = [];

	
	this.reset = function(){
		cpmExerciseId=-1;
		subtitleId=-1;
		cuelist = [];
	}
	

	this.setVideo = function(videoId){
		this.cpmExerciseId=videoId;
	}
	

	this.currentSubtitle = function(){
		return subtitleId;
	}
	
	this.addCue = function(cueobj){
		cuelist.push(cueobj);
		cuelist.sort(sortByStartTime);
	}

	this.setCueAt = function(cueobj, pos){
		cuelist.setItemAt(cueobj, pos);
	}

	this.getCueAt = function(pos){
		return cuelist[pos];
	}

	this.removeCueAt = function(pos){
		return cuelist.removeItemAt(pos);
	}

	this.getCueIndex = function(cueobj){
		return cuelist.getItemIndex(cueobj);
	}

	this.removeAllCue = function(){
		cuelist = [];
	}

	this.setCueList = function (cuelist){
		this.cuelist=cuelist;
	}
	
	this.sortByStartTime = function(a,b){
		if (a.startTime > b.startTime) return 1;
		if (a.startTime < b.startTime) return -1;
		return 0;
	}
	
	this.sortByEndTime = function(a,b){
		if (a.endTime > b.endTime) return 1;
		if (a.endTime < b.endTime) return -1;
		return 0;
	}

	this.setCueListStartCommand = function(command){
		for (var i in cuelist){
			cuelist[i].setStartCommand(command);
		}
	}

	this.setCueListEndCommand = function(command){	
		for (var i in cuelist){
			cuelist[i].setEndCommand(command);
		}
	}

	/**
	 * Callback function - OnEnterFrame
	 *
	 **/
	//streamevent
	this.monitorCuePoints = function(ev){
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
	this.setCuesFromSubtitleUsingLocale = function(language){
		var subtitle = {'id': 0, 'exerciseId' : this.cpmExerciseId, 'language': language};
		
		var srvClass = 'Subtitle';
		var srvMethod = 'getSubtitleLines';
		var srvParams = base64_encode(JSON.stringify(subtitle));
		
		var srvQueryString = server + '?class=' + srvClass + '&method=' + srvMethod + '&arg=' + srvParams;
		$.getJSON(srvQueryString, this.subtitlesRetrievedCallback).error(function(){ 
			alert("Error while retrieving subtitle lines") 
		});
	}

	this.setCuesFromSubtitleUsingId = function(subtitleId){
		
		var srvClass = 'Subtitle';
		var srvMethod = 'getSubtitleLinesUsingId';
		var srvParams = subtitleId;
		
		var srvQueryString = server + '?class=' + srvClass + '&method=' + srvMethod + '&arg=' + srvParams;
		$.getJSON(srvQueryString, this.subtitlesRetrievedCallback).error(function(){ 
			alert("Error while retrieving subtitle lines") 
		});
		
	}
	
	
	this.subtitlesRetrievedCallback = function(data){
		var result=data.Subtitle.getSubtitleLines;
		colorDictionary = [];
		
		for (var i in result){
			
			if(typeof result[i] == 'object')
				console.log(result[i]);
				this.addCueFromSubtitleLine(result[i]);
			}
		this.subtitleId=result[0].subtitleId;
		console.log(this.subtitleId);
		
		//dispatchEvent(new CueManagerEvent(CueManagerEvent.SUBTITLES_RETRIEVED));
	}

	//subtitlelinevo
	this.addCueFromSubtitleLine = function(subline){
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
	this.getCuelist = function(){
		return cuelist;
	}

	/**
	 * Return cuepoint list in array mode with startTime and role
	 **/
	this.cues2rolearray = function(){
		var arrows = [];
		var cuelist = this.getCuelist();
		for (var i in cuelist)
			arrows.push({'startTime': cuelist[i].startTime, 'endTime': cuelist[i].endTime, 'role': cuelist[i].role});

		return arrows;
	}


	
	
	
}