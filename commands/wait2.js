exports.name = '!wait';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if (PastDjs[userid] === undefined){
		Speak("@{u}, you can DJ at any time.", AllUsers[userid].name, source, userid);
	} else {
		if (PastDjs[userid].waitDjs === 0) {
			Speak("@{u}, you can DJ at any time.", AllUsers[userid].name, source, userid);
		} else {
			Speak("@{u}, you must wait "+ PastDjs[userid].waitDjs +" more DJs.", AllUsers[userid].name, source, userid);
		}
	}
}