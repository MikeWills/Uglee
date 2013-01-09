exports.name = '/rules';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	GetValue("isModerating", 0, function(isModerating) {
		if(isModerating === "true") {
			Speak(ruleText);
		}
	});
}