exports.name = '!nowait';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if (IsAdmin(userid)) {
		for (var i in PastDjs) {
			if (AllUsers[i] !== undefined) {
				Speak("@{u}, you can DJ again at any time.", AllUsers[i].name, "", i);
			}
			delete PastDjs[i];
		}
		return;
	}

	IsMod(userid, function(isMod) {
		if (isMod) {
			for (var i in PastDjs) {
				if (AllUsers[i] !== undefined) {
					Speak("@{u}, you can DJ again at any time.", AllUsers[i].name, "", i);
				}
				delete PastDjs[i];
			}
			return;
		}
	});
}