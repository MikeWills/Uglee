exports.name = '/help';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	var text = "Complete list at: https://mikewills.me/uglee/. Here are main ones: /count, @" + AllUsers[botUserId].name + " stats, /dive, /rules, and /aboutsong.";
	Speak(text, AllUsers[userid].name, source, userid);
}