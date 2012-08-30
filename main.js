global.Events = require("./events.js");
global.Functions = require("./functions.js");
var Bot = require('ttapi');
var util = require('util');
var mysql = require('mysql');

Log("Initializing");
global.red   = '\033[31m';
global.blue  = '\033[34m';
global.reset = '\033[0m';

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

// Check that TT is up every 15 minutes
setInterval(function(){
	try{
		bot.roomNow(function(data){
			Log("TT is up.");
		});
	} catch (e){
		Log(red + "TT is down." + reset);
		Log(red + "** ERROR TT_UP_CHECK ** " + reset + e);
	}
},900000);