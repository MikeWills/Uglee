exports.name = '@' + botName.toLowerCase() + ' stats';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	Speak("I have been tracking data since 5/2012 and have been online most of that time.");
	Speak("Here are the commands I have for stats: /bestdjs, /bestplays, /mostawesomed, /mostlamed, /mostplayed, /mostsnagged, " + 
		  "/myhearts, /mymostawesomed, /mymostlamed, /mymostplayed, /mymostsnagged, /mypast24hours, /mypastweek, /mystats, "+
		  "/past24hours, /pastweek, /stats, /worstdjs");
}