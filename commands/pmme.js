exports.name = '@' + botName.toLowerCase() + ' pm me';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	TellUser(userid, "What can I do for you?");
}