exports.name = '/stepup';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if(isMod) {
			Log("Bot is DJing");
			bot.addDj();
			bot.vote('up');
			bot.speak(stepUpText);
			botDJing = true;
			alreadyVoted = true;
		}
	});
}