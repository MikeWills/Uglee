exports.name = '@' + botName.toLowerCase() + ' listenercount';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	Speak("There are " + currentsong.listeners + " listeners right now.");
}