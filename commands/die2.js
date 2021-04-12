exports.name = '@' + botName.toLowerCase() + ' die';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	if (IsAdmin(userid)) {
		bot.roomDeregister();
		process.exit(0);
	}
}