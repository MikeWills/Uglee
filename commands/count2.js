exports.name = '/count';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	SpeakPlayCount(source, userid);
}