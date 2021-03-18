exports.name = '/uploadonly';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	Speak("ATTENTION DJS! Please only play songs that you uploaded, songs without any album art, or songs that work when you preview them. You will be removed by a mod if you don't skip a silent song.");
}