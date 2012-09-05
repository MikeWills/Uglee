/* ============== */
/* Log - Log the information to the console */
/* ============== */
global.Log = function(data) {
	if (logtoconsole) {
		var now = new Date();
		console.log(botName, ">>>", now.toLocaleString(), " | ", data);
	}
};

global.Speak = function(text) {
	try {
		bot.speak(text);
	} catch (e){
		Log(color("**ERROR** Speak() ", "red") + e);
	}
};

global.TellUser = function(userid, text) {
	try {
		if (NoPM()){ bot.speak(text); } 
		else { bot.pm(text, userid); }
	} catch (e){
		Log(color("**ERROR** TellUser() ", "red") + e);
	}
};

global.SpeakRandom = function(array){
	var rand = Math.ceil(Math.random() * array.length);
	Speak(array[rand]);
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
}