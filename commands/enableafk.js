exports.name = '/enableafk';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if(userid !== botUserId) {
		IsMod(userid, function(isMod) {
			if(isMod) {
				firstSong = true;
				Log("First song: " + firstSong);
				SetValue("monitorAfk", "true");
				Speak("AFK enabled", "", source, userid);
			}
		});
	}
}