exports.name = '/endq';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if(isMod) {
			SetValue("enableQueue", "false");
			Speak("We are no longer using a queue.");
		}
	});
}