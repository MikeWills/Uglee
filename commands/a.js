exports.name = ':metal:';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if (userid !== botUserId) {
		IsMod(userid, function(isMod) {
			if (isMod) {
				bot.vote('up');
				Speak(":metal:");
				alreadyVoted == true;
			}
		});
	}
}