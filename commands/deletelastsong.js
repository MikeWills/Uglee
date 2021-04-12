exports.name = '/deletelastsong';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	IsMod(userid, function (isMod) {
		if (isMod) {
			bot.playlistAll(function (playlist) {
				bot.playlistRemove(playlist.list.length - 1);
			});
		}
	});
}