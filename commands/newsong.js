exports.name = '@' + botName.toLowerCase() + " pick a new song";
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if(isMod) {
			bot.playlistAll(function(oldPlaylist) {
				bot.playlistReorder(0, oldPlaylist.list.length, function() {
					bot.playlistAll(function(playlist) {
						var nextSong = "I now have " + playlist.list[0].metadata.song + " by " + playlist.list[0].metadata.artist + " next.";
						Speak(nextSong, "", source, userid);
					});
				});
			});
		}
	});
}