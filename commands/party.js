exports.name = '/party';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
        Speak("WOOO HOOO! Contgrats 🎉");
        bot.vote('up');
}