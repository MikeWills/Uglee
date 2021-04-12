exports.name = 'dq';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, userid, source) {
	IsMod(userid, function (isMod) {
		if (isMod) {
			var username = data.text.substring(4);
			Log(username);
			client.query("SELECT `userid` FROM " + dbName + '.' + dbTablePrefix + "User WHERE `username` = ?", [username], function select(error, results, fields) {
				RemoveFromQueue(results[0]['userid']);
			});
		}
	});
}