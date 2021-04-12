exports.name = 'd';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	if (AllUsers[userid].laptop === "android" || AllUsers[userid].laptop === "iphone") {
		Speak(AllUsers[userid].name + " is on a mobile device and is probably driving. Please don't distract them right now.");
	}
}