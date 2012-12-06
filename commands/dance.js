exports.name = 'dance';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	if (!alreadyVoted) {
		if (danceRequesters.indexOf(userid) === -1) {
			danceCount++;
			danceRequesters.push(userid);
			if (danceCount === 2) {
				AwesomeSong();
				alreadyVoted = true;
			}
		}
	} else {
		Speak("HEY! I'm boppin' here! What more you want???");
	}
}