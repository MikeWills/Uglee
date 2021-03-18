exports.name = ':-1:';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if (isMod) {
			bot.vote('down');
			alreadyVoted = true;
		}
	});
}
