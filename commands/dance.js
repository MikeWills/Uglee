exports.name = 'dance';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	danceCount++;
	Log("Dance Count: " + danceCount);
	if (danceCount === 2)
    	AwesomeSong();
}