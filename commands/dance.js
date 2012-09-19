exports.name = 'dance';
exports.hidden = false;
exports.enabled = false;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	danceCount++;
	if (danceCount = 2)
    	AwesomeSong();
}