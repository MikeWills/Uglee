exports.name = 'idle';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	if (source === "pm") {
		IsMod(userid, function (isMod) {
			if (isMod) {
				GetValue("idleTime", 0, function (val) {
					var pmText = "The following users have been idle for more than " + val + " hours: ";
					for (var z in AllUsers) {
						var startDate = new Date();
						var idleTime = Math.round((startDate - AllUsers[z].lastActivity) / 3600000); // in hours
						//var idleTime = Math.round((startDate - AllUsers[z].lastActivity) / 60000); // for testing minutes
						//Log(AllUsers[z].name + ": " + idleTime);
						if (idleTime >= val) {
							pmText += AllUsers[z].name + ": " + idleTime + " on " + AllUsers[z].laptop + " | ";
						}
					}

					Speak(pmText, "", source, userid);
				});
			}
		});
	}
}