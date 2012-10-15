var botWasBooted = false;
var totalPlays = 0;

global.OnReady = function(data) {
	Log(color("EVENT Ready", "blue"));
	GetValue("maxPlays", 0, function(max) {
		totalPlays = Number(max);
	});

	GetValue("DjQueue", 10, function(results) {
		if (results !== null){
		if(results.length !== 0) {
			Log(results);
			var jsonResult = JSON.parse(results);
			DjQueue.length = jsonResult.length;
			for(var i in jsonResult) {
				var dj = jsonResult[i];
				DjQueue[i] = dj;
			}
			Log(DjQueue);
		}
	}
	});
};

global.OnRoomChanged = function(data) {
	try {
		Log(color("EVENT Room Changed to " + data.room.name, "blue"));
		if(botWasBooted) {
			Speak("You're despicable!");
			botWasBooted = false;
		} else {
			//Speak("Oi! Ten thousand cycles will give you such a crick in the neck.");
		}

		if(currentRoomId !== data.room.roomid) {
			currentRoomId = data.room.roomid;
			SetUpRoom();
		}

		SetValue("roomName", data.room.name);

		if(data.room.metadata.current_song != null) {
			PopulateSongData(data);
		}

		// Keep track of all users
		Log("Loading Users");
		var users = data.users;
		for(var i in users) {
			var user = users[i];
			user.lastActivity = user.loggedIn = new Date();
			AllUsers[user.userid] = user;
			if(users[i].name !== null) {
				client.query('INSERT INTO ' + dbName + '.' + dbTablePrefix + 'User(roomid, userid, username, lastseen)' + 'VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE lastseen = NOW()', [currentRoomId, users[i].userid, users[i].name]);
			}
		}

		Log("Loading Djs");
		var djs = data.room.metadata.djs;
		for(var i = 0; i < djs.length; i++) {
			var djInfo = {
				userid: djs[i],
				name: AllUsers[djs[i]].name,
				remainingPlays: totalPlays,
				afkCount: 0,
				waitDjs: 0
			}
			Djs[djs[i]] = djInfo;
		}

		currentDj = data.room.metadata.current_dj;

		// Check if the bot should DJ.
		setTimeout(function() {
			ShouldBotDJ();
		}, 5000);

	} catch(e) {
		Log(color("**ERROR** Room Changed ", "red") + e);
	}
};

global.OnRegistered = function(data) {
	try {
		Log(color("EVENT Registered: ", "blue") + data.user[0].name + " - " + data.user[0].userid);

		if(currentsong != null) {
			currentsong.listeners++;
		}

		//Add new user(s) to cache
		var users = data.user;
		for(var i in users) {
			var user = users[i];
			user.lastActivity = user.loggedIn = new Date();
			AllUsers[user.userid] = user;
		}

		if(data.user[0].name !== null) {
			client.query('INSERT INTO ' + dbName + '.' + dbTablePrefix + 'User(roomid, userid, username, lastseen)' + 'VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE lastseen = NOW()', [currentRoomId, data.user[0].userid, data.user[0].name]);
		}

		// Check if User is banned
		client.query('SELECT userid, banned_by, DATE_FORMAT(timestamp, \'%c/%e/%y\')' + ' FROM BANNED_USERS WHERE userid LIKE \'' + user.userid + '\'', function cb(error, results, fields) {
			if(results != null && results.length > 0) {
				bot.boot(user.userid, 'You were banned from this room by ' + results[0]['banned_by'] + ' on ' + results[0]['timestamp']);
			}
		});

		// Mark the user as back in the room
		GetValue("enableQueue", 0, function(queueEnabled) {
			if(queueEnabled === "true") {
				if(DjQueue[data.user[0].userid] !== undefined) {
					DjQueue[data.user[0].userid].isAfk = false;
					DjQueue[data.user[0].userid].akfTime = null;
					DjQueue.length++;
					SetValue('DjQueue', JSON.stringify(DjQueue));
				}
				//bot.pm("Greetings @" + data.user[0].name + ". If you would like to DJ, please type 'q+' to get added to the queue.", data.user[0].userid);
			}
		});

	} catch(e) {
		Log(color("**ERROR** Room Changed ", "red") + e);
	}
};

global.OnDeregistered = function(data) {
	try {
		Log(color("EVENT Deregistered: ", "blue") + data.user[0].name + " - " + data.user[0].userid);

		if(currentsong != null) {
			currentsong.listeners--;
		}

		// Remove the user(s) from cache
		var users = data.user;
		for(var i in users) {
			var user = users[i];

			var now = new Date();
			var username = AllUsers[user.userid].name;
			if((now - AllUsers[user.userid].loggedIn) < 30000) {
				GetValue("gtfo", 0, function(value) {
					if(value === "true") {
						SpeakRandom(userLeaveQuickText, username);
					}
				});
			}

			delete AllUsers[user.userid];
		}

		// Mark the user as AFK (or out of the room in this case)
		GetValue("enableQueue", 0, function(queueEnabled) {
			if(queueEnabled === "true") {
				if(DjQueue[data.user[0].userid] !== undefined) {
					DjQueue[data.user[0].userid].isAfk = true;
					DjQueue[data.user[0].userid].akfTime = new Date();
					DjQueue.length--;
					SetValue('DjQueue', JSON.stringify(DjQueue));
				}
			}
		});

	} catch(e) {
		Log(color("**ERROR** Room Changed ", "red") + e);
	}
};

global.OnSpeak = function(data) {
	//Log(blue + "EVENT Speak: " + reset + JSON.stringify(data));
	Command("speak", data);
	AllUsers[data.userid].lastActivity = new Date();
};

global.OnEndSong = function(data) {
	Log(color("EVENT End Song: ", "blue") + data.room.metadata.current_song.metadata.artist + " - " + data.room.metadata.current_song.metadata.song);

	AddSongToDb();

	// Reset song data.
	danceRequesters = [];
	alreadyRolled = false;
	alreadyVoted = false;

	// Post song results
	var endsongresponse = currentsong.song + ' stats: :+1: ' + currentsong.up + ' :-1: ' + currentsong.down + ' <3 ' + currentsong.snags;
	GetValue("songstats", 0, function(value) {
		if(value === "true") {
			Speak(endsongresponse);
		}
	});

	// Make sure bot is aware that it is playing a song.
	if(data.room.metadata.current_dj === botUserId) {
		botIsPlayingSong = false;
		Log("Song has ended.");
	}

	// Bot steps down if needed to after it's song.
	if(botStepDownAfterSong) {
		Speak("Looks like me not needed anymore.");
		setTimeout(function() {
			Speak("/me pouts and slowly walks to the floor.");
			setTimeout(function() {
				bot.remDj();
			}, 500)
		}, 500)
		botDJing = false;
		botStepDownAfterSong = false;
	}
};

global.OnNewSong = function(data) {
	Log(color("EVENT New Song: ", "blue") + data.room.metadata.current_song.metadata.artist + " - " + data.room.metadata.current_song.metadata.song);
	danceCount = 0;
	lameCount = 0;
	snagCount = 0;

	// Populate new song data in currentsong
	PopulateSongData(data);

	// If the bot is DJing, randomize when it bops
	if(botDJing) {
		var rand = Math.ceil(Math.random() * 20);
		var wait = rand * 1000;
		setTimeout(function() {
			bot.vote('up');
			alreadyVoted = true;
		}, wait);
	}

	// Make sure bot is aware that it is playing a song.
	if(data.room.metadata.current_dj === botUserId) {
		botIsPlayingSong = true;
		Log("Playing song right now.");
	}

	lastDj = currentDj;
	currentDj = data.room.metadata.current_dj;
	if(currentDj !== botUserId && Djs[currentDj] !== undefined) {
		Djs[currentDj].remainingPlays--;
	}

	if(lastDj !== undefined) {
		GetValue("isModerating", 0, function(isModerating) {
			if(isModerating === "true") {
				if(Djs[lastDj] !== undefined && Djs[lastDj].remainingPlays === 0) {
					Log("Remove DJ " + AllUsers[lastDj].name + "after reaching max plays.");
					bot.remDj(lastDj);
					Speak("Thanks for the awesome songs @" + AllUsers[lastDj].name + "!");
				}
				setTimeout(function() {
					SpeakPlayCount();
				}, 2000);

			}
		});
	}
};

global.OnNoSong = function(data) {
	Log(color("EVENT No Song: ", "red") + JSON.stringify(data));
	if(botDJing) {
		bot.skip();
	}
};

global.OnUpdateVotes = function(data) {
	//Log(blue + "EVENT Update Votes: " + reset + JSON.stringify(data));
	if(data.room.metadata.votelog[0][1] == "down") {
		GetValue("lamer", 0, function(value) {
			if(value === "true" && botUserId !== data.room.metadata.votelog[0][0]) {
				SpeakRandom(downVoteText);
			}
		});
	}

	var votelog = data.room.metadata.votelog;
	for(var i = 0; i < votelog.length; i++) {
		var userid = votelog[i][0];
		//Log("Update Vote: " + userid);
		if(userid !== "") {
			AllUsers[userid].lastActivity = new Date();
		} else {
			Log("Update Vote: " + userid);
		}
	}

	currentsong.up = data.room.metadata.upvotes;
	currentsong.down = data.room.metadata.downvotes;
	currentsong.listeners = data.room.metadata.listeners;

	/* If autobop is enabled, determine if the bot should autobop or not based on votes */
	GetValue("autobop", 0, function(value) {
		if(value === "true") {
			var percentAwesome = 0;
			var percentLame = 0;

			if(data.room.metadata.upvotes !== 0) {
				percentAwesome = (data.room.metadata.upvotes / data.room.metadata.listeners) * 100;
			}
			if(data.room.metadata.downvotes !== 0) {
				percentLame = (data.room.metadata.downvotes / data.room.metadata.listeners) * 100;
			}

			if((percentAwesome - percentLame) > 40) {
				bot.vote('up');
				alreadyVoted = true;
			}

			if((percentLame - percentAwesome) > 40) {
				bot.vote('down');
				alreadyVoted = true;
			}
		}
	});
};

global.OnBootedUser = function(data) {
	Log(color("EVENT Booted User: ", "blue") + JSON.stringify(data));
	if(data.userid === botUserId) {
		botWasBooted = true;
		bot.roomDeregister();
		bot.roomRegister(botRoomId);
	}
};

global.OnUpdateUser = function(data) {
	Log(color("EVENT Update User: ", "blue") + JSON.stringify(data));
};

global.OnAddDJ = function(data) {
	Log(color("EVENT Add DJ: ", "blue") + data.user[0].name);

	NewDjFromQueue(data);

	var user = data.user[0];
	AllUsers[user.userid].lastActivity = new Date();

	GetValue("maxPlays", 0, function(max) {
		var djInfo = {
			userid: user.userid,
			name: AllUsers[user.userid].name,
			remainingPlays: Number(max),
			afkCount: 0,
			waitDjs: 0
		}
		Djs[user.userid] = djInfo;
	});

	// Check if the bot should DJ.
	ShouldBotDJ();
};

global.OnRemDJ = function(data) {
	Log(color("EVENT Remove DJ: ", "blue") + data.user[0].name);

	waitingOnNextDj = false;

	/* Notify the next DJ on the list */
	NextDjOnQueue();

	// If the bot is removed from the table, mark the bot as not DJing. 
	// If the bot was forcefully removed, disable autodj to make sure it doesn't step up again.
	if(data.user[0].userid === botUserId) {
		botDJing = false;
		Log("Bot no longer DJing");
		if(data.modid !== undefined) {
			Log("Forcibly Removed");
			SetValue("autodj", "false");
		}
	}

	// If the bot is moderating the room, save the DJ info in case they steped down early
	var user = data.user[0];
	delete Djs[user.userid];

	// Check if the bot should DJ.
	ShouldBotDJ();
};

global.OnNewModerator = function(data) {
	Log(color("EVENT New Moderator: ", "blue") + JSON.stringify(data));
};

global.OnRemModerator = function(data) {
	Log(color("EVENT Remove Moderator: ", "blue") + JSON.stringify(data));
};

global.OnSnagged = function(data) {
	Log(color("EVENT Snagged: ", "blue") + JSON.stringify(data));
	//Increase song snag count
	currentsong.snags++;

	var userid = data.userid;
	AllUsers[userid].lastActivity = new Date();

	// Add the song if there are 2 or more snags.
	if(currentsong.snags === 2) {
		Log("Snagging the song " + currentsong.song + " by " + currentsong.artist);
		bot.vote('up');
		alreadyVoted = true;
		bot.playlistAll(function(data) {
			bot.playlistAdd(currentsong.id, data.list.length);
		});
		bot.snag();
	}
};

global.OnPmmed = function(data) {
	Log(color("EVENT PMmed: ", "blue") + JSON.stringify(data));
	Command("pm", data);
	if(AllUsers[data.senderid] !== undefined) {
		AllUsers[data.senderid].lastActivity = new Date();
	}
};

global.OnError = function(data) {
	Log(color("EVENT **ERROR**: ", "red") + JSON.stringify(data));
};

global.OnTcpConnect = function(socket) {
	Log(color("EVENT TCP Connect: ", "blue") + socket);
};

global.OnTcpMessage = function(socket, msg) {
	Log(color("EVENT TCP Message: ", "blue") + socket + msg);
};

global.OnTcpEnd = function(socket) {
	Log(color("EVENT TCP End: ", "blue") + socket);
};

global.OnHttpRequest = function(request, response) {
	Log(color("EVENT HTTP Request: ", "blue") + request + response);
};