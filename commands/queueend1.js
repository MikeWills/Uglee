exports.name = '@' + botName.toLowerCase() + ' endq';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	SetValue("enableQueue", "false");
	Speak("We are no longer using a queue.")
}