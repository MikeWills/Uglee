exports.name = '/followme';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	if (IsAdmin(userid)) {
		bot.becomeFan(userid);
		bot.stalk(userid, function (stalkData) {
			bot.roomDeregister();
			bot.roomRegister(stalkData.roomId);
		})
	}
}