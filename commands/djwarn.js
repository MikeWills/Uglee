exports.name = 'djwarn';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if (isMod) {
			var id = Math.ceil(Math.random() * 2);
			if (id === 1) {
				bot.speak("DJs: The gorilla doesn't like jerks. Please support your fellow DJs by clicking awesome for their songs. See Rule #4.");
				setTimeout(function() {
					bot.speak("Me have heard the screams... not pleasant.");
				}, 500)
			} else if (id === 2) {
				bot.speak("DJs: Please support your fellow DJs by clicking the awesome button! It's easy and it's a rule! See #4. Just type !rules to see. Otherwise you WILL be booted off in two songs.");
			}
		}
	});
}