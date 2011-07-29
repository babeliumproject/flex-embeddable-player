function services(){
	this.protocol = 'http://'
	this.host = 'babeliumhtml5/rest/';
	this.endpoint = bpConfig.endpoint;
	this.lastRandomizer = '';
	this.statToken = 'myMusicFightsAgainstTheSystemThatTeachesToLiveAndDie'; //Bob Marley's Quote
	this.commToken = '';
	this.authToken = '';
	this.token = '';
	
	/**
	 * The way callback should be passed is uncertain maybe we should pass it as a String and then use eval() to fetch the actual function. Also since this function
	 * is to be nested inside a class we must prepend the class instance name, in this case should be something like "services.theFunction"
	 */
	this.send() = function(secured,method,parameters,callback){
		this.protocol = secured ? 'https://' : 'http://';
		var qs = this.protocol + this.host + '?method=' + method + '&arg=' + p;
		$.getJSON(qs, function(data){
			eval(callback);
		}).error(function(error){
			services.onServiceError(error);
		});
		
		
		$.getJSON(srvQueryString, function(data){
			//Make the call using the global scope object cueManager because this subclass has no access to the methods as is
			cueManager.subtitlesRetrievedCallback(data);
		}).error(function(){ 
			alert("Error while retrieving subtitle lines"); 
		});
		
	}
	
	this.getCommunicationToken = function(){
		var method = 'getCommunicationToken';
		var t = hex_md5(bpConfig.sessionID);
		var p = {};
		p.method = method;
		p.parameters = {"secretKey": t};
		p.header = {"session": bpConfig.sessionID, "uuid": bpConfig.uuid};
		
		this.send(true,method,p,onCommunicationTokenSuccess);
	}
	
	this.authenticateUser = function(username, pass, rememberUser){
		var method = 'authenticateUser';
		var t = this.generateToken(method);
		var p = {};
		p.method = method;
		p.parameters = {"password": pass, "savePassword": rememberUser, "username": user};
		p.header = {"token": t, "session": bpConfig.sessionID, "uuid": bpConfig.uuid};
		
		this.send(true,method,p,onAuthenticateUserSuccess);
	}
	
	this.onCommunicationTokenSuccess = function(data){
		//The request to the server was successful, now we should check if the response if right or not
		
		//Retrieve the communicationToken and store it for future use
		this.commToken = '';
	}
	
	this.onAuthenticateUserSuccess = function(data){
		//The request to the server was successful, now we should check if the response if right or not
		
		//Retrieve the userID and the authToken
	}
	
	this.onServiceError = function(error){
		//Display an error message noticing the user that the request to the server was not successful.
	}
	
	this.createRandomSalt = function(){
		var randomizer = '';
		var charsGenerated = 0;
		while (charsGenerated < 6){
			randomizer = randomizer + (Math.floor(Math.random() * 16)).toString(16);
			charsGenerated++;
		}
		return randomizer !== this.lastRandomizer ? (randomizer) : (createRandomSalt());
	}

	this.generateToken = function (method){
		var salt = createRandomSalt();
		var t = hex_sha1(method + ":" + this.commToken + ":" + this.statToken + ":" + salt);
		var s = salt + t;
		return s;
	}
	
	
}