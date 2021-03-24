exports.name = '/status';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, userid, source) {
    IsMod(userid, function (isMod) {
        if (isMod) {
            Speak("Here is how I'm set up:");

            // Check queue status
            setTimeout(function () {
                GetValue("enableQueue", 0, function (results) {
                    if (results == "true") {
                        Speak("Queue: On");
                        setTimeout(function () {
                            QueueStatus();
                        }, 100);
                    } else {
                        Speak("Queue: Off");
                    }
                });
            }, 200);

            // Get the moderation status
            setTimeout(function () {
                GetValue("isModerating", 0, function (results) {
                    if (results == "true") {
                        Speak("Moderation: On");
                        setTimeout(function () {
                            SpeakPlayCount(source, userid);
                        }, 100);
                    } else {
                        Speak("Moderation: Off");
                    }
                });
            }, 400);

            // MaxPlays
            setTimeout(function () {
                GetValue("maxPlays", 0, function (results) {
                    Speak("Max Plays: " + results);
                    setTimeout(function () {
                        SpeakPlayCount(source, userid);
                    }, 100);
                });
            }, 600);
        }
    });
}