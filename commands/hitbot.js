exports.name = '/me kicks @' + botName.toLowerCase();
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	SpeakRandom(hitBot, AllUsers[userid].name);
	bot.vote('up');
}