exports.name = '/bop';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	Log("/bop");
	var text = "";
	for (var i in Djs) {
		Log(i);
		if (i !== currentDj) {
			if (votedDjs.indexOf(i) == -1){
				text += "@" + AllUsers[i].name + " ";
				Log(text);
			}
		}
	}
	text += " We require that you bop for every song while on the table DJing. Please thumbs up for every song.";
	Speak(text);
}