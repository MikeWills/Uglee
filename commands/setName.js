exports.name = 'name';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	if (IsAdmin(userid) && source === 'pm') {
		var name = data.text.substring(5);
		bot.modifyName(name);
	}
}