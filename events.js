var botWasBooted = false;

global.OnReady = function(data) {
	Log(color("EVENT Ready", "blue"));
};

global.OnRoomChanged = function(data) {
	try {
		Log(color("EVENT Room Changed to " + data.room.name, "blue"));
		if (botWasBooted) {
			Speak("You're despicable!");
			botWasBooted = false;
		} else {
			Speak("Oi! Ten thousand cycles will give you such a crick in the neck.");
		}

		if (data.room.metadata.current_song != null) {
			PopulateSongData(data);
		}

		// Keep track of all users
		var users = data.users;
		for (var i in users) {
			var user = users[i];
			user.lastActivity = user.loggedIn = new Date();
			AllUsers[user.userid] = user;
		}

		// Check if the bot should DJ.
		ShouldBotDJ();

	} catch (e) {
		Log(color("**ERROR** Room Changed ", "red") + e);
	}
};

global.OnRegistered = function(data) {
	try {
		Log(color("EVENT Registered: ", "blue") + data.user[0].name + " - " + data.user[0].userid);

		if (currentsong != null) {
			currentsong.listeners++;
		}

		// Check if User is banned
		client.query("SELECT COUNT(*) as count FROM BANNED WHERE `userid` = ?", [data.user[0].userid], function select(error, results, fields) {
			if (results !== undefined) {
				if (results.length !== 0) {
					if (results[0]["count"] > 0) {
						Log(color("EVENT BOOT: ", "red") + data.user[0].name + " - " + data.user[0].userid);
						bot.boot(data.user[0].userid, "");
					}
				}
			}
		});

		//Add new user(s) to cache
		var users = data.user;
		for (var i in users) {
			var user = users[i];
			user.lastActivity = user.loggedIn = new Date();
			AllUsers[user.userid] = user;
		}

	} catch (e) {
		Log(color("**ERROR** Room Changed ", "red") + e);
	}
};

global.OnDeregistered = function(data) {
	try {
		Log(color("EVENT Deregistered: ", "blue") + data.user[0].name + " - " + data.user[0].userid);

		if (currentsong != null) {
			currentsong.listeners--;
		}

		// Remove the user(s) from cache
		var users = data.user;
		for (var i in users) {
			var user = users[i];

			var now = new Date();
			var username = AllUsers[user.userid].name;
			if ((now - AllUsers[user.userid].loggedIn) < 30000) {
				GetValue("gtfo", 0, function(value) {
					if (value === "true") {
						SpeakRandom(userLeaveQuickText, username);
					}
				});
			}

			delete AllUsers[user.userid];
		}

	} catch (e) {
		Log(color("**ERROR** Room Changed ", "red") + e);
	}
};

global.OnSpeak = function(data) {
	//Log(blue + "EVENT Speak: " + reset + JSON.stringify(data));
	Command("speak", data);
};

global.OnEndSong = function(data) {
	Log(color("EVENT End Song: ", "blue") + data.room.metadata.current_song.metadata.artist + " - " + data.room.metadata.current_song.metadata.song);

	// Reset song data.
	danceRequesters = [];
	alreadyRolled = false;
	alreadyVoted = false;

	// Post song results
	var endsongresponse = currentsong.song + ' stats: :+1: ' + currentsong.up + ' :-1: ' + currentsong.down + ' <3 ' + currentsong.snags;
	GetValue("songstats", 0, function(value) {
		if (value === "true") {
			Speak(endsongresponse);
		}
	});

	// Make sure bot is aware that it is playing a song.
	if (data.room.metadata.current_dj === botUserId) {
		botIsPlayingSong = false;
		Log("Song has ended.");
	}

	// Bot steps down if needed to after it's song.
	if (botStepDownAfterSong) {
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

	//Populate new song data in currentsong
	PopulateSongData(data);

	var rand = Math.ceil(Math.random() * 20);
	var wait = rand * 1000;
	if (botDJing) {
		setTimeout(function() {
			bot.vote('up');
			alreadyVoted = true;
		}, wait);
	}

	// Make sure bot is aware that it is playing a song.
	if (data.room.metadata.current_dj === botUserId) {
		botIsPlayingSong = true;
		Log("Playing song right now.");
	}
};

global.OnNoSong = function(data) {
	Log(color("EVENT No Song: ", "red") + JSON.stringify(data));
};

global.OnUpdateVotes = function(data) {
	//Log(blue + "EVENT Update Votes: " + reset + JSON.stringify(data));
	if (data.room.metadata.votelog[0][1] == "down") {
		GetValue("lamer", 0, function(value) {
			if (value === "true") {
				SpeakRandom(downVoteText);
			}
		});
	}

	currentsong.up = data.room.metadata.upvotes;
	currentsong.down = data.room.metadata.downvotes;
	currentsong.listeners = data.room.metadata.listeners;

	/* If autobop is enabled, determine if the bot should autobop or not based on votes */
	GetValue("autobop", 0, function(value) {
		if (value === "true") {
			var percentAwesome = 0;
			var percentLame = 0;

			if (data.room.metadata.upvotes !== 0) {
				percentAwesome = (data.room.metadata.upvotes / data.room.metadata.listeners) * 100;
			}
			if (data.room.metadata.downvotes !== 0) {
				percentLame = (data.room.metadata.downvotes / data.room.metadata.listeners) * 100;
			}

			if ((percentAwesome - percentLame) > 40) {
				bot.vote('up');
				alreadyVoted = true;
			}

			if ((percentLame - percentAwesome) > 40) {
				bot.vote('down');
				alreadyVoted = true;
			}
		}
	});
};

global.OnBootedUser = function(data) {
	Log(color("EVENT Booted User: ", "blue") + JSON.stringify(data));
	if (data.userid === botUserId) {
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

	// Check if the bot should DJ.
	ShouldBotDJ();
};

global.OnRemDJ = function(data) {
	Log(color("EVENT Remove DJ: ", "blue") + data.user[0].name);
	Log(JSON.stringify(data));
	if (data.user[0].userid === botUserId) {
		botDJing = false;
		Log("Bot no longer DJing");
	}

	if (data.modid !== undefined) {
		Log("Forcibly Removed");
		SetValue("autodj", "false");
	} else {
		// Check if the bot should DJ.
		ShouldBotDJ();
	}
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

	// Add the song if there are 2 or more snags.
	if (currentsong.snags === 2) {
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