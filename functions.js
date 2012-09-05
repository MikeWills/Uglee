/* ============== */
/* Log - Log the information to the console */
/* ============== */
global.Log = function(data) {
	if (logtoconsole) {
		console.log(botName, ">>>", data);
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

global.SpeakRandom = function(array){
	var rand = Math.ceil(Math.random() * array.length);
	Speak(array[rand]);
}