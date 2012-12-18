exports.name = '/setplaycount';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if (isMod) {
			var count = data.speak.substring(14);
			bot.speak("Setting play count to " + count);
			// SetValue("maxPlays", count);
		}
	});
}