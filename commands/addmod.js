exports.name = '/addmod';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	if (userid !== botUserId) {
		IsMod(userid, function(isMod) {
			if (isMod) {
				botModed = true;
				bot.remModerator(data.text.substring(9));
				Speak("Moderator id " + data.text.substring(9) + " added.", "", source, userid);
			}
		});
	}
}