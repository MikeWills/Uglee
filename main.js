// Load Node.js modules
var Bot = require('ttapi');
var util = require('util');
var mysql = require('mysql');
global.color = require("ansi-color").set;

// Load bot modules
global.Events = require("./events.js");
global.Functions = require("./functions.js");
global.Quotes = require("./quotes.js");

Log("Initializing");

// Initialize global variables
global.AllUsers = {};

// Working data
global.danceCount = 0;
global.lameCount = 0;

process.on("uncaughtException", function(data){
	Log("Process error " + data);
	setTimeout( function() { process.exit(0); }, 150000);
});

// Start up bot
try {
	global.bot = new Bot(botAuthId, botUserId, botRoomId);
} catch (e){
	setTimeout( function() { process.exit(0); }, 300000);
}
Log("Done");

Log("Hooking events");
bot.on('tcpConnect', OnTcpConnect);
bot.on('tcpMessage', OnTcpMessage);
bot.on('tcpEnd', OnTcpEnd);
bot.on('httpRequest', OnHttpRequest);
bot.on("ready", OnReady);
bot.on("roomChanged", OnRoomChanged);
bot.on("registered", OnRegistered);
bot.on("deregistered", OnDeregistered);
bot.on("speak", OnSpeak);
bot.on("endsong", OnEndSong);
bot.on("newsong", OnNewSong);
bot.on("nosong", OnNoSong);
bot.on("update_votes", OnUpdateVotes);
bot.on("booted_user", OnBootedUser);
bot.on("update_user", OnUpdateUser);
bot.on("add_dj", OnAddDJ);
bot.on("rem_dj", OnRemDJ);
bot.on("new_moderator", OnNewModerator);
bot.on("rem_moderator", OnRemModerator);
bot.on("snagged", OnSnagged);
bot.on("pmmed", OnPmmed);
bot.on("error", OnError);
Log("Done");

Log("Ready");

// Check that TT is up every 5 minutes. This is so the bot can gracefully restart when the site comes back up.
setInterval(function(){
	var ttUp = false;
	Log("Uptime Check");
	try{
		bot.listRooms({ skip: 0 }, function(data){
			ttUp = true;
			Log("Turntable.FM is up.");
		});
		setTimeout( function() { 
			if (ttUp === false) {
				Log("Turntable.FM is down.");
				setTimeout( function() { 
					Log("Shutting down (forever should restart)")
					process.exit(0); 
				}, 150000);
			} 
		}, 60000);
	} catch (e){
		Log(color("TT is down.", "red"));
		Log(color("** ERROR TT_UP_CHECK ** ", "red") + e);
				setTimeout( function() { 
					Log("Shutting down (forever should restart)")
					process.exit(0); 
				}, 150000);
	}
},300000); // 300000