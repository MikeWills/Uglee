exports.name = '/bop';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	var text = "I don't work like that.";
	Speak(text, "", "pm", userid);
}
