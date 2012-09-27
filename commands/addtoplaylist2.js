exports.name = 'addsong';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    IsMod(userid, function(isMod) {
        if (isMod) {
            bot.playlistAll(function(playlist) {
                bot.playlistAdd(currentsong.id, playlist.list.length);
            });
            bot.snag();
            bot.vote('up');
			alreadyVoted == true;
        }
    });
}