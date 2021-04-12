exports.name = '/noonecares';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, userid, source) {
    IsMod(userid, function (isMod) {
        if (isMod) {
            // Make sure bot is moderating
            SetValue("isModerating", "true");

            // Set max plays to 1
            SetValue("maxPlays", 99);

            // Set the playcount to 1
            var x = 0;
            for (var i in Djs) {
                Djs[i].remainingPlays = Number(99);
            }
            SpeakPlayCount();

            bot.speak("This is my cup of care. Oh look, it's empty.");
        }
    });
}