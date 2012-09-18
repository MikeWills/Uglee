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
	client.query('CREATE TABLE ' + dbTablePrefix + 'Song(id INT(11) AUTO_INCREMENT PRIMARY KEY,' + ' artist VARCHAR(255),' + ' song VARCHAR(255),' + ' djid VARCHAR(255),' + ' up INT(3),' + ' down INT(3),' + ' listeners INT(3),' + ' started DATETIME,' + ' snags INT(3),' + ' bonus INT(3))',

	function(error) {
		//Handle an error if it's not a table already exists error
		if (error && error.number != 1050) {
			throw (error);
		}
	});

	//user table
	client.query('CREATE TABLE ' + dbTablePrefix + 'User(userid VARCHAR(255), ' + 'username VARCHAR(255), ' + 'lastseen DATETIME, ' + 'PRIMARY KEY (userid, username))', function(error) {
		//Handle an error if it's not a table already exists error
		if (error && error.number != 1050) {
			throw (error);
		}
	});

	client.query("CREATE TABLE IF NOT EXISTS `" + dbTablePrefix + "Settings` (`key` varchar(50) NOT NULL, `value` varchar(4096) NOT NULL, `DateStamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)", function(error) {
		//Handle an error if it's not a table already exists error
		if (error && error.number != 1050) {
			throw (error);
		}
	});
};