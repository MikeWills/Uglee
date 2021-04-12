exports.name = '/addmod';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, userid, source) {
	if (IsAdmin(userid)) {
		botModed = true;
		Log(userid + " ran moderator command.", "error", "New Moderator");
		bot.addModerator(data.text.substring(8));
		Speak("Moderator id " + data.text.substring(8) + " added.", "", source, userid);
	}
}