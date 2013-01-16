exports.name = '/followme';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	if(IsAdmin(userid)) {
		bot.modifyProfile({
			name: botName,
			website: botWebsite,
			twitter: botTwitter,
			facebook: botFacebook,
			about: botAbout,
			topartists: botTopartists,
			hangout: botHangout
		});
	}
}