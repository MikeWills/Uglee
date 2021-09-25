/* 	============== 
	SetCacheValue - Sets the value to the DB cache 
	============== */
global.SetValue = function (key, value, isOption) {
	if (isOption === undefined) {
		isOption = 0;
	}
	client.query("SELECT `value` FROM " + dbName + '.' + dbTablePrefix + "Settings WHERE `roomid` = ? AND `key` = ?", [currentRoomId, key], function select(error, results, fields) {
		Log(results);
		if (results !== undefined) {
			if (results.length !== 0) {
				Log("Updating " + key);
				client.query("UPDATE " + dbName + '.' + dbTablePrefix + "Settings SET `value` = ? WHERE `roomid` = ? AND `key` = ?", [value, currentRoomId, key]);
			} else {
				Log("Inserting " + key);
				client.query("INSERT INTO " + dbName + '.' + dbTablePrefix + "Settings (`roomid`, `key`, `value`, `DateStamp`, `isOption`) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)", [currentRoomId, key, value, isOption]);
			}
		} else {
			Log("Inserting Also " + key);
			client.query("INSERT INTO " + dbName + '.' + dbTablePrefix + "Settings (`roomid`, `key`, `value`, `DateStamp`, `isOption`) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)", [currentRoomId, key, value, isOption]);
		}
		try {
			if (Settings[key] !== undefined) {
				Settings[key].value = value;
			}
		} catch (e) {
			Log(e);
		}
	});
};

/* 	============== 
	GetCacheValue - Gets the value from the DB cache 
	============== */
global.GetValue = function (key, timeout, callback) {
	client.query("SELECT `value`, `DateStamp` FROM " + dbName + '.' + dbTablePrefix + "Settings WHERE `roomid` = ? AND `key` = ?", [currentRoomId, key], function select(error, results, fields) {
		//Log("Results: " + JSON.stringify(results));
		if (results !== undefined) {
			if (results.length !== 0) {
				var now = new Date();
				if (timeout === 0 || DateDiff(now, results[0]['DateStamp'], 'min') <= timeout) {
					try {
						if (Settings[key] !== undefined && Settings[key].value !== results[0]['value']) {
							Settings[key].value = results[0]['value'];
						}
					} catch (e) {
						Log(e);
					}
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
};

/* 	============== 
	RemoveCacheValue - Deletes the value to the DB cache 
	============== */
global.RemoveValue = function (key) {
	client.query("DELETE FROM " + dbName + '.' + dbTablePrefix + "Settings WHERE `roomid` = ? AND `key` = ?", [currentRoomId, key]);
};

/* 	==============
	AddSongToDb - Add the song to the database.
	============== */
global.AddSongToDb = function (data) {
	client.query('INSERT INTO ' + dbName + '.' + dbTablePrefix + 'Song SET roomid = ?, artist = ?,song = ?, djid = ?, up = ?, down = ?,' + 'listeners = ?, started = NOW(), snags = ?, bonus = ?', [currentRoomId, currentsong.artist, currentsong.song, currentsong.djid, currentsong.up, currentsong.down, currentsong.listeners, currentsong.snags, 0]);
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
	SetUpDatabase - Setup the database for the bot to use 
	============== */
global.SetUpDatabase = function () {
	Log("Setting up the database.");
	//Creates DB and tables if needed, connects to db
	client.query('CREATE DATABASE ' + dbName, function (error) {
		if (error && error.number != mysql.ERROR_DB_CREATE_EXISTS) {
			throw (error);
		}
	});
	client.query('USE ' + dbName);

	// Song table
	client.query('CREATE TABLE ' + dbName + '.' + dbTablePrefix + 'Song(`roomid` VARCHAR( 255 ) NOT NULL, id INT(11) AUTO_INCREMENT PRIMARY KEY,' + ' artist VARCHAR(255),' + ' song VARCHAR(255),' + ' djid VARCHAR(255),' + ' up INT(3),' + ' down INT(3),' + ' listeners INT(3),' + ' started DATETIME,' + ' snags INT(3),' + ' bonus INT(3))', function (error) {
		//Handle an error if it's not a table already exists error
		if (error && error.code != 'ER_TABLE_EXISTS_ERROR') {
			throw (error);
		}
	});

	// User table
	client.query('CREATE TABLE ' + dbName + '.' + dbTablePrefix + 'User(`roomid` VARCHAR( 255 ) NOT NULL, userid VARCHAR(255), ' + 'username VARCHAR(255), ' + 'lastseen DATETIME, isMod BIT(1),' + 'PRIMARY KEY (roomid, userid, username))', function (error) {
		//Handle an error if it's not a table already exists error
		if (error && error.code != 'ER_TABLE_EXISTS_ERROR') {
			throw (error);
		}
	});

	// Banned users
	client.query('CREATE TABLE IF NOT EXISTS ' + dbName + '.BANNED (' + 'id INT(11) AUTO_INCREMENT PRIMARY KEY, ' + 'userid VARCHAR(255), ' + 'banned_by VARCHAR(255), ' + 'timestamp DATETIME)', function (error) {
		if (error && error.code != 'ER_TABLE_EXISTS_ERROR') {
			throw error;
		}
	});


	// Settings table
	client.query("CREATE TABLE IF NOT EXISTS " + dbName + '.' + dbTablePrefix + "Settings (`roomid` VARCHAR( 255 ) NOT NULL, `key` varchar(50) NOT NULL," + " `value` varchar(4096) NOT NULL, " + "`DateStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP " + ", `isOption` bit)", function (error) {
		//Handle an error if it's not a table already exists error
		if (error && error.code != 'ER_TABLE_EXISTS_ERROR') {
			throw (error);
		}
	});

	// Alert table
	client.query("CREATE TABLE IF NOT EXISTS " + dbName + ".ALERT (`Id` int(11) NOT NULL AUTO_INCREMENT, `userid` varchar(255) NOT NULL, `byUserid` varchar(255) NOT NULL," +
		" `byName` varchar(255) NOT NULL, `reason` varchar(255) NOT NULL, `dateTimeStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `isOption` bit(1) NOT NULL, PRIMARY KEY (`Id`))", function (error) {
			//Handle an error if it's not a table already exists error
			if (error && error.code != 'ER_TABLE_EXISTS_ERROR') {
				throw (error);
			}
		});

	Log("Setting up default values");
	SetUpRoom();
};

global.SetUpRoom = function () {
	// Announces song stats after every song.
	GetValue("songstats", 0, function (value) {
		if (value === null) {
			SetValue("songstats", "false", 1);
		}
	});
	// Automatically bops on every song
	GetValue("autobop", 0, function (value) {
		if (value === null) {
			SetValue("autobop", "false", 1);
		}
	});
	// Automatically DJs if there is fewer than 3 DJs on the table.
	GetValue("autodj", 0, function (value) {
		if (value === null) {
			SetValue("autodj", "false", 1);
		}
	});
	// Enables the DJ queue (not enabled yet)
	GetValue("enableQueue", 0, function (value) {
		if (value === null) {
			SetValue("enableQueue", "false", 1);
		}
	});
	// Sets how long the next DJ has to step up. (not enabled yet)
	GetValue("nextDjQueueTimeout", 0, function (value) {
		if (value === null) {
			SetValue("nextDjQueueTimeout", "30", 1);
		}
	});
	// Bots gives comments based on the song (not enabled yet)
	GetValue("newsongcomments", 0, function (value) {
		if (value === null) {
			SetValue("newsongcomments", "false", 1);
		}
	});
	// Bot does special stuff if a song is too long (not enabled yet)
	GetValue("monitorsonglength", 0, function (value) {
		if (value === null) {
			SetValue("monitorsonglength", "false", 1);
		}
	});
	// The max length of the song before the events (not enabled yet)
	GetValue("maxsonglength", 0, function (value) {
		if (value === null) {
			SetValue("maxsonglength", "10", 1);
		}
	});
	GetValue("bootsonglength", 0, function (value) {
		if (value === null) {
			SetValue("bootsonglength", "6", 1);
		}
	});
	// Connect the songs (CTS) (not enabled yet)
	GetValue("ctsActive", 0, function (value) {
		if (value === null) {
			SetValue("ctsActive", "false", 1);
		}
	});
	// The highest score achieved in CTS (not enabled yet)
	GetValue("ctsSequenceMax", 0, function (value) {
		if (value === null) {
			SetValue("ctsSequenceMax", "0", 1);
		}
	});
	// Last words used in CTS (not enabled yet)
	GetValue("ctsLastWords", 0, function (value) {
		if (value === null) {
			SetValue("ctsLastWords", "", 1);
		}
	});
	// Bot gives an announcement if there is one. (not enabled yet)
	GetValue("announcement", 0, function (value) {
		if (value === null) {
			SetValue("announcement", "", 1);
		}
	});
	// Bot gives an announcement every x minutes. (not enabled yet)
	GetValue("announceTimer", 0, function (value) {
		if (value === null) {
			SetValue("announceTimer", "240", 1);
		}
	});
	// Get the f**k out!
	GetValue("gtfo", 0, function (value) {
		if (value === null) {
			SetValue("gtfo", "false", 1);
		}
	});
	// Says that someone lamed (not enabled yet)
	GetValue("lamer", 0, function (value) {
		if (value === null) {
			SetValue("lamer", "false", 1);
		}
	});
	// How many hours before a person is considered idle
	GetValue("idleTime", 0, function (value) {
		if (value === null) {
			SetValue("idleTime", "6", 1);
		}
	});
	// Should the bot boot if they are idle
	GetValue("bootOnIdle", 0, function (value) {
		if (value === null) {
			SetValue("bootOnIdle", "false", 1);
		}
	});
	// Bot is now a moderator and should enforce play counts
	GetValue("isModerating", 0, function (value) {
		if (value === null) {
			SetValue("isModerating", "false", 1);
		}
	});
	// Max # of songs allowed per time DJing
	GetValue("maxPlays", 0, function (value) {
		if (value === null) {
			SetValue("maxPlays", "3", 1);
		}
	});
	// Max # of songs allowed per time DJing
	GetValue("welcomeMsg", 0, function (value) {
		if (value === null) {
			SetValue("welcomeMsg", "false", 1);
		}
	});
	// The bot should be monitoring for AFK djs.
	GetValue("monitorAfk", 0, function (value) {
		if (value === null) {
			SetValue("monitorAfk", "false", 1);
		}
	});
	// How many songs before the bot boots
	GetValue("afkMissedSongs", 0, function (value) {
		if (value === null) {
			SetValue("afkMissedSongs", "2", 1);
		}
	});
	// Have the boot monitor for hung songs.
	GetValue("monitorHungSong", 0, function (value) {
		if (value === null) {
			SetValue("monitorHungSong", "false", 1);
		}
	});
	// Have the boot monitor for hung songs.
	GetValue("djWait", 0, function (value) {
		if (value === null) {
			SetValue("djWait", "2", 1);
		}
	});
	// Ban guest accounts from the room.
	GetValue("banGuest", 0, function (value) {
		if (value === null) {
			SetValue("banGuest", "false", 1);
		}
	});
};
