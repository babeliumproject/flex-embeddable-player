
// Globals
// Major version of Flash required
var requiredMajorVersion = 10;
// Minor version of Flash required
var requiredMinorVersion = 0;
// Minor version of Flash required
var requiredRevision = 0;

// Version check for the Flash Player that has the ability to start Player Product Install (6.0r65)
		var hasProductInstall = DetectFlashVer(6, 0, 65);
	
		// Version check based upon the values defined in globals
		var hasRequestedVersion = DetectFlashVer(requiredMajorVersion, requiredMinorVersion, requiredRevision);
	
		if ( hasProductInstall && !hasRequestedVersion ) {
			// DO NOT MODIFY THE FOLLOWING FOUR LINES
			// Location visited after installation is complete if installation is required
			var MMPlayerType = (isIE == true) ? "ActiveX" : "PlugIn";
			var MMredirectURL = window.location;
	    	document.title = document.title.slice(0, 47) + " - Flash Player Installation";
	    	var MMdoctitle = document.title;
	
			AC_FL_RunContent(
				"src", "http://embedbabelium/playerProductInstall",
				"FlashVars", "MMredirectURL="+MMredirectURL+'&MMplayerType='+MMPlayerType+'&MMdoctitle='+MMdoctitle+"",
				"width", "500",
				"height", "400",
				"align", "middle",
				"id", "Main",
				"quality", "high",
				"bgcolor", "#ffffff",
				"name", "Main",
				"FlashVars", "",
				"allowScriptAccess","always",
				"type", "application/x-shockwave-flash",
				"pluginspage", "http://www.adobe.com/go/getflashplayer",
				"wmode", "window"
			);
		} else if (hasRequestedVersion) {
			// if we've detected an acceptable version
			// embed the Flash Content SWF when all tests are passed
			AC_FL_RunContent(
				"src", "http://embedbabelium/Main",
				"width", "500",
				"height", "400",
				"align", "middle",
				"id", "Main",
				"quality", "high",
				"bgcolor", "#ffffff",
				"FlashVars", "",
				"name", "Main",
				"allowScriptAccess","always",
				"type", "application/x-shockwave-flash",
				"pluginspage", "http://www.adobe.com/go/getflashplayer",
				"wmode", "window"
			);
	  	} else {  // flash is too old or we can't detect the plugin
	    	var alternateContent = 'Alternate HTML content should be placed here. '
	  							 + 'This content requires the Adobe Flash Player. '
	   							 + '<a href=http://www.adobe.com/go/getflash/>Get Flash</a>';
	    	document.write(alternateContent);  // insert non-flash content
	  	}


