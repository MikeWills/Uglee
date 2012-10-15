exports.name = '/startq';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	SetValue("enableQueue", "true");
	Speak("We are now using a queue. Please type !q+ to add yourself to the list.")
}