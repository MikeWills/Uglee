exports.name = '/allowsong';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if(userid !== botUserId) {
		IsMod(userid, function(isMod) {
			if(isMod) {
				clearTimeout(songWarningIntervalId);
				clearTimeout(songBootIntervalId);
				Speak("Okay, we are letting you play the whole thing you lucky dog.");
			}
		});
	}
}