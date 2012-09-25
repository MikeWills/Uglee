exports.name = 'roll again';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
    IsMod(userid, function(isMod) {
        if (isMod) {
            var roll = Math.ceil(Math.random() * 6);
            if (roll > 3) {
                AwesomeSong();
            } else {
                bot.speak("I told you I didn't like this song.");
            }
        }
    });
}