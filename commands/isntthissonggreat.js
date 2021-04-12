exports.name = "isn't this song great?";
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	Speak("Yes it is!");
}