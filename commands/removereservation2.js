exports.name = '/removesave';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	IsMod(userid, function(isMod) {
		if(isMod) {
			reserveredFor = null;
			Speak("The reservation has been removed. Anyone can step up.");
		}
	});
}