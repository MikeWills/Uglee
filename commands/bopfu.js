exports.name = '/bop';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	var text = "You are pushing the wrong buttons, honey.";
	Speak(text, "", "pm", userid);
}
