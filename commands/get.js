exports.name = 'get';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	if (source === 'pm') {

		var settings = [];

		client.query("SELECT `key` FROM " + dbName + '.' + dbTablePrefix + "Settings WHERE roomid = ?", [currentRoomId], function select(error, results, fields) {
			for (i in results) {
				settings.push(results[i]['key']);
			}

			var split = data.text.split(' ');
			if (split.length === 1) {
				var text = "Options are: ";
				for (i in settings) {
					text = text + settings[i] + ", ";
				}
				TellUser(userid, text.substring(0, text.length - 2));
			}

			if (split.length === 2) {
				var text = "The current setting for " + split[1] + " is: ";
				GetValue(split[1], 0, function(val) {
					text = text + val;
					TellUser(userid, "@" + AllUsers[userid].name + " " + text);
				});
			}

		});
	}
}