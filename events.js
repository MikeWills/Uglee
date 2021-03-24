var botWasBooted = false;
global.totalPlays = 0;
var bootedNextDJ = false;
global.curSongWatchdog = null;
global.takedownTimer = null;
global.idleDjSpotTimer = null;
global.botModed = false;

global.OnDisconnect = function(data) {
	if (!disconnected) {
		// Set the disconnected flag and display message
		disconnected = true;
		Log(data, "error", "DISCONNECTED");
		// Attempt to reconnect in 10 seconds
		setTimeout(connect, 10 * 1000, botRoomId);
	}
}

global.connect = function(roomid) {
	// Reset the disconnected flag
	disconnected = false;

	// Attempt to join the room
	bot.roomRegister(roomid, function(data) {
		if (data && data.success) {
			Log('Joined ' + data.room.name, "log");
		} else {
			Log(data, "error", "DISCONNECTED");
			if (!disconnected) {
				// Set the disconnected flag
				disconnected = true;
				// Try again in 60 seconds
				setTimeout(connect, 60 * 1000, roomid);
			}
		}
	});
}

global.OnReady = function(data) {
	Log("Ready", "", "Ready");
	GetValue("maxPlays", 0, function(max) {
		totalPlays = Number(max);
	});

	// Get the cached version of the DJ queue
	GetValue("DjQueue", 10, function(results) {
		if (results !== null) {
			if (results.length !== 0) {
				Log(results);
				var jsonResult = JSON.parse(results);
				DjQueue.length = jsonResult.length;
				for (var i in jsonResult) {
					var dj = jsonResult[i];
					DjQueue[i] = dj;
				}
				Log(DjQueue);
			}
		}
	});

	// Get the subscribers for the PM list
	GetValue("Subscribers", 0, function(results) {
		if (results !== null) {
			var jsonResult = JSON.parse(results);
			Subscribers = jsonResult;
		}
	});
}

global.OnRoomChanged = function(data) {
	try {
		if (data.success) {
			Log(data.room.name, "log", "Room Changed");

			if (botWasBooted) {
				Speak("You're despicable!");
				botWasBooted = false;
			} else {
				Speak(startupText);
			}

			if (currentRoomId !== data.room.roomid) {
				currentRoomId = data.room.roomid;
				SetUpRoom();
				SetValue("roomName", data.room.name);
			}

			LoadRoomSettings(data.room.roomid);

			if (data.room.metadata.current_song != null) {
				PopulateSongData(data);
			}

			// Keep track of all users
			Log("Loading Users");
			var users = data.users;
			for (var i in users) {
				var user = users[i];
				var newUser = {
					name: user.name,
					userid: user.userid,
					points: user.points,
					lastActivity: new Date(),
					loggedIn: new Date(),
					laptop: user.laptop
				};
				AllUsers[user.userid] = newUser;
				if (users[i].name !== null) {
					client.query('INSERT INTO ' + dbName + '.' + dbTablePrefix + 'User(roomid, userid, username, lastseen)' + 'VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE lastseen = NOW()', [currentRoomId, users[i].userid, users[i].name]);
				}
			}

			setTimeout(function() {
				LoadDjs(data);
			}, 2500);

			currentDj = data.room.metadata.current_dj;

			// Check if the bot should DJ.
			setTimeout(function() {
				ShouldBotDJ();
			}, 5000);
		} else {
			Log("Cannot connect to room id " + botRoomId + ". ErrNo: " + data.errno + "  MsgId: " + data.msgid + "  Err: " + data.err, "error", "Room Changed");
			bot.pm("Cannot connect to room id " + botRoomId + ". ErrNo: " + data.errno + "  MsgId: " + data.msgid + "  Err: " + data.err, botAdmins[0]);
		}

	} catch (e) {
		Log(e, "error", "Room Changed");
		Log(JSON.stringify(data), "error", "Room Changed");
		setTimeout(connect, 20 * 60 * 1000, roomid);
	}
};

global.OnRegistered = function(data) {
	try {
		Log(data.user[0].userid + " - " + data.user[0].name, "", "Registered");

		if (currentsong != null) {
			currentsong.listeners++;
		}

		//Add new user(s) to cache
		var users = data.user;
		for (var i in users) {
			var user = users[i];
			var newUser = {
				name: user.name,
				userid: user.userid,
				points: user.points,
				lastActivity: new Date(),
				loggedIn: new Date(),
				laptop: user.laptop
			};
			AllUsers[user.userid] = newUser;
		}

		setTimeout(function() {
			if (users[0].registered === undefined) {
				if (Settings["banGuest"] !== undefined && Settings["banGuest"].value === "true") {
					bot.boot(user.userid, "We're sorry. Due to issues with trolling, we only allow registered users in our room.");
				} else {
					// Greet n00b
					Speak(welcomeVisitorText, users[0].name);
				}
			}
		}, 2500);

		if (data.user[0].name !== null) {
			client.query('INSERT INTO ' + dbName + '.' + dbTablePrefix + 'User(roomid, userid, username, lastseen)' + 'VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE lastseen = NOW()', [currentRoomId, data.user[0].userid, data.user[0].name]);
		}

		// Check if User is banned
		client.query('SELECT userid, banned_by, DATE_FORMAT(timestamp, \'%c/%e/%y\') as timestamp' + ' FROM BANNED WHERE userid LIKE \'' + user.userid + '\'', function cb(error, results, fields) {
			if (results != null && results.length > 0) {

				if (user.userid !== botUserId) {
					bot.boot(user.userid, 'You were banned from this room by ' + results[0]['banned_by'] + ' on ' + results[0]['timestamp']);
					Log(user.userid, 'You were banned from this room by ' + results[0]['banned_by'] + ' on ' + results[0]['timestamp'], "log");
				}
			}
		});

		// Check if User has an alert
		client.query('SELECT `userid`,`byName`,`reason` FROM `ALERT` WHERE `userid` LIKE \'' + user.userid + '\'', function cb(error, results, fields) {
			if (results != null && results.length > 0) {
				Log("ALERT on user " + AllUsers[user.userid].name + " (" + user.userid + ")", "log");
				PmAllOnlineMods("ALERT: " + AllUsers[user.userid].name + " has just entered and should be watched. Reason: '" + results[0]['reason'] + "' (by " + results[0]['byName'] + ")");
			}
		});

		// Look to see if the newly entered person is new or has previously visited. 
		setTimeout(function () {
			var PastGuest = false;
			Log("Past Guest: " + PastGuest);
			client.query('SELECT `userid`, `username` from ' + dbName + '.' + dbTablePrefix + "User WHERE `userid` = '" + data.user[0].userid + "' and `roomid` = '" + currentRoomId + "'", function cb(error, results, fields) {
				Log("Old User: " + results.length);
				if (results != null && results.length > 0) {
					PastGuest = true;
				}

				Log("Past Guest: " + PastGuest);
				if (!PastGuest) {
					if (Settings["welcomeMsg"] !== undefined && Settings["welcomeMsg"].value === "true") {
						if (AllUsers[data.user[0].userid] !== undefined) {
							var d = new Date();
							var dayOfWeek = d.getDay();
							//Speak(welcomeDaily[dayOfWeek], AllUsers[data.user[0].userid].name, "pm", data.user[0].userid);
							Speak(welcomeDaily[dayOfWeek], AllUsers[data.user[0].userid].name);
							GetValue("enableQueue", 0, function (results) {
								if (results == "true") {
									Speak("To spin some tunes, type q+ to get in line.")
								}
							});
						}
					}
				}
				else {
					if (Settings["welcomeMsg"] !== undefined && Settings["welcomeMsg"].value === "true") {
						if (AllUsers[data.user[0].userid] !== undefined) {
							var d = new Date();
							var dayOfWeek = d.getDay();
							Speak(welcomeText, AllUsers[data.user[0].userid].name);
							GetValue("enableQueue", 0, function (results) {
								if (results == "true") {
									Speak("The queue is active, type q+ to get in line.")
								}
							});
						};
					}
				}
			});

		}, 2500);

		// Mark the user as back in the room
		if (Settings["enableQueue"] !== undefined && Settings["enableQueue"].value === "true") {
			if (DjQueue[data.user[0].userid] !== undefined) {
				DjQueue[data.user[0].userid].isAfk = false;
				DjQueue[data.user[0].userid].akfTime = null;
				DjQueue.length++;
				SetValue('DjQueue', JSON.stringify(DjQueue));
			}
			//bot.pm("Greetings @" + data.user[0].name + ". If you would like to DJ, please type 'q+' to get added to the queue.", data.user[0].userid);
		}

		ShouldBotDJ();

		if (data.user[0].userid === '4dfb57154fe7d061dd013a44') {
			setTimeout(function() {
				bot.pm("Hello master, how may I be of service?", '4dfb57154fe7d061dd013a44');
			}, 5000);
		}

	} catch (e) {
		Log(e, "error", "Registered");
	}
};

global.OnDeregistered = function(data) {
	try {
		Log(data.user[0].userid + " - " + data.user[0].name, "", "Deregistered");

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
				if (Settings["gtfo"].value === "true") {
					SpeakRandom(userLeaveQuickText, username);
				}
			}

			delete AllUsers[user.userid];
		}

		// Mark the user as AFK (or out of the room in this case)
		if (Settings["enableQueue"].value === "true") {
			if (DjQueue[data.user[0].userid] !== undefined) {
				DjQueue[data.user[0].userid].isAfk = true;
				DjQueue[data.user[0].userid].akfTime = new Date();
				DjQueue.length--;
				SetValue('DjQueue', JSON.stringify(DjQueue));
			}
		}

		ShouldBotDJ();

	} catch (e) {
		Log(e, "error", "Deregistered");
	}
};

global.OnSpeak = function(data) {
	//Log(color("EVENT Speak: ", "blue") + JSON.stringify(data));
	Command("speak", data);

	if (AllUsers[data.userid] !== undefined) {
		AllUsers[data.userid].lastActivity = new Date();
	}
};

global.OnPmmed = function(data) {
	//console.log(JSON.stringify(data));

	if (AllUsers[data.senderid] !== undefined) {
		Log(data.senderid + ' - ' + AllUsers[data.senderid].name + ' PMed: "' + data.text + '"', "log", "PMmed");
		AllUsers[data.senderid].lastActivity = new Date();
	}

	Command("pm", data);
};

global.OnEndSong = function(data) {
	Log("OnEndSong");
	Log(data.room.metadata.current_song.metadata.artist + " - " + data.room.metadata.current_song.metadata.song, "", "End Song");

	AddSongToDb();

	// Reset song data.
	danceRequesters = [];
	alreadyRolled = false;
	alreadyVoted = false;

	// Post song results
	var endsongresponse = currentsong.song + ' stats: :+1: ' + currentsong.up + ' :-1: ' + currentsong.down + ' <3 ' + currentsong.snags;
	Log(endsongresponse);
	Log(Settings["songstats"].value);

	if (Settings["songstats"].value === "true") {
		Speak(endsongresponse);
	}

	// Make sure bot is aware that it is playing a song.
	if (data.room.metadata.current_dj === botUserId) {
		botIsPlayingSong = false;
	}

	// Bot steps down if needed to after it's song.
	if (botStepDownAfterSong) { 
		Speak(stepDownText);
		setTimeout(function() {
			bot.remDj();
		}, 500)
		botDJing = false;
		botStepDownAfterSong = false;
	}
	clearTimeout(songWarningIntervalId);
	clearTimeout(songBootIntervalId);
};

global.OnNewSong = function(data) {
	Log("OnNewSong");
	var songLength = Number(data.room.metadata.current_song.metadata.length) / 60;
	var length = data.room.metadata.current_song.metadata.length;
	lastDj = currentDj;
	currentDj = data.room.metadata.current_dj;
	if (AllUsers[currentDj] !== undefined) {
		lastDjName = AllUsers[currentDj].name;
	} else {
		lastDjName = "";
	}
	Log(data.room.metadata.current_song.metadata.artist + " - " + data.room.metadata.current_song.metadata.song + " | Length: " + songLength + " minutes.", "", "New Song");
	//Log(color("EVENT New Song: ", "blue") + JSON.stringify(data));
	danceCount = 0;
	lameCount = 0;
	snagCount = 0;

	// Populate new song data in currentsong
	PopulateSongData(data);

	if (Settings["monitorHungSong"].value === "true") {
		// If watch dog has been previously set, 
		// clear since we've made it to the next song
		if (curSongWatchdog != null) {
			clearTimeout(curSongWatchdog);
			curSongWatchdog = null;
		}

		// If takedown Timer has been set, 
		// clear since we've made it to the next song
		if (takedownTimer != null) {
			clearTimeout(takedownTimer);
			takedownTimer = null;
		}

		// Set a new watchdog timer for the current song.
		curSongWatchdog = setTimeout(function() {
			curSongWatchdog = null;
			Speak("@{u}, you have 15 seconds to skip your stuck song before you are removed", lastDjName, "", currentDj);
			//START THE 10 SEC TIMER
			takedownTimer = setTimeout(function() {
				takedownTimer = null;
				bot.remDj(currentDj); // Remove Saved DJ from last newsong call
				Log(currentDj + " removed for hung song.", "log");
			}, 15 * 1000); // Current DJ has 10 seconds to skip before they are removed
		}, (length + 15) * 1000); // Timer expires 10 seconds after the end of the song, if not cleared by a newsong  
	}

	// If the bot is DJing, randomize when it bops
	if (botDJing) {
		var rand = Math.ceil(Math.random() * 20);
		var wait = rand * 1000;
		setTimeout(function() {
			bot.vote('up');
			alreadyVoted = true;
		}, wait);
	}

	// Make sure bot is aware that it is playing a song.
	if (data.room.metadata.current_dj === botUserId) {
		botIsPlayingSong = true;
	}

	if (Djs[currentDj] !== undefined) {
		Djs[currentDj].remainingPlays--;
		SetValue('Djs', JSON.stringify(Djs));
	}

	if (lastDj !== undefined) {
		if (Settings["isModerating"].value === "true") {
			if (Djs[lastDj] !== undefined && Djs[lastDj].remainingPlays <= 0) {
				Log("Remove DJ " + AllUsers[lastDj].name + " after reaching max plays.");
				bot.remDj(lastDj);
				Speak("@" + AllUsers[lastDj].name + "Thank you for your spin. You will be added back to the queue. To leave the queue type `q-`");
				if ((Settings["djWait"].value > 1) || (DjQueue.length > 1)){
					Speak("Please wait " + Settings["djWait"].value + " DJs before DJing again.", "", "pm",lastDj);
				}
				SetValue('Djs', JSON.stringify(Djs));
			}
			if (Settings["maxPlays"].value > 1){
				setTimeout(function() {
					SpeakPlayCount();
				}, 2000);
		    }
		}
	}

	var OldVotedDjs = votedDjs;
	votedDjs = [];
	if (Settings["monitorAfk"].value === "true") {
		var afkPlayCount = Settings["afkMissedSongs"].value;
		if (!firstSong) {
			for (var i in Djs) {
				if (lastDj !== i && lastDj !== botUserId) {
					if (OldVotedDjs.indexOf(i) === -1) {
						Djs[i].afkCount++;
						if (Djs[i].afkCount >= afkPlayCount) {
							Log(i + " - " + AllUsers[i].name + " removed for being AFK.", "log");
							if (i === currentDj) {
								bootedNextDJ = true;
								firstSong = true; // this is so everyone else isn't booted when the dj is booted
							}
							bot.remDj(i);
							Speak(msgAFKBoot, AllUsers[i].name, i);
						} else if (Djs[i].afkCount >= 1) {
							Log(i + " - " + AllUsers[i].name + " warned for being AFK.", "log");
							Speak(msgAFKWarn, AllUsers[i].name, i);
						}
					} else {
						Djs[i].afkCount = 0;
					}
				}
			}
		}
		//votedDjs = [];
		if (!bootedNextDJ) {
			firstSong = false;
		}
		bootedNextDJ = false;
	}

	if (Settings["monitorsonglength"].value === "true") {
		var maxLength = Settings["maxsonglength"].value;
		if (songLength >= Number(maxLength)) {
			Speak("@{u} While we appreciate your song, we like to keep songs under " + maxLength + " minutes. You will be asked to skip after several minutes.", AllUsers[currentDj].name);
			var bootTimeout = Number(Settings["bootsonglength"].value) * 60000;
			songWarningIntervalId = setTimeout(function() {
				Speak("@{u} Okay, that is enough. You have 60 seconds to skip before I do it for you.", AllUsers[currentDj].name);
			}, bootTimeout - 60000);
			songBootIntervalId = setTimeout(function() {
				Speak("@{u} Well, you can't listen can you? Times up!", AllUsers[currentDj].name);
				bot.remDj(currentDj);
			}, bootTimeout);
		}
	}
};

global.OnNoSong = function(data) {
	//Log(color("EVENT No Song: ", "red") + JSON.stringify(data));
};

global.OnUpdateVotes = function(data) {
	//Log(blue + "EVENT Update Votes: " + reset + JSON.stringify(data));
	if (data.room.metadata.votelog[0][1] == "down") {
		if (Settings["lamer"].value === "true" && botUserId !== data.room.metadata.votelog[0][0]) {
			SpeakRandom(downVoteText);
			if (data.room.metadata.votelog[0][0] !== '') {
				Speak("It was " + AllUsers[data.room.metadata.votelog[0][0]].name);
			}
		}
	}

	var votelog = data.room.metadata.votelog;
	for (var i = 0; i < votelog.length; i++) {
		var userid = votelog[i][0];
		if (votelog[i][1] == 'up') {
			votedDjs.push(userid);
			// handle lames
		} else {
			if (votedDjs.indexOf(userid) !== -1) {
				var x = votedDjs.indexOf(userid);
				votedDjs.splice(x, 1);
			}
		}
	}

	currentsong.up = data.room.metadata.upvotes;
	currentsong.down = data.room.metadata.downvotes;
	currentsong.listeners = data.room.metadata.listeners;

	/* If autobop is enabled, determine if the bot should autobop or not based on votes */
	try {
		if (Settings["autobop"].value === "true") {
			var percentAwesome = 0;
			var percentLame = 0;


			if (data.room.metadata.upvotes !== 0) {
				percentAwesome = (data.room.metadata.upvotes / (data.room.metadata.listeners - 1)) * 100;
			}
			if (data.room.metadata.downvotes !== 0) {
				percentLame = (data.room.metadata.downvotes / (data.room.metadata.listeners - 1)) * 100;
			}

			if ((percentAwesome - percentLame) >= 50) {
				bot.vote('up');
				alreadyVoted = true;
			}

			if ((percentLame - percentAwesome) >= 50) {
				bot.vote('down');
				alreadyVoted = true;
			}
		}
	} catch (e) {}

};

global.OnBootedUser = function(data) {
	try {
		Log(data.userid + " - " + AllUsers[data.userid].name + " was booted by " + data.modid + "(" + AllUsers[data.modid].name + ") for " + data.reason, "error", "Booted User");
	} catch (e) {
		Log(data.userid + " was booted by " + data.modid + " (" + AllUsers[data.modid].name + ") for " + data.reason, "error", "Booted User");
	}

	if (data.userid === botUserId) {
		botWasBooted = true;
		bot.roomDeregister();
		bot.roomRegister(botRoomId);
	}
};

global.OnUpdateUser = function(data) {
	Log(JSON.stringify(data), "", "Update User");
};

global.OnAddDJ = function(data) {
	Log(data.user[0].name + " (" + data.user[0].userid + ")", "", "Add DJ");

	var user = data.user[0];

	// If the spot is filled cancel the timer
	bot.roomInfo(function(roomInfo) {
		if (roomInfo.room.metadata.max_djs === roomInfo.room.metadata.djcount) {
			clearTimeout(idleDjSpotTimer);
		}
	});

	var startDate = new Date();
	var idleTime = Math.round((startDate - AllUsers[user.userid].lastActivity) / 60000); // in minutes
	if (idleTime > 60) {
		bot.pm(AllUsers[user.userid].name + " has been idle for " + idleTime + " on " + AllUsers[user.userid].laptop, botAdmins[0]);
		Log(user.userid + " - " + AllUsers[user.userid].name + " has been idle for " + idleTime, "error");
	}

	// For reserving a spot...
	if (reserveredFor !== null && reserveredFor !== user.userid) {
		bot.remDj(user.userid);
		if (AllUsers[reserveredFor] !== undefined) {
			Speak("Sorry, this spot is reserved for " + AllUsers[reserveredFor].name + ".");
		} else {
			Speak("Sorry, this spot is reserved. They are most likely refreshing their page to fix a problem.");
		}

		if (reservedRemovedDjs[user.userid] === undefined) {
			var removedDj = {
				userid: user.userid,
				numBoots: 1
			}
			reservedRemovedDjs[user.userid] = removedDj;
		} else {
			reservedRemovedDjs[user.userid].numBoots++;
			if (reservedRemovedDjs[user.userid].numBoots >= 3) {
				if (user.userid !== botUserId) {
					bot.boot(user.userid, 'I said this spot was saved.');
				}
			}
		}
	}

	if (reserveredFor !== null && reserveredFor === user.userid) {
		Speak("Your welcome " + AllUsers[reserveredFor].name);
		reserveredFor = null;
		reservedRemovedDjs = {};
	}

	// Are they in the queue? If queue is active.
	NewDjFromQueue(data);

	var djInfo = {
		userid: user.userid,
		name: AllUsers[user.userid].name,
		remainingPlays: Number(Settings["maxPlays"].value),
		afkCount: 0,
		waitDjs: 0
	}

	// Check if they still have to wait to DJ
	if (Settings["isModerating"].value === "true") {
		if (PastDjs[user.userid] !== undefined && PastDjs[user.userid].waitDjs <= 0) {
			delete PastDjs[user.userid];
			SetValue('PastDjs', JSON.stringify(PastDjs));
		}	
		
		if (PastDjs[user.userid] !== undefined &&
			(PastDjs[user.userid].waitDjs !== 0 && PastDjs[user.userid].remainingPlays <= 0)) {
				Log("DJ Q Len: " + DjQueue.length);
				if (DjQueue.length > 0){	
					bot.remDj(user.userid);
					Speak("@{u}, please wait " + PastDjs[user.userid].waitDjs + " more DJs before stepping back up.", AllUsers[user.userid].name, "pm", user.userid);

					if (reservedRemovedDjs[user.userid] === undefined) {
						var removedDj = {
							userid: user.userid,
							numBoots: 1
						}		
						reservedRemovedDjs[user.userid] = removedDj;
					} else {
						reservedRemovedDjs[user.userid].numBoots++;
						if (reservedRemovedDjs[user.userid].numBoots >= 3) {
							if (user.userid !== botUserId) {
								bot.boot(user.userid, 'Please wait until it is your turn next time.');
							}
						}
					}
				}
		} else {
			// If they had songs left copy back to the DJ array
			if (PastDjs[user.userid] !== undefined) {
				Djs[user.userid] = PastDjs[user.userid];
				Speak("@{u}, you have " + Djs[user.userid].remainingPlays + " plays remaining in your set.", AllUsers[user.userid].name, "pm", user.userid);
				delete PastDjs[user.userid];
			} else { // New DJ
				Djs[user.userid] = djInfo;
				Speak("@{u}, you have " + Djs[user.userid].remainingPlays + " plays in your set.", AllUsers[user.userid].name, "pm", user.userid);
			}

			SetValue('Djs', JSON.stringify(Djs));

			// Drop the waiting count by 1 for everyone else.
			for (var i in PastDjs) {
				PastDjs[i].waitDjs--;
				if (PastDjs[i].waitDjs === 0) {
					delete PastDjs[i];
					SetValue('PastDjs', JSON.stringify(PastDjs));
					if (AllUsers[i] !== undefined) {
						if(Settings["djWait"] > 1){
							Speak("@{u}, you can DJ again at any time.", AllUsers[i].name, "pm", i);
						}
					}
				}
			}
			Log("Past DJs: " + JSON.stringify(PastDjs));
		}
	}

	// Still count even if the bot isn't moderating.
	if (Settings["isModerating"].value !== "true") {
		Djs[user.userid] = djInfo;
		SetValue('Djs', JSON.stringify(Djs));
	}

	// Check if the bot should DJ.
	ShouldBotDJ();
};

global.OnRemDJ = function(data) {
	Log(data.user[0].userid + " - " + data.user[0].name, "", "Remove DJ");

	waitingOnNextDj = false;

	/* Notify the next DJ on the list */
	NextDjOnQueue();

	// If the bot is removed from the table, mark the bot as not DJing. 
	// If the bot was forcefully removed, disable autodj to make sure it doesn't step up again.
	if (data.user[0].userid === botUserId) {
		botDJing = false;
	}

	// If the bot is moderating the room, save the DJ info in case they steped down early
	var user = data.user[0];
	if (user.userid !== botUserId) {
		if (Settings["isModerating"].value === "true" && Settings["djWait"].value !== "0") {
			if (PastDjs[user.userid] === undefined) {
				PastDjs[user.userid] = Djs[user.userid];
				PastDjs[user.userid].waitDjs = Settings["djWait"].value;
				SetValue('PastDjs', JSON.stringify(PastDjs));
			}
			Log("Past DJs: " + JSON.stringify(PastDjs));

			// This timer will reset the wait if no one steps up for 3 minutes.
			if (idleDjSpotTimer === null || idleDjSpotTimer._idleTimeout === -1) {
				idleDjSpotTimer = setTimeout(function() {
					ClearDjWait();
					Log("Idle timer ran");
				}, 180000); // 3 minutes
			}
		}
	}

	delete Djs[user.userid];
	SetValue('Djs', JSON.stringify(Djs));

	// Re-add the user to the queue if one is active
	AddToQueue(data.user[0].userid, "true");

	// Automatically end the queue, not enough people.
	if (Djs.length <= 3){
		SetValue("enableQueue", "false");
		Speak("We are no longer using a queue.");
		DjQueue = { "length": 0};
		nextDj = null;
	}

	// Check if the bot should DJ.
	ShouldBotDJ();
};

global.OnNewModerator = function(data) {
	console.log(botModed);
	if (!botModed) {
		botModed = true;
		bot.remModerator(data.userid);
	} else {
		botModed = false;
		if (AllUsers[data.userid] !== undefined) {
			Log(data.userid + " - " + AllUsers[data.userid].name + " is now a moderator.", "error", "New Moderator");
		} else {
			Log(data.userid + " is now a moderator.", "error", "New Moderator");
		}

		var text = "Current mods online are: ";

		bot.roomInfo(function(data) {
			var mods = data.room.metadata.moderator_id;
			for (var i = 0; i < mods.length; i++) {
				if (AllUsers[mods[i]] !== undefined) {
					text += AllUsers[mods[i]].name + ", ";
				}
			}
			setTimeout(function() {
				Log(text, "log", "Mods online");
			}, 2000);
		});

		client.query('UPDATE ' + dbName + '.' + dbTablePrefix + 'User SET `isMod`=1 WHERE `roomid` = ? and `userid` = ?', [currentRoomId, data.userid]);
	}
};

global.OnRemModerator = function(data) {
	//console.log(botModed);
	//if (!botModed) {
	//	botModed = true;
	//	bot.addModerator(data.userid);
	//} else {
	//	botModed = false;
		if (AllUsers[data.userid] !== undefined) {
			Log(data.userid + " - " + AllUsers[data.userid].name + " is no longer a moderator.", "error", "Remove Moderator");
		} else {
			Log(data.userid + " is no longer a moderator.", "error", "Remove Moderator");
		}

		var text = "Current mods online are: ";

		bot.roomInfo(function(data) {
			var mods = data.room.metadata.moderator_id;
			for (var i = 0; i < mods.length; i++) {
				if (AllUsers[mods[i]] !== undefined) {
					text += AllUsers[mods[i]].name + ", ";
				}
			}
			setTimeout(function() {
				Log(text, "log", "Mods online");
			}, 2000);
		});

		client.query('UPDATE ' + dbName + '.' + dbTablePrefix + 'User SET `isMod`=0 WHERE `roomid` = ? and `userid` = ?', [currentRoomId, data.userid]);
	//}
};

global.OnSnagged = function(data) {
	//Log(color("EVENT Snagged: ", "blue") + JSON.stringify(data));
	//Increase song snag count
	currentsong.snags++;

	var userid = data.userid;
	if (AllUsers[userid] !== undefined) {
		AllUsers[userid].lastActivity = new Date();
	}

	// Add the song if there are 2 or more snags.
	if (currentsong.snags === 2) {
		bot.vote('up');
		alreadyVoted = true;
		bot.playlistAll(function(data) {
			bot.playlistAdd(currentsong.id, data.list.length);
		});
		bot.snag();
	}
};

global.OnError = function(data) {
	Log(JSON.stringify(data), "error", "ERROR");
};

global.OnTcpConnect = function(socket) {
	Log(JSON.stringify(socket), "", "TCP Connect");
};

global.OnTcpMessage = function(socket, msg) {
	Log(JSON.stringify(socket) + "|" + JSON.stringify(msg), "", "TCP Message");
};

global.OnTcpEnd = function(socket) {
	Log(JSON.stringify(socket), "", "TCP End");
};

global.OnHttpRequest = function(request, response) {
	Log(JSON.stringify(request) + "|" + JSON.stringify(response), "", "HTTP Request");
};
