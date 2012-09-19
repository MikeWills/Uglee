exports.name = ':metal:';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    if (IsMod(userid)) {
        bot.vote('up');
    }
}