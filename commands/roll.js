exports.name = 'roll';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    var roll = Math.ceil(Math.random() * 6);
    if(currentsong.djid == data.userid) {
        if(!alreadyVoted) {
            if(!alreadyRolled) {
                alreadyRolled = true;
                if(roll > 4) {
                    Speak(data.name + ', you rolled a ' + roll + ', Awesome!', null, source, userid);
                    bot.vote('up');
                    alreadyVoted = true;
                } else if(roll === 1) {
                    Speak(data.name + ', you rolled a ' + roll + ', Lame!', null, source, userid);
                    bot.vote('up');
                    setTimeout(function() {
                        bot.vote('down');
                    }, 1000);
                    alreadyVoted = true;
                } else {
                    Speak(data.name + ', you rolled a ' + roll + ', bummer.', null, source, userid);
                    alreadyVoted = true;
                }
                bonusvote = true;
            }
        } else {
            Speak("HEY! I'm boppin' here! How about I change it to a lame if you insist...", null, source, userid);
        }
    }
}
