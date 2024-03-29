exports.name = '.dance';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, userid, source) {
	if (!alreadyVoted) {
		if (currentDj !== userid) {
			if (danceRequesters.indexOf(userid) === -1) {
				danceCount++;
				danceRequesters.push(userid);
				bot.roomInfo(false, function (data) {
					var neededDances = Math.round((data.room.metadata.listeners / 10) + 1);
					if (neededDances < 2) { // Minium of 2
						neededDances = 2;
					}
					if (danceCount === neededDances) {
						AwesomeSong();
						alreadyVoted = true;
					}
				});
			}
		}
	} else {
		Speak("People say I act like I don't care. It's not an act.");
	}
}
 