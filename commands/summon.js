exports.name = '/summon';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	IsMod(userid, function (isMod) {
		if (isMod) {
			for (var i = 0; i < Subscribers.length; i++) {
				TellUser(Subscribers[i], summonText);
			}
		}
	});
}