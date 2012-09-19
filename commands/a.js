exports.name = ':metal:';
exports.hidden = true;
exports.enabled = false;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    if (IsMod(userid)) {
        bot.vote('up');
    }
}