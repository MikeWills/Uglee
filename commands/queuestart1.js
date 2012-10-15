exports.name = '@' + botName.toLowerCase() + ' startq';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	SetValue("enableQueue", "true");
}