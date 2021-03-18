exports.name = '/botname';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if (IsAdmin(userid)) {		
		bot.modifyName(botName);
	}
}