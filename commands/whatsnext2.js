exports.name = "/whatsnext";
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	bot.playlistAll(function (playlist) {
		var nextSong = "I have " + playlist.list[0].metadata.song + " by " + playlist.list[0].metadata.artist + " next.";
		Speak(nextSong, "", source, userid);
	});
}