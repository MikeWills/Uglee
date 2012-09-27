exports.name = 'die';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if (source === "pm" && IsAdmin(userid)){
		bot.roomDeregister();
        process.exit(0);
	}
}