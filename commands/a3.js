exports.name = ':punch:';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	if (userid !== botUserId) {
		IsMod(userid, function(isMod) {
			if (isMod) {
				bot.vote('up');
				Speak(":punch:");
				alreadyVoted = true;
			}
		}); 
	}
}