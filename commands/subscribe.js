exports.name = '/subscribe';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
	Subscribers.push(userid);
	SetValue("Subscribers", JSON.stringify(Subscribers));
	Speak("Thanks for subscribing @" + AllUsers[userid].name + "! I will let you know when we are active in this room.");
}