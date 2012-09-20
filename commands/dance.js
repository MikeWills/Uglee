exports.name = 'dance';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	danceCount++;
	if (danceCount === 2)
    	AwesomeSong();
}