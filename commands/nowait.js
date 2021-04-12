exports.name = '!nowait';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	if (IsAdmin(userid)) {
		ClearDjWait();
		return;
	}

	IsMod(userid, function (isMod) {
		if (isMod) {
			ClearDjWait();
			return;
		}
	});
}