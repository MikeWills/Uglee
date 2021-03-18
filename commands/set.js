exports.name = 'set';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	if(source === 'pm') {
		IsMod(userid, function(isMod) {
			if(isMod) {

				var settings = [];

				client.query("SELECT `key` FROM " + dbName + '.' + dbTablePrefix + "Settings WHERE roomid = ?", [currentRoomId], function select(error, results, fields) {
					for(i in results) {
						settings.push(results[i]['key']);
					}

					var split = data.text.split(' ');
					if(split.length === 1) {
						var text = "Options are: ";
						for(i in settings) {
							text = text + settings[i] + ", ";
						}
						TellUser(userid, text.substring(0, text.length - 2));
					}

					if(split.length === 2) {
						TellUser(userid, "@" + AllUsers[userid].name + " correct syntax is set [option] [value]");
					}

					if(split.length === 3) {
						if(settings.indexOf(split[1]) !== -1) {
							SetValue(split[1], split[2]);
							TellUser(userid, "Value for " + split[1] + " set to " + split[2]);
						} else {
							TellUser(userid, "@" + AllUsers[userid].name + " invalid setting.");
						}
					}

				});
			}
		});
	}
}