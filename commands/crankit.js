exports.name = 'crank it';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, userid, source) {
	IsMod(userid, function (isMod) {
		if (isMod) {
			bot.vote('up');
			SpeakRandom(crankIt, AllUsers[userid].name);
			alreadyVoted = true;
		}
	});
}