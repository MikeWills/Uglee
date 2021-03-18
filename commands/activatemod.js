exports.name = '/activatemod';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if(isMod) {
			SetValue("isModerating", "true");
			Speak("I am now moderating this room!")
		}
	});
}