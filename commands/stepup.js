exports.name = 'stepup';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if (source === 'pm') {
		IsMod(userid, function(isMod) {
			if (isMod) {
				Log("Bot is DJing");
				bot.addDj();
				bot.vote('up');
				bot.speak("Imma help you out for a bit.");
				botDJing = true;
				alreadyVoted = true;
			}
		});
	}
}