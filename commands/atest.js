exports.name = ':fire:';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	console.log("Fire called");
	if (userid !== botUserId) {
		console.log("Not bot");
		IsMod(userid, function(isMod) {
			if (isMod) {
				console.log("Is Mod");
				bot.vote('up');
				alreadyVoted = true;
			}
		});
	}
}