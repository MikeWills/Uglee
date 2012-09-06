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

// Start up bot
global.bot = new Bot(botAuthId, botUserId, botRoomId);
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
	Log("Uptime Check");
	try{
		bot.roomInfo(function(data){
			if (data.room.roomid !== botRoomId){
				Log("Not in the right room.");
				setTimeout( function() { bot.roomRegister(botRoomId); }, 300000);
			}
		});
	} catch (e){
		Log(color("TT is down.", "red"));
		Log(color("** ERROR TT_UP_CHECK ** ", "red") + e);
		setTimeout( function() { bot.roomRegister(botRoomId); }, 300000);
	}
},300000);