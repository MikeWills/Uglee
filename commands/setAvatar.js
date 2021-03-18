exports.name = 'avatar';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	if (IsAdmin(userid) && source === 'pm') {
		var id = data.text.substring(7);
		bot.setAvatar(id);
	}
}