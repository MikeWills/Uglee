exports.name = '/activatemod';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	IsMod(userid, function (isMod) {
		if (isMod) {
			SetValue("isModerating", "true");
			Speak("I'm not bossy, I'm the boss.")
		}
	});
}