exports.name = '/endq';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	SetValue("enableQueue", "false");
}