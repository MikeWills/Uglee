exports.name = '/skip';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	var text = "@{u} Please skip. You either have silence or a hung song.";
	Speak(text, AllUsers[currentDj].name);
	Speak(text, AllUsers[currentDj].name, "pm", currentDj);
}