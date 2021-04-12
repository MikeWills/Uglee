exports.name = '/oneanddone';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, userid, source) {
    IsMod(userid, function (isMod) {
        if (isMod) {
            // Make sure bot is moderating
            SetValue("isModerating", "true");

            // Set max plays to 1
            SetValue("maxPlays", 1);

            // Set the playcount to 1
            var x = 0;
            for (var i in Djs) {
                Djs[i].remainingPlays = Number(1);
            }
            SpeakPlayCount();

            bot.speak("Just because something works doesn't mean it can't be improved. So we are going to 'One and Done'.");
            bot.speak("Mods, can you fix the playcount so it works correctly? Use the '/realcount' command.");
        }
    });
} 