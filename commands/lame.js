exports.name = 'lame';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	if(!alreadyVoted) {
		if(currentDj !== userid) {
			if(lameRequesters.indexOf(userid) === -1) {
				lameCount++;
				lameRequesters.push(userid);
				bot.roomInfo(false, function(data) {
					var neededLames = Math.round((data.room.metadata.listeners / 10) + 1);
					if(neededLames < 2) { // Minium of 2
						neededLames = 2;
					}
					if(lameCount === neededLames) {
						LameSong();
						alreadyVoted = true;
					}
				});
			}
		}
	} else {
		Speak("The difference between pizza and your opinion is that I only asked for pizza.");
	}
}