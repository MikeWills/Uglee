exports.name = 'laptop';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	if (IsAdmin(userid) && source === 'pm') {
		var id = data.text.substring(7);
		bot.modifyLaptop(id);
	}
}