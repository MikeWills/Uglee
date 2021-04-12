exports.name = '/savefor';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, userid, source) {
	if (currentRoomId !== "4ea390ac14169c0cc3caa078") {
		IsMod(userid, function (isMod) {
			if (isMod) {
				for (var i in AllUsers) {
					if (AllUsers[i].name.toLowerCase() == data.text.substring(10).toLowerCase()) {
						reserveredFor = i;
						Speak("I am now saving the next spot for " + data.text.substring(9) + ".");
						return;
					}
				}
			}
		});
	}
}