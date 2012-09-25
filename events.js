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

	var endsongresponse = currentsong.song + ' stats: :+1: ' + currentsong.up + ' :-1: ' + currentsong.down + ' <3 ' + currentsong.snags;
	GetValue("songstats", 0, function(value) {
		if (value === "true") {
			Speak(endsongresponse);
		}
	});
	danceRequesters = [];
};

global.OnNewSong = function(data) {
	Log(color("EVENT New Song: ", "blue") + data.room.metadata.current_song.metadata.artist + " - " + data.room.metadata.current_song.metadata.song);
	danceCount = 0;
	//Populate new song data in currentsong
	PopulateSongData(data);
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
};

global.OnRemDJ = function(data) {
	Log(color("EVENT Remove DJ: ", "blue") + data.user[0].name);
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