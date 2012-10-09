exports.name = '/activatemod';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if (userid !== botUserId) {
		IsMod(userid, function(isMod) {
			if (isMod) {
				SetValue("isModerating", "true");
				SetValue("autodj", "true");
				SetValue("autobop", "true");
				Speak("I am now moderating this room!")
			}
		});
	}
}