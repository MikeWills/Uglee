exports.name = '/me pounds @' + botName.toLowerCase();
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	IsMod(userid, function (isMod) {
		if (isMod) {
			SpeakRandom(hitBot, AllUsers[userid].name);
			bot.vote('up');
			alreadyVoted = true;
		}
	});
}