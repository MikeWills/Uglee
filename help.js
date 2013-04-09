exports.name = '/help';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	var text = "Complete list at: http://murl.me/uglee-help. Here are main ones: /count, @" + AllUsers[botUserId] +" stats, /dive, /rules."
}