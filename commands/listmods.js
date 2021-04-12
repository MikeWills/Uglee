exports.name = '/mods';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	IsMod(userid, function (isMod) {
		if (isMod) {
			bot.roomInfo(function (data) {
				Log(JSON.stringify(data.room.metadata.moderator_id));
				Speak(JSON.stringify(data.room.metadata.moderator_id), "", source, userid);
			});
		}
	});
}