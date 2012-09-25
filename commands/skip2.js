exports.name = 'skip';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if (source === 'pm') {
		IsMod(userid, function(isMod) {
			if (isMod) {
				bot.skip();
			}
		});
	}
}