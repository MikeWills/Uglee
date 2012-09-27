exports.name = '/ban';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
	var userName = data.text.substring(6);

	for (i in AllUsers) {
		if (AllUsers[i].name == userName) {
			Log(color("EVENT BOOT: ", "red") + AllUsers[i].name + " - " + i);
			client.query("INSERT INTO BANNED (`userid`, `username`, `timestamp`) VALUES (?, ?, CURRENT_TIMESTAMP)", [i, userName]);
			bot.bootUser(i, "");
		}
	}
}