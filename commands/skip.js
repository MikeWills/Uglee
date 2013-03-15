exports.name = '/skipsong';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	var text = "@{u} PLEASE SKIP! You either have silence at the end of your song or a hung song.";
	Speak(text, AllUsers[currentDj].name);
	Speak(text, AllUsers[currentDj].name, "pm", currentDj);
}