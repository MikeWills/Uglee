exports.name = '/clearq';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if(isMod) {
			DjQueue = { "length": 0};
			nextDj = null;
			QueueStatus();
		}
	});
}