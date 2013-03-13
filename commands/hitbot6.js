exports.name = '/me fondles @' + botName.toLowerCase();
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if(isMod) {
			Speak("Oooh... I guess I can 'rise' to the occasion!");
			bot.vote('up');
			alreadyVoted = true;
		}
	});
}