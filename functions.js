/* ============== */
/* Log - Log the information to the console */
/* ============== */
global.Log = function(data) {
	if (logtoconsole) {
		var now = new Date();
		console.log(botName, ">>>", now.toLocaleString(), " | ", data);
	}
};

global.Speak = function(text, userName) {
	var textOut = "";

	if (userName !== undefined) { textOut = text.replace(/\{u\}/gi, userName); } 
	else { textOut = text; }
	
	try {
		bot.speak(textOut);
	} catch (e){
		Log(color("**ERROR** Speak() ", "red") + e);
	}
};

global.TellUser = function(userid, text) {
	var textOut = "";
	try {
		if (NoPM()){ bot.speak(text); } 
		else { bot.pm(text, userid); }
	} catch (e){
		Log(color("**ERROR** TellUser() ", "red") + e);
	}
};

global.SpeakRandom = function(array, userName){
	var textOut = "";
	var rand = Math.ceil(Math.random() * array.length) - 1;

	if (userName !== undefined) { textOut = array[rand].replace(/\{u\}/gi, userName); } 
	else { textOut = array[rand]; }

	Speak(textOut);
}

global.IsMod = function(userid, callback){
	bot.roomInfo(data, function(){
		var moderators = data.room.metadata.moderator_id;
		if (moderators.indexOf(userid) != -1) { callback(true); } 
		else { callback(false); }
	})
}

global.NoPM = function(userid){
	return false;
}

global.Command = function(source, data) {
	var isPM = source === "pm" ? true : false;

	if (data.text.toLowerCase() == "dance"){
		AwesomeSong();
	}
}

global.AwesomeSong = function(){
	danceCount++;
	if (danceCount > 1){
		bot.vote("up");
		SpeakRandom(awesomeText);
	}
}

global.LameSong = function(){
	lameCount++;
	if (lameCount > 1){
		bot.vote("down");
		SpeakRandom(lameText);
	}
}

global.didUserLeaveQuickly = function(userid){
	var now = new Date();
	var loggedIn = AllUsers[userid].loggedIn;
	var timeOn = now = loggedIn;
	Log("Logged in time: " + timeOn);
	if (now - AllUsers[userid].lastActivity < 30000){
		SpeakRandom(userLeaveQuickText);
	}
}