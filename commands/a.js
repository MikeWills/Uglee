exports.name = ':metal:';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data) {
    if (IsMod(data.userid)) {
        bot.vote('up');
    }
}