exports.name = 'stepdown';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if (source === 'pm') {
		IsMod(userid, function(isMod) {
			if (isMod) {
				Speak("Looks like me not needed anymore.");
				setTimeout(function() {
					Speak("/me pouts and slowly walks to the floor.");
					setTimeout(function() {
						bot.remDj();
					}, 500)
				}, 500)
				botDJing = false;
			}
		});
	}
}