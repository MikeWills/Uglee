exports.name = '@' + botName.toLowerCase() + ' stepdown';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if(isMod) {
			Speak("Looks like me not needed anymore.");
			setTimeout(function() {
				bot.remDj();
			}, 500)
			botDJing = false;
		}
	});
}