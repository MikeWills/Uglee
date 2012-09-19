exports.name = 'addtoplaylist';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data) {
    if(IsMod(data.userid)) {
    	 bot.playlistAll(function (data) {
                bot.playlistAdd(currentsong.id, data.list.length);
            }); 
        bot.snag();
    }
}