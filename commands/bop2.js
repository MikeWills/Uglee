exports.name = '@' + botName.toLowerCase() + ' bop';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	var text = " ";
	for (var i in Djs) {
		if (i !== currentDj) {
			if (votedDjs.indexOf(i) == -1){
				text += "@" + AllUsers[i].name + " ";
			}
		}
	}
	text += " We require that you bop for every song while on the table DJing. Please thumbs up for every song.";
	Speak(text);
}