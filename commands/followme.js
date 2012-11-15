exports.name = '/followme';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if (userid === botAdmin) {
		bot.becomeFan(userid);
		bot.stalk(botAdmin, function(stalkData) {
			bot.roomDeregister();
			bot.roomRegister(stalkData.roomId);
		})
	}
}