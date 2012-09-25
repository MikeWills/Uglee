exports.name = 'set';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	if (source === 'pm') {
		var split = data.text.split(' ');
		if (split.length === 3) {
			SetValue(split[1], split[2]);
			TellUser(userid, "Value for " + split[1] + " set to " + split[2]);
		} else {
			TellUser(userid, "@" + AllUsers[userid].name + " correct syntax is set [option] [value]");
		}
	}
}