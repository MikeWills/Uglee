/* 	============== 
	SetCacheValue - Sets the value to the DB cache 
	============== */
global.SetCacheValue = function(key, value) {
		client.query("SELECT `value` FROM " + dbTablePrefix + "Settings WHERE `key` = ?", [key], function select(error, results, fields) {
			if (results !== undefined) {
				if (results.length !== 0) {
					client.query("UPDATE " + dbTablePrefix + "Settings SET `value` = ? WHERE `key` = ?", [value, key]);
				} else {
					client.query("INSERT INTO " + dbTablePrefix + "Settings (`key`, `value`, `DateStamp`) VALUES (?, ?, CURRENT_TIMESTAMP)", [key, value]);
				}
			} else {
				client.query("INSERT INTO " + dbTablePrefix + "Settings (`key`, `value`, `DateStamp`) VALUES (?, ?, CURRENT_TIMESTAMP)", [key, value]);
			}
		});
};

/* 	============== 
	GetCacheValue - Gets the value from the DB cache 
	============== */
global.GetCacheValue = function(key, timeout, callback) {
		client.query("SELECT `value`, `DateStamp` FROM " + dbTablePrefix + "Settings WHERE `key` = ?", [key], function select(error, results, fields) {
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
};

/* 	============== 
	RemoveCacheValue - Deletes the value to the DB cache 
	============== */
global.RemoveCacheValue = function(key) {
	client.query("DELETE FROM " + dbTablePrefix + "Settings WHERE `key` = ?", [key]);
};

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
	SetUpDatabase - Setup the database for the bot to use 
	============== */
global.SetUpDatabase = function() {
	Log("Setting up the database.");
	//Creates DB and tables if needed, connects to db
	client.query('CREATE DATABASE ' + dbName, function(error) {
		if (error && error.number != mysql.ERROR_DB_CREATE_EXISTS) {
			throw (error);
		}
	});
	client.query('USE ' + dbName);

	//song table
	client.query('CREATE TABLE ' + dbTablePrefix + 'Song(id INT(11) AUTO_INCREMENT PRIMARY KEY,' + 
		' artist VARCHAR(255),' + ' song VARCHAR(255),' + ' djid VARCHAR(255),' + ' up INT(3),' + 
		' down INT(3),' + ' listeners INT(3),' + ' started DATETIME,' + ' snags INT(3),' + ' bonus INT(3))', function(error) {
			//Handle an error if it's not a table already exists error
			if (error && error.number != 1050) {
				throw (error);
			}
	});

	//user table
	client.query('CREATE TABLE ' + dbTablePrefix + 'User(userid VARCHAR(255), ' + 'username VARCHAR(255), ' + 
		'lastseen DATETIME, ' + 'PRIMARY KEY (userid, username))', function(error) {
		//Handle an error if it's not a table already exists error
		if (error && error.number != 1050) {
			throw (error);
		}
	});

	client.query("CREATE TABLE IF NOT EXISTS `" + dbTablePrefix + "Settings` (`key` varchar(50) NOT NULL," +
		" `value` varchar(4096) NOT NULL, " +
		"`DateStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " + 
		"`isBanned` BIT NOT NULL)", function(error) {
		//Handle an error if it's not a table already exists error
		if (error && error.number != 1050) {
			throw (error);
		}

		GetCacheValue("version", 0, function(dbversion){
			if (dbversion !== version) {
				SetCacheValue("version", version);
				SetCacheValue("autobop", "false");
				SetCacheValue("autodj", "false");
				SetCacheValue("enableQueue", "false");
				SetCacheValue("nextDjQueueTimeout", "30");
				SetCacheValue("newsongcomments", "false");
				SetCacheValue("monitorsonglength", "false");
				SetCacheValue("maxsonglength", "30");
				SetCacheValue("bannedUsers", "['4f6ba010590ca24a2300249b', '504c33dfaaa5cd75910006b4', '503fe6a4eb35c1065e0001ec', '504ea4d2eb35c1057700002c']");
				SetCacheValue("ctsActive", "false");
				SetCacheValue("ctsSequenceMax", "0");
				SetCacheValue("ctsLastWords", "");
				SetCacheValue("announcement", "");
			}
		})
	});
};