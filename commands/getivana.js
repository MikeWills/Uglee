exports.name = '/getivana';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if (IsAdmin(userid)){
		bot.pm(".goto " + botRoomId, "512d7460eb35c1704362d2b3"); // PM Ivana the command
		bot.pm("Command sent", userid)
	}
}