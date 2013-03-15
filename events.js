var botWasBooted = false;
global.totalPlays = 0;
var bootedNextDJ = false;
global.curSongWatchdog = null;
global.takedownTimer = null;

global.OnReady = function(data) {
	Log(color("EVENT Ready", "blue"));
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
		Log(color("EVENT Room Changed to " + data.room.name, "blue"));
		if (botWasBooted) {
			Speak("You're despicable!");
			botWasBooted = false;
		} else {
			Speak(startupText);
		}

		if (currentRoomId !== data.room.roomid) {
			currentRoomId = data.room.roomid;
			SetUpRoom();
		}

		SetValue("roomName", data.room.name);

		if (data.room.metadata.current_song != null) {
			PopulateSongData(data);
		}

		// Keep track of all users
		Log("Loading Users");
		var users = data.users;
		for (var i in users) {
			var user = users[i];
			user.lastActivity = user.loggedIn = new Date();
			AllUsers[user.userid] = user;
			if (users[i].name !== null) {
				client.query('INSERT INTO ' + dbName + '.' + dbTablePrefix + 'User(roomid, userid, username, lastseen)' + 'VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE lastseen = NOW()', [currentRoomId, users[i].userid, users[i].name]);
			}
		}

		setTimeout(function() {
			LoadDjs(data);
		}, 5000);

		currentDj = data.room.metadata.current_dj;

		// Check if the bot should DJ.
		setTimeout(function() {
			ShouldBotDJ();
		}, 5000);

	} catch (e) {
		Log(color("**ERROR** Room Changed ", "red") + e, "error");
	}
};

global.OnRegistered = function(data) {
	try {
		Log(color("EVENT Registered: ", "blue") + data.user[0].name + " - " + data.user[0].userid);

		if (currentsong != null) {
			currentsong.listeners++;
		}

		setTimeout(function() {
			GetValue("welcomeMsg", 0, function(value) {
				if (value === "true") {
					if (AllUsers[data.user[0].userid] !== undefined) {
						var d = new Date();
						var dayOfWeek = d.getDay();
						Speak(welcomeDaily[dayOfWeek], AllUsers[data.user[0].userid].name, "pm", data.user[0].userid);
					}
				}
			});
		}, 2500);

		//Add new user(s) to cache
		var users = data.user;
		for (var i in users) {
			var user = users[i];
			user.lastActivity = user.loggedIn = new Date();
			AllUsers[user.userid] = user;
		}

		if (data.user[0].name !== null) {
			client.query('INSERT INTO ' + dbName + '.' + dbTablePrefix + 'User(roomid, userid, username, lastseen)' + 'VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE lastseen = NOW()', [currentRoomId, data.user[0].userid, data.user[0].name]);
		}

		// Check if User is banned
		client.query('SELECT userid, banned_by, DATE_FORMAT(timestamp, \'%c/%e/%y\') as timestamp' + ' FROM BANNED WHERE userid LIKE \'' + user.userid + '\'', function cb(error, results, fields) {
			if (results != null && results.length > 0) {
				bot.boot(user.userid, 'You were banned from this room by ' + results[0]['banned_by'] + ' on ' + results[0]['timestamp']);
			}
		});

		// Mark the user as back in the room
		GetValue("enableQueue", 0, function(queueEnabled) {
			if (queueEnabled === "true") {
				if (DjQueue[data.user[0].userid] !== undefined) {
					DjQueue[data.user[0].userid].isAfk = false;
					DjQueue[data.user[0].userid].akfTime = null;
					DjQueue.length++;
					SetValue('DjQueue', JSON.stringify(DjQueue));
				}
				bot.pm("Greetings @" + data.user[0].name + ". If you would like to DJ, please type 'q+' to get added to the queue.", data.user[0].userid);
			}
		});

		ShouldBotDJ();

		if (data.user[0].userid === '4dfb57154fe7d061dd013a44') {
			bot.pm("Hello master, how may I be of service?", '4dfb57154fe7d061dd013a44');
		}

	} catch (e) {
		Log(color("**ERROR** Room Changed ", "red") + e, "error");
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

		// Mark the user as AFK (or out of the room in this case)
		GetValue("enableQueue", 0, function(queueEnabled) {
			if (queueEnabled === "true") {
				if (DjQueue[data.user[0].userid] !== undefined) {
					DjQueue[data.user[0].userid].isAfk = true;
					DjQueue[data.user[0].userid].akfTime = new Date();
					DjQueue.length--;
					SetValue('DjQueue', JSON.stringify(DjQueue));
				}
			}
		});

		ShouldBotDJ();

	} catch (e) {
		Log(color("**ERROR** Room Changed ", "red") + e, "error");
	}
};

global.OnSpeak = function(data) {
	//Log(color("EVENT Speak: ", "blue") + JSON.stringify(data));
	Command("speak", data);
	if (AllUsers[data.userid] !== undefined) {
		AllUsers[data.userid].lastActivity = new Date();
	}
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
	var songLength = Number(data.room.metadata.current_song.metadata.length) / 60;
	var length = data.room.metadata.current_song.metadata.length;
	lastDj = currentDj;
	currentDj = data.room.metadata.current_dj;
	if (AllUsers[currentDj] !== undefined) {
		lastDjName = AllUsers[currentDj].name;
	} else {
		lastDjName = "";
	}
	Log(color("EVENT New Song: ", "blue") + data.room.metadata.current_song.metadata.artist + " - " + data.room.metadata.current_song.metadata.song + " | Length: " + songLength + " minutes.");
	//Log(color("EVENT New Song: ", "blue") + JSON.stringify(data));
	danceCount = 0;
	lameCount = 0;
	snagCount = 0;

	// Populate new song data in currentsong
	PopulateSongData(data);

	GetValue("monitorHungSong", 0, function(value) {
		if (value === "true") {
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
				}, 15 * 1000); // Current DJ has 10 seconds to skip before they are removed
			}, (length + 15) * 1000); // Timer expires 10 seconds after the end of the song, if not cleared by a newsong  
		}
	});

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
		Log("Playing song right now.");
	}

	if (Djs[currentDj] !== undefined) {
		Djs[currentDj].remainingPlays--;
		SetValue('Djs', JSON.stringify(Djs));
	}

	if (lastDj !== undefined) {
		GetValue("isModerating", 0, function(isModerating) {
			if (isModerating === "true") {
				if (Djs[lastDj] !== undefined && Djs[lastDj].remainingPlays === 0) {
					Log("Remove DJ " + AllUsers[lastDj].name + "after reaching max plays.");
					bot.remDj(lastDj);
					Speak("Thanks for the awesome songs @" + AllUsers[lastDj].name + "!");
					SetValue('Djs', JSON.stringify(Djs));
				}
				setTimeout(function() {
					SpeakPlayCount();
				}, 2000);

			}
		});
	}

	var OldVotedDjs = votedDjs;
	GetValue("monitorAfk", 0, function(value) {
		if (value === "true") {
			GetValue("afkMissedSongs", 0, function(afkPlayCount) {
				if (!firstSong) {
					for (var i in Djs) {
						if (lastDj !== i && lastDj !== botUserId) {
							if (OldVotedDjs.indexOf(i) === -1) {
								Djs[i].afkCount++;
								if (Djs[i].afkCount >= afkPlayCount) {
									Log("Remove " + AllUsers[i].name + "(" + i + ")");
									if (i === currentDj) {
										bootedNextDJ = true;
										firstSong = true; // this is so everyone else isn't booted when the dj is booted
									}
									bot.remDj(i);
									Speak(msgAFKBoot, AllUsers[i].name, i);
								} else if (Djs[i].afkCount >= 1) {
									Log("Warn " + AllUsers[i].name + "(" + i + ")");
									Speak(msgAFKWarn, AllUsers[i].name, i);
								}
							} else {
								Djs[i].afkCount = 0;
							}
						}
					}
				}
				votedDjs = [];
				if (!bootedNextDJ) {
					firstSong = false;
				}
				bootedNextDJ = false;
			});
		}
	});

	GetValue("monitorsonglength", 0, function(value) {
		if (value === "true") {
			GetValue("maxsonglength", 0, function(maxLength) {
				if (songLength >= Number(maxLength)) {
					Speak("@{u} While we appreciate your song, we like to keep songs under " + maxLength + " minutes. You will be asked to skip after several minutes.", AllUsers[currentDj].name);
					GetValue("bootsonglength", 0, function(bootLength) {
						var bootTimeout = Number(bootLength) * 60000;
						songWarningIntervalId = setTimeout(function() {
							Speak("@{u} Okay, that is enough. You have 60 seconds to skip before I do it for you.", AllUsers[currentDj].name);
						}, bootTimeout - 60000);
						songBootIntervalId = setTimeout(function() {
							Speak("@{u} Well, you can't listen can you? Times up!", AllUsers[currentDj].name);
							bot.remDj(currentDj);
						}, bootTimeout);
					});
				}
			});
		}
	});
};

global.OnNoSong = function(data) {
	//Log(color("EVENT No Song: ", "red") + JSON.stringify(data));
};

global.OnUpdateVotes = function(data) {
	//Log(blue + "EVENT Update Votes: " + reset + JSON.stringify(data));
	if (data.room.metadata.votelog[0][1] == "down") {
		GetValue("lamer", 0, function(value) {
			if (value === "true" && botUserId !== data.room.metadata.votelog[0][0]) {
				SpeakRandom(downVoteText);
				if (data.room.metadata.votelog[0][0] !== '') {
					Speak("It was " + AllUsers[data.room.metadata.votelog[0][0]].name);
				}
			}
		});
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
	GetValue("autobop", 0, function(value) {
		if (value === "true") {
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
	});
};

global.OnBootedUser = function(data) {
	Log(color("EVENT Booted User: ", "blue") + JSON.stringify(data), "error");
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

	NewDjFromQueue(data);

	var user = data.user[0];

	var startDate = new Date();
	var idleTime = Math.round((startDate - AllUsers[user.userid].lastActivity) / 60000); // in minutes
	if (idleTime > 60) {
		bot.pm(AllUsers[user.userid].name + " has been idle for " + idleTime + " on " + AllUsers[user.userid].laptop, botAdmins[0]);

		if (currentRoomId == "4ea390ac14169c0cc3caa078") {
			bot.pm(AllUsers[user.userid].name + " has been idle for " + idleTime + " on " + AllUsers[user.userid].laptop, "4e13aa77a3f75114c6069dbc"); // mikeb
			bot.pm(AllUsers[user.userid].name + " has been idle for " + idleTime + " on " + AllUsers[user.userid].laptop, "4e525ccaa3f751044b236e63"); // mee_shell
		}
	}
	/*if(AllUsers[user.userid] !== undefined) {
		AllUsers[user.userid].lastActivity = new Date();
	}*/

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
				bot.boot(user.userid, 'I said this spot was saved.');
			}
		}
	}

	if (reserveredFor !== null && reserveredFor === user.userid) {
		Speak("Your welcome " + AllUsers[reserveredFor].name);
		reserveredFor = null;
		reservedRemovedDjs = {};
	}

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
	SetValue('Djs', JSON.stringify(Djs));

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
	if (data.user[0].userid === botUserId) {
		botDJing = false;
		Log("Bot no longer DJing");
		/*if(data.modid !== undefined) {
			Log("Forcibly Removed");
			SetValue("autodj", "false");
		}*/
	}

	// If the bot is moderating the room, save the DJ info in case they steped down early
	var user = data.user[0];
	delete Djs[user.userid];
	SetValue('Djs', JSON.stringify(Djs));
	AddToQueue(data.user[0].userid);

	// Check if the bot should DJ.
	ShouldBotDJ();
};

global.OnNewModerator = function(data) {
	if (AllUsers[data.userid] !== undefined) {
		Log(color("EVENT New Moderator: ", "blue") + AllUsers[data.userid].name + " (" + data.userid + ") is now a moderator.", "error");
	} else {
		Log(color("EVENT New Moderator: ", "blue") + data.userid + " is now a moderator.", "error");
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
			Log(color("Mods online: ", "red") + text, "error");
		}, 2000);
	});

	client.query('UPDATE ' + dbName + '.' + dbTablePrefix + 'User SET `isMod`=1 WHERE `roomid` = ? and `userid` = ?', [currentRoomId, data.userid]);
};

global.OnRemModerator = function(data) {
	if (AllUsers[data.userid] !== undefined) {
		Log(color("EVENT Remove Moderator: ", "blue") + AllUsers[data.userid].name + " (" + data.userid + ") is no longer a moderator.", "error");
	} else {
		Log(color("EVENT Remove Moderator: ", "blue") + data.userid + " is no longer a moderator.", "error");
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
			Log(color("Mods online: ", "red") + text, "error");
		}, 2000);
	});

	client.query('UPDATE ' + dbName + '.' + dbTablePrefix + 'User SET `isMod`=0 WHERE `roomid` = ? and `userid` = ?', [currentRoomId, data.userid]);
};

global.OnSnagged = function(data) {
	Log(color("EVENT Snagged: ", "blue") + JSON.stringify(data));
	//Increase song snag count
	currentsong.snags++;

	var userid = data.userid;
	if (AllUsers[userid] !== undefined) {
		AllUsers[userid].lastActivity = new Date();
	}

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
	Log(color("EVENT PMmed: ", "blue") + JSON.stringify(data), "error");
	Command("pm", data);
	if (AllUsers[data.senderid] !== undefined) {
		if (data.senderid !== botAdmins[0]) {
			bot.pm(AllUsers[data.senderid].name + ' sent the following command: "' + data.text + '"', botAdmins[0]);
		}
		AllUsers[data.senderid].lastActivity = new Date();
	}
};

global.OnError = function(data) {
	Log(color("EVENT **ERROR**: ", "red") + JSON.stringify(data), "error");
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
