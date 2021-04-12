exports.name = '@' + botName.toLowerCase() + ' roll';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	Speak("Hey DJs. If you like to gamble and it's your turn; type 'roll'. I'll roll a dice for you. A 5 and 6 means I give you an awesome. 2-4 is nothing. If I roll a 1, however, I give you a lame. So be sure you want to roll.");
}