exports.name = '/unban';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if (isMod) {
			var userName = data.text.substring(8);
			Log(userName);

			client.query("DELETE FROM BANNED WHERE `username` = ?", [userName]);
			Speak("@" + userName + " is no longer banned.");
			Log("Unbanned " + userName);
		}
	});
}