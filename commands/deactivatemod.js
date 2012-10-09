exports.name = '/deactivatemod';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if(isMod) {
			SetValue("isModerating", "false");
			SetValue("autodj", "false");
			SetValue("autobop", "false");
			Speak("I am no longer moderating this room!")
		}
	});
}