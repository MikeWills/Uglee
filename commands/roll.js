exports.name = 'roll';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    var roll = Math.ceil(Math.random() * 6);
    if (currentsong.djid == data.userid) {
        if (!alreadyVoted) {
            if (!alreadyRolled) {
                alreadyRolled = true;
                if (roll > 4) {
                    bot.speak(data.name + ', you rolled a ' + roll + ', Awesome!');
                    bot.vote('up');
                    alreadyVoted = true;
                } else if (roll === 1) {
                    bot.speak(data.name + ', you rolled a ' + roll + ', Lame!');
                    bot.vote('down');
                    alreadyVoted = true;
                } else {
                    bot.speak(data.name + ', you rolled a ' + roll + ', bummer.');
                    alreadyVoted = true;
                }
                bonusvote = true;
            }
        }
    } else {
        bot.speak("@" + botName + " roll");
    }
}