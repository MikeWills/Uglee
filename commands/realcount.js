exports.name = '!realcount';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	GetValue("isModerating", 0, function(isModerating) {
		if(isModerating === "true") {
			IsMod(userid, function(isMod) {
				if(isMod) {
					var count = data.text.substring(11).split("-");
					if(count.length !== 5) {
						Speak("Syntax is !realcount #-#-#-#-# (Please use 'x' for empty seats.)", "", source, userid);
					} else {
						var x = 0;
						for(var i in Djs) {
							if(count[x] !== "x") {
								Djs[i].remainingPlays = Number(count[x]);
							}
							x++;
						}
						SpeakPlayCount();
					}
				}
			});
		}
	});
}