/* ============== */
/* Log - Log the information to the console */
/* ============== */
global.Log = function(data) {
	if (logtoconsole) {
		console.log(botName, ">>>\033[0m", data);
	}
};

global.Speak = function(text) {
	bot.speak(text);
};

global.TellUser = function(userid, text) {
	bot.pm(text, userid);
};

global.Command = function(source, data) {
	var isPM = source === "pm" ? true : false;

}