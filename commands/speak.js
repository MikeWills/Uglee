exports.name = 'speak';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	if (source === 'pm') {
		IsMod(userid, function(isMod) {
			if (isMod) {
				var text = data.text.substring(6);
				Speak(text);
			}
		});
	}
}