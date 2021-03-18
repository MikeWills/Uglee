exports.name = '!rules';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if (Settings["isModerating"].value === "true" || Settings["welcomeMsg"].value === "true") {
		Speak(ruleText, AllUsers[userid].name, source, userid);
	}
}