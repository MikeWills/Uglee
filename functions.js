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

/* 	==============
	AddSongToDb - Add the song to the database.
	============== */
global.AddSongToDb = function(data) {
	client.query('INSERT INTO ' + dbName + '.' + dbTablePrefix + 'SONG SET artist = ?,song = ?, djid = ?, up = ?, down = ?,' + 'listeners = ?, started = NOW(), snags = ?, bonus = ?', [currentsong.artist, currentsong.song, currentsong.djid, currentsong.up, currentsong.down, currentsong.listeners, currentsong.snags, 0]);
}

/* 	============== 
	DateDiff - Determines the difference between two dates
	============== */
function DateDiff(a, b, format) {
	var milliseconds = a - b;
	var minutes = milliseconds / 60000;
	var days = milliseconds / 86400000;
	var hours = milliseconds / 3600000;
	var weeks = milliseconds / 604800000;
	var months = milliseconds / 2628000000;
	var years = milliseconds / 31557600000;

	if (format == "min") {
		return Math.round(minutes);
	}
	if (format == "h") {
		return Math.round(hours);
	}
	if (format == "d") {
		return Math.round(days);
	}
	if (format == "w") {
		return Math.round(weeks);
	}
	if (format == "m") {
		return Math.round(months);
	}
	if (format == "y") {
		return Math.round(years);
	}
}

/* 	============== 
	SetCacheValue - Sets the value to the DB cache 
	============== */
global.SetCacheValue = function(key, value) {
	if (useDB) {
		mysql.query("SELECT `value` FROM " + dbTablePrefix + "CACHE WHERE `key` = ?", [key], function select(error, results, fields) {
			if (results !== undefined) {
				if (results.length !== 0) {
					mysql.query("UPDATE " + dbTablePrefix + "CACHE SET `value` = ? WHERE `key` = ?", [value, key]);
				} else {
					mysql.query("INSERT INTO " + dbTablePrefix + "CACHE (`key`, `value`, `DateStamp`) VALUES (?, ?, CURRENT_TIMESTAMP)", [key, value]);
				}
			} else {
				mysql.query("INSERT INTO " + dbTablePrefix + "CACHE (`key`, `value`, `DateStamp`) VALUES (?, ?, CURRENT_TIMESTAMP)", [key, value]);
			}
		});
	}
};

/* 	============== 
	GetCacheValue - Gets the value from the DB cache 
	============== */
global.GetCacheValue = function(key, timeout, callback) {
	if (useDB) {
		mysql.query("SELECT `value`, `DateStamp` FROM " + dbTablePrefix + "CACHE WHERE `key` = ?", [key], function select(error, results, fields) {
			Log("Results: " + results);
			if (results !== undefined) {
				if (results.length !== 0) {
					var now = new Date();
					if (timeout === 0 || DateDiff(now, results[0]['DateStamp'], 'min') <= timeout) {
						callback(results[0]['value']);
					} else {
						callback(null);
					}
				} else {
					callback(null);
				}
			} else {
				callback(null);
			}
		});
	}
};

/* 	============== 
	RemoveCacheValue - Deletes the value to the DB cache 
	============== */
global.RemoveCacheValue = function(key) {
	if (useDB) {
		mysql.query("DELETE FROM " + dbTablePrefix + "CACHE WHERE `key` = ?", [key]);
	}
};

/* 	============== 
	SetUpDatabase - Setup the database for the bot to use 
	============== */
global.SetUpDatabase = function() {
	//Creates DB and tables if needed, connects to db
	mysql.query('CREATE DATABASE ' + dbName, function(error) {
		if (error && error.number != mysql.ERROR_DB_CREATE_EXISTS) {
			throw (error);
		}
	});
	mysql.query('USE ' + dbName);

	//song table
	mysql.query('CREATE TABLE ' + dbTablePrefix + 'Song(id INT(11) AUTO_INCREMENT PRIMARY KEY,' + ' artist VARCHAR(255),' + ' song VARCHAR(255),' + ' djid VARCHAR(255),' + ' up INT(3),' + ' down INT(3),' + ' listeners INT(3),' + ' started DATETIME,' + ' snags INT(3),' + ' bonus INT(3))',

	function(error) {
		//Handle an error if it's not a table already exists error
		if (error && error.number != 1050) {
			throw (error);
		}
	});

	//user table
	mysql.query('CREATE TABLE ' + dbTablePrefix + 'User(userid VARCHAR(255), ' + 'username VARCHAR(255), ' + 'lastseen DATETIME, ' + 'PRIMARY KEY (userid, username))', function(error) {
		//Handle an error if it's not a table already exists error
		if (error && error.number != 1050) {
			throw (error);
		}
	});

	mysql.query("CREATE TABLE IF NOT EXISTS `" + dbTablePrefix + "Cache` (`key` varchar(50) NOT NULL, `value` varchar(4096) NOT NULL, `DateStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)", function(error) {
		//Handle an error if it's not a table already exists error
		if (error && error.number != 1050) {
			throw (error);
		}
	});
};