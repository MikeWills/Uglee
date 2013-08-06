// Use this for cleaning up mods if you need to.

exports.name = '/remmod';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	if (userid !== botUserId) {
		IsMod(userid, function(isMod) {
			if (isMod) {
				console.log("Removing " + data.text.substring(9) + " as a mod.");
				bot.remModerator(data.text.substring(9));
				Speak("Moderator id " + data.text.substring(9) + " removed.", "", source, userid);
			}
		});
	}
}