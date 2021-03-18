exports.name = 'idledjs';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if(source === "pm") {
		IsMod(userid, function(isMod) {
			if(isMod) {
				var pmText = "The following djs have been idle for (in minutes): ";
				for(var z in Djs) {
					var startDate = new Date();
					var idleTime = Math.round((startDate - AllUsers[z].lastActivity) / 60000); // in minutes
					pmText += AllUsers[z].name + ": " + idleTime + " on " + AllUsers[z].laptop + " | ";
				}

				Speak(pmText, "", source, userid);
			}
		});
	}
}