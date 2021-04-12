exports.name = '@' + botName.toLowerCase() + ' stats';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	Speak("I have been tracking data since 3/2021 and have been online most of that time.", "", source, userid);
	Speak("Here are the commands I have for stats: /bestdjs, /bestplays, /mostawesomed, /mostlamed, /mostplayed, /mostsnagged, " + 
		  "/myhearts, /mymostawesomed, /mymostlamed, /mymostplayed, /mymostsnagged, /mypast24hours, /mypastweek, /mystats, "+
		  "/past24hours, /pastweek, /stats, /worstdjs", "", source, userid);
}