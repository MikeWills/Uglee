global.version = "0.2";

// Load Node.js modules
var Bot = require('ttapi');
global.util = require('util');
global.fs = require('fs');
global.color = require("ansi-color").set;
require("datejs");

// Load bot modules
global.Database = require("./database.js");
global.Events = require("./events.js");
global.Functions = require("./functions.js");
global.LastFmNode = require('lastfm').LastFmNode;
//global.Quotes = require("./quotes.js");
global.currentRoomId = botRoomId;

Log("==================================================================", "log");

// Setup mySQL
try {
	global.mysql = require('mysql');
} catch (e) {
	Log(e);
	Log('It is likely that you do not have the mysql node module installed.' + 
		'\nUse the command \'npm install mysql\' to install.', "error", "mySQL");
	process.exit(0);
}

//Connects to mysql server
try {
	global.client = mysql.createConnection({
		"host": dbHost,
		"user": dbLogin,
		"password": dbPassword
	});
	SetUpDatabase();
} catch (e) {
	Log(e);
	Log('Make sure that a mysql server instance is running and that the ' + 
		'username and password information in config.js are correct.', "error", "mySQL");
	process.exit(0);
}

function handleDisconnect(client) {
  client.on('error', function(err) {
    if (!err.fatal) {
      return;
    }

    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err;
    }

    Log('Re-connecting lost connection: ' + err.stack, "error", "mySQL");

    client = mysql.createConnection({
		"host": dbHost,
		"user": dbLogin,
		"password": dbPassword
	});
    handleDisconnect(client);
    client.connect();
  });
}

handleDisconnect(client);

global.lastfm = new LastFmNode({
	api_key: lastfmApiKey,
	secret: lastfmApiSecret
});

process.on('message', function(m) {
    if (m.status && m.msg === 'are_you_there') {
        process.send({
            status: true,
            msg: 'online',
            process: m.process,
            name: botName
        });
    }
});

Log("Initializing");

// Initialize global variables
global.AllUsers = {}; // A list of all users in the room
global.commands = new Array(); // Array of command handlers
global.Settings = {};
// DJ Data
global.Djs = {};
global.PastDjs = {};
global.lastDJ = "";
global.lastDjName = "";
global.currentDj = "";
global.votedDjs = [];
global.firstSong = true;

// Queue Data
global.DjQueue = {
	"length": 0
};
global.nextDj = null;
global.nextDjTime = null;
global.queueRefreshIntervalId = null;
global.queueRefreshIntervalRunning = false;
global.missedQueue = [];
global.qPosn = 0;
global.waitingOnNextDj = false;

// Working data
global.danceCount = 0;
global.danceRequesters = [];
global.lameCount = 0;
global.lameRequesters = [];
global.snagCount = 0;
global.alreadyRolled = false;
global.alreadyVoted = false;
global.Subscribers = [];
global.reserveredFor = null;
global.reservedRemovedDjs = {};

// DJing bot
global.botDJing = false;
global.botOnTable = false;
global.botIsPlayingSong = false;
global.botStepDownAfterSong = false;

//Current song info
global.currentsong = {
	artist: null,
	song: null,
	djname: null,
	djid: null,
	up: 0,
	down: 0,
	listeners: 0,
	snags: 0,
	id: null,
	length: 0
};

//Other
global.songWarningIntervalId = null;
global.songBootIntervalId = null;

// This is a catch-all
process.on("uncaughtException", function(data) {
	Log(data, "error", "Process error");
	connect(botRoomId);
});

// Start up bot
try {
	global.bot = new Bot(botAuthId, botUserId, botRoomId);
} catch (e) {
	setTimeout(function() {
		Log("Error loggin in with error of " + e, "error", "Bot login")
		process.exit(0);
	}, 150000); // 2.5 minutes
}

// Load commands
try {
	var filenames = fs.readdirSync('./commands');
	for (i in filenames) {
		if (filenames[i] !== ".DS_Store") {
			var command = require('./commands/' + filenames[i]);
			commands.push({
				name: command.name,
				handler: command.handler,
				hidden: command.hidden,
				enabled: command.enabled,
				matchStart: command.matchStart
			});
		}
	}
} catch (e) {
	Log(e, "error", "Load commands");
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
bot.on("disconnected", OnDisconnect);
Log("Done");

Log("Ready");

// Look for users that are idle and boot them
GetValue('bootOnIdle', 0, function(retVal) {
	if (retVal === "true") {
		setInterval(function() {
			GetValue("idleTime", 0, function(val) {
				for (var z in AllUsers) {
					var startDate = new Date();
					var idleTime = Math.round((startDate - AllUsers[z].lastActivity) / 3600000); // in hours
					//var idleTime = Math.round((startDate - AllUsers[z].lastActivity) / 60000); // for testing minutes
					//Log(AllUsers[z].name + ": " + idleTime);
					if (idleTime >= val) {
						Log("Bot booted " + AllUsers[z].name, "log");
						//bot.bootUser(z, "You have been booted for being idle."); // Uncomment this to activate
					}
				}
			});
		}, 3600000); // 1 Hour
	}
});
