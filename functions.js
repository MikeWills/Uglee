/* 	==============
	Log - Log the information to the console
	============== */
global.Log = function(data) {
	if (logtoconsole) {
		var now = new Date();
		console.log(botName, ">>>", now.toLocaleString(), " | ", data);
	}
};

/* 	==============
	Speak - Puts text in to the chatroom.
	============== */
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

/* 	==============
	TellUser - If the user can get a PM it sends them a PM otherwise it sends posts in chatroom
	============== */
global.TellUser = function(userid, text) {
	var textOut = "";
	try {
		if (NoPM()){ bot.speak(text); } 
		else { bot.pm(text, userid); }
	} catch (e){
		Log(color("**ERROR** TellUser() ", "red") + e);
	}
};

/* 	==============
	SpeakRandom - Takes an array of options to speak and speaks one of them.
	============== */
global.SpeakRandom = function(array, userName){
	var textOut = "";
	var rand = Math.ceil(Math.random() * array.length) - 1;

	if (userName !== undefined) { textOut = array[rand].replace(/\{u\}/gi, userName); } 
	else { textOut = array[rand]; }

	Speak(textOut);
}

/* 	==============
	IsMod - Checks if the user is a moderator
	============== */
global.IsMod = function(userid, callback){
	bot.roomInfo(data, function(){
		var moderators = data.room.metadata.moderator_id;
		if (moderators.indexOf(userid) != -1) { callback(true); } 
		else { callback(false); }
	})
}

/* 	==============
	NoPM - Checks if the user can't get a PM
	============== */
global.NoPM = function(userid){
	// TODO
	return false;
}

/* 	==============
	Command - This is the main logic for processing commands.
	============== */
global.Command = function(source, data) {
	var isPM = source === "pm" ? true : false;

	if (data.text.toLowerCase() == "dance"){
		AwesomeSong();
	}
}

/* 	==============
	AwesomeSong - Awesome (or vote up) this song.
	============== */
global.AwesomeSong = function(){
	danceCount++;
	if (danceCount > 1){
		bot.vote("up");
		SpeakRandom(awesomeText);
	}
}

/* 	==============
	LameSong - Lame (or down vote) this song.
	============== */
global.LameSong = function(){
	lameCount++;
	if (lameCount > 1){
		bot.vote("down");
		SpeakRandom(lameText);
	}
}

/* 	==============
	DidUserLeaveQuickly - If a person is in the room for less than 30 seonds it'll give a comment.
	============== */
global.DidUserLeaveQuickly = function(userid){
	var now = new Date();
	var loggedIn = AllUsers[userid].loggedIn;
	var timeOn = now = loggedIn;
	Log("Logged in time: " + timeOn);
	if (now - AllUsers[userid].lastActivity < 30000){
		SpeakRandom(userLeaveQuickText);
	}
}

/* 	==============
	PopulateSongData - Gets the require information for a song for further processing.
	============== */
global.PopulateSongData = function(data) {
	currentsong.artist = data.room.metadata.current_song.metadata.artist;
	currentsong.song = data.room.metadata.current_song.metadata.song;
	currentsong.djname = data.room.metadata.current_song.djname;
	currentsong.djid = data.room.metadata.current_song.djid;
	currentsong.up = data.room.metadata.upvotes;
	currentsong.down = data.room.metadata.downvotes;
	currentsong.listeners = data.room.metadata.listeners;
	currentsong.started = data.room.metadata.current_song.starttime;
	currentsong.snags = 0;
}