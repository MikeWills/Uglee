exports.name = '/setcount';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if (isMod) {
			var count = data.text.substring(9);
			bot.speak("Setting play count to " + count);
			SetValue("maxPlays", count);
		}
	});
}