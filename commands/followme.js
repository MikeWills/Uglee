exports.name = '/followme';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if (botAdmins.indexOf(userid) !== -1) {
		Log("Is Admin");
		bot.becomeFan(userid);
		bot.stalk(userid, function(stalkData) {
			Log("Stalking");
			bot.roomDeregister();
			bot.roomRegister(stalkData.roomId);
		})
	}
}