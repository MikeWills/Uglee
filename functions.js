/* 	==============
	Log - Log the information to the console
	============== */
global.Log = function(data) {
	if(logtoconsole) {
		var now = new Date();
		//console.log(botName, ">>>", new Date().setTimezone("CST").toISOString(), " | ", data);
		console.log(botName, ">>>", new Date().toISOString(), " | ", data);
	}
};

/* 	==============
	Speak - Puts text in to the chatroom.
	============== */
global.Speak = function(text, userName, source, userid) {
	var textOut = "";

	if(userName !== undefined) {
		textOut = text.replace(/\{u\}/gi, userName);
	} else {
		textOut = text;
	}

	if(source !== undefined) {
		if(source === "pm") {
			bot.pm(textOut, userid);
			return;
		} else {
			bot.speak(textOut);
			return;
		}
	} else {
		bot.speak(textOut);
		return;
	}
};

/* 	==============
	TellUser - If the user can get a PM it sends them a PM otherwise it sends posts in chatroom
	============== */
global.TellUser = function(userid, text) {
	var textOut = "";
	try {
		if(NoPM()) {
			bot.speak(text);
			return;
		} else {
			bot.pm(text, userid);
			return;
		}
	} catch(e) {
		Log(color("**ERROR** TellUser() ", "red") + e);
	}
};

/* 	==============
	SpeakRandom - Takes an array of options to speak and speaks one of them.
	============== */
global.SpeakRandom = function(array, userName) {
	var textOut = "";
	var rand = Math.ceil(Math.random() * array.length) - 1;

	if(userName !== undefined) {
		textOut = array[rand].replace(/\{u\}/gi, userName);
	} else {
		textOut = array[rand];
	}

	Speak(textOut);
}

/* 	==============
	IsMod - Checks if the user is a moderator
	============== */
global.IsMod = function(userid, callback) {
	bot.roomInfo(function(data) {
		var moderators = data.room.metadata.moderator_id;
		if(IsAdmin(userid)) {
			callback(true);
			return;
		}
		if(moderators.indexOf(userid) != -1) {
			callback(true);
			return;
		} else {
			callback(false);
			return;
		}
	})
}

/* 	==============
	IsAdmin - Checks if the user is the bot administrator
	============== */
global.IsAdmin = function(userid) {
	if(botAdmins.indexOf(userid) !== -1) {
		return true;
	} else {
		return false;
	}
}

/* 	==============
	NoPM - Checks if the user can't get a PM
	============== */
global.NoPM = function(userid) {
	// TODO
	return false;
}

/* 	==============
	Command - This is the main logic for processing commands.
	============== */
global.Command = function(source, data) {
	var isPM = source === "pm" ? true : false;
	var userid = "";
	if(isPM) {
		userid = data.senderid;
	} else {
		userid = data.userid;
	}

	for(i in commands) {
		if(commands[i].enabled) {
			if(commands[i].matchStart && (data.text.toLowerCase().indexOf(commands[i].name) == 0)) {
				commands[i].handler(data, userid, source);
				break;
			} else if(commands[i].name == data.text.toLowerCase()) {
				commands[i].handler(data, userid, source);
				break;
			}
		}
	}

	// If it isn't a real command, it might be a chat command.
	var result = data.text.match(/^\@(.*?)( .*)?$/);
	if(result && result[1].trim().toLowerCase() === botName.toLowerCase()) {
		var command = '';
		if(result.length == 3 && result[2]) {
			command = result[2].trim().toLowerCase();
		}
		var idx = findAction(command, chat_responses);
		if(idx != -1) {
			Speak(chat_responses[idx].response1, data.name);
			if(chat_responses[idx].response2 !== "") {
				setTimeout(function() {
					Speak(chat_responses[idx].response2, data.name);
				}, 500);
			}
		}
	}
}

/* 	==============
	AwesomeSong - Awesome (or vote up) this song.
	============== */
global.AwesomeSong = function() {
	bot.vote("up");
	SpeakRandom(awesomeText);
	alreadyVoted = true;
}

/* 	==============
	LameSong - Lame (or down vote) this song.
	============== */
global.LameSong = function() {
	bot.vote("down");
	SpeakRandom(lameText);
	alreadyVoted = true;
}

/* 	==============
	DidUserLeaveQuickly - If a person is in the room for less than 30 seonds it'll give a comment.
	============== */
global.DidUserLeaveQuickly = function(userid) {
	var now = new Date();
	var loggedIn = AllUsers[userid].loggedIn;
	var timeOn = now = loggedIn;
	Log("Logged in time: " + timeOn);
	if(now - AllUsers[userid].lastActivity < 30000) {
		SpeakRandom(userLeaveQuickText);
	}
}

/* 	==============
	PopulateSongData - Gets the require information for a song for further processing.
	============== */
global.PopulateSongData = function(data) {
	currentsong.id = data.room.metadata.current_song._id;
	currentsong.artist = data.room.metadata.current_song.metadata.artist;
	currentsong.song = data.room.metadata.current_song.metadata.song;
	currentsong.djname = data.room.metadata.current_song.djname;
	currentsong.djid = data.room.metadata.current_song.djid;
	currentsong.up = data.room.metadata.upvotes;
	currentsong.down = data.room.metadata.downvotes;
	currentsong.listeners = data.room.metadata.listeners;
	currentsong.started = data.room.metadata.current_song.starttime;
	currentsong.snags = 0;
	currentsong.length = data.room.metadata.current_song.metadata.length;
}

/* 	==============
	findAction - Finds misc chat-only commands.
	============== */
global.findAction = function(query, arr) {
	query = escape(query);
	for(var i = 0, l = arr.length; i < l; i++) {
		var item = arr[i];
		var reg = RegExp(escape(item.name), "i");
		if(reg.test(query)) return i;
	}
	return -1;
}

/* 	==============
	ShouldBotDJ - Checks auto dj. That bot allows for 1 open spot (if DJing) 
				  and will step down if all slots are full
	============== */
global.ShouldBotDJ = function() {
	GetValue("autodj", 0, function(value) {
		if(value === "true") {
			setTimeout(function() {
				bot.roomInfo(function(data) {
					if(data.room.metadata.listeners !== 1) {
						//if (data.room.metadata.djcount <= (data.room.metadata.max_djs - 2)) {
						if(data.room.metadata.djcount <= 2) {
							if(!botDJing) {
								Log("Bot is DJing");
								bot.addDj();
								bot.vote('up');
								alreadyVoted = true;
								bot.speak(stepUpText);
								botDJing = true;
								return;
							}
						}

						if(data.room.metadata.djcount > 3) {
							if(botDJing && !botIsPlayingSong) {
								Speak(stepDownText);
								setTimeout(function() {
									bot.remDj();
								}, 500)
								botDJing = false;
								return;
							} else if(botOnTable && botIsPlayingSong) {
								botStepDownAfterSong = true;
							}
						}
					} else {
						bot.remDj();
						botDJing = false;
					}
				});
			}, 5000);
		}
	});
}

/* 	============
	SpeakPlayCout - Announce how many songs remain for each DJ.
	============ */
global.SpeakPlayCount = function() {
	var count = ['x', 'x', 'x', 'x', 'x'];
	var x = 0;
	for(var i in Djs) {
		count[x] = Djs[i].remainingPlays;
		x++;
	}
	var playCount = count[0] + '-' + count[1] + '-' + count[2] + '-' + count[3] + '-' + count[4];
	Speak("Remaining: " + playCount);
};

/*  ============== 
 	AddToQueue - Add a person to the queue
	============== */
global.AddToQueue = function(userid) {
	var text = "";
	GetValue("enableQueue", 0, function(queueEnabled) {
		if(queueEnabled === "true") {
			// Check if they are a DJ
			if(Djs[userid] === undefined) {
				// Check if they are already on the queue
				if(DjQueue[userid] === undefined && AllUsers[userid] !== undefined) {
					DjQueue[userid] = {
						"id": userid,
						"name": AllUsers[userid].name,
						"isAfk": false,
						"afkCount": 0,
						"afkTime": null
					};
					DjQueue.length++;

					text = "@" + DjQueue[userid].name + ", you have been added to the queue. There is a total of " + DjQueue.length + " now.";
					bot.speak(text);
					SetValue('DjQueue', JSON.stringify(DjQueue));
					if(nextDj === null) {
						nextDj = userid;
					}
				} else {
					// TODO respond with place in line
				}
			} else {
				text = "@" + AllUsers[userid].name + ", seriously?!? Can't you wait until you're OFF the TABLE before adding yourself to the queue again? FAIL! ";
				bot.speak(text);
			}
		}
	});
};

/* 	============== 
	InsertInQueue - Inserts a person in to the middle of the queue
	============== */
global.InsertInQueue = function(userid, position) {
	// TODO fix bugs in here
	var text = "";

	GetValue("enableQueue", 0, function(queueEnabled) {
		if(queueEnabled === "true") {
			// Check if they are a DJ 
			if(Djs.indexOf(userid) == -1) {
				// Check if they are already on the queue
				if(DjQueue.indexOf(userid) == -1) {
					DjQueue.splice((position - 1), 0, userid);
					text = "@" + AllUsers[userid].name + ", you have been added to the queue. There is a total of " + DjQueue.length + " now.";
					bot.speak(text);
					Log(DjQueue);
					DjQueue.length++;
					SetValue('DjQueue', JSON.stringify(DjQueue));
				}
			}
		}
	});
};

/* 	============== 
	RemoveFromQueue - Removes a user from the queue
	============== */
global.RemoveFromQueue = function(userid) {
	GetValue("enableQueue", 0, function(queueEnabled) {
		if(queueEnabled === "true") {
			if(DjQueue[userid] !== undefined) {
				delete DjQueue[userid];
				DjQueue.length--;
				bot.speak("You have been removed from the queue @" + AllUsers[userid].name);
				SetValue('DjQueue', JSON.stringify(DjQueue));
			}
		}
	});
};

/* 	==============
	NewDjFromQueue - This checks to see if the DJ that just stepped up is the next DJ in the queueEnabled
	============== */
global.NewDjFromQueue = function(data) {
	GetValue("enableQueue", 0, function(queueEnabled) {
		if(queueEnabled === "true") {
			var text = "";
			if(DjQueue.length > 0 && (nextDj !== null || nextDj === undefined)) {
				if(data.user[0].userid != nextDj) {
					bot.remDj(data.user[0].userid);
					if(AllUsers[nextDj] !== undefined) {
						text = "Sorry @" + AllUsers[data.user[0].userid].name + ", it's @" + AllUsers[nextDj].name + " turn. You need to wait your turn.";
					} else {
						text = "Sorry @" + AllUsers[data.user[0].userid].name + ", it's not your turn. You need to wait your turn.";

					}
					bot.speak(text);
				} else {
					delete DjQueue[data.user[0].userid];
					DjQueue.length--;
					SetValue('DjQueue', JSON.stringify(DjQueue));
					waitingOnNextDj = false;
					clearInterval(queueRefreshIntervalId);
					queueRefreshIntervalRunning = false;
					nextDj = null;
				}
			}
		}
	});
};

/* ============== */
/* NextDjOnQueue - This lets the room know who is next to DJ */
/* ============== */
global.NextDjOnQueue = function() {
	qPosn = 0;
	nextDj = null;
	GetValue("enableQueue", 0, function(queueEnabled) {
		if(queueEnabled === "true" && !waitingOnNextDj) {
			Log("Waiting on next DJ " + waitingOnNextDj);
			if(DjQueue.length > 0) {
				Log(DjQueue);
				for(var i in DjQueue) {
					if(DjQueue[i].id !== undefined) {
						if(DjQueue[i].isAfk) {
							DjQueue[i].afkCount++;
						} else {
							nextDj = DjQueue[i].id;
							Log("Next DJ is: " + DjQueue[i].name);
							break;
						}
					}
				}

				if(nextDj === null) {
					bot.speak("The queue is empty. All DJs in the queue are currently not here. Anyone can DJ at this time!");
					return;
				}

				//Log("queueRefreshIntervalId: " + queueRefreshIntervalId);
				if(!queueRefreshIntervalRunning) {
					Log("Ask for DJ");
					GetValue("nextDjQueueTimeout", 0, function(nextDjQueueTimeout) {
						var text = "It is now @" + DjQueue[nextDj].name + "'s turn to DJ! You have " + nextDjQueueTimeout + " seconds to step up.";
						waitingOnNextDj = true;
						bot.speak(text);
						bot.pm("It's your turn to DJ.", nextDj);
						nextDjTime = new Date();
						queueRefreshIntervalId = setInterval(CheckForNextDjFromQueue, 5000);
					});
					queueRefreshIntervalRunning = true;
				}
			} else {
				bot.speak("The queue is empty. Anyone can DJ at this time!");
			}
		}
	});
};

/* ============== */
/* CheckForNextDjFromQueue */
/* ============== */
global.CheckForNextDjFromQueue = function() {
	if(nextDj !== null) {
		var currentTime = new Date();
		GetValue("nextDjQueueTimeout", 0, function(nextDjQueueTimeout) {
			if(currentTime.getTime() - nextDjTime.getTime() > (Number(nextDjQueueTimeout) * 1000)) {
				var pastDj = DjQueue[nextDj];
				Log(pastDj);
				pastDj.afkCount++;

				delete DjQueue[nextDj];
				DjQueue.length--;

				if(pastDj.afkCount >= 2) {
					bot.speak("Sorry @" + pastDj.name + ", you missed out! Whatta looser! You can add yourself back to the queue, but pay attention this time.");
				} else {
					DjQueue[nextDj] = pastDj;
					DjQueue.length++;
					bot.speak("Too late @" + pastDj.name + " you can try once more on the next opening.");
				}

				waitingOnNextDj = false;

				SetValue('DjQueue', JSON.stringify(DjQueue));
				Log("DJ Queue: " + JSON.stringify(DjQueue));
				clearInterval(queueRefreshIntervalId);
				queueRefreshIntervalRunning = false;
				NextDjOnQueue();
			}
		});
	}
};

/* ============== */
/* QueueStatus */
/* ============== */
global.QueueStatus = function() {

	GetValue("enableQueue", 0, function(queueEnabled) {
		if(queueEnabled === "true") {
			var djList = "";

			for(var i in DjQueue) {
				var queuedDj = DjQueue[i];
				if(!queuedDj.isAfk) {
					if(queuedDj.name !== undefined) {
						djList += queuedDj.name + ", ";
					}
				} else {
					var now = new Date();
					var afkTime = new Date(queuedDj.afkTime);
					var afkFor = dateDiff(now, afkTime, 'min');
					Log(afkFor);
					if(queuedDj.isAfk && afkFor >= 5) {
						Log("Remove DJ: " + DjQueue[i].name);
						delete DjQueue[i];
					}
				}
			}

			if(djList !== "") {
				var text = DjQueue.length + " DJ(s) in the queue. They are: " + djList;
				bot.speak(text.substring(0, text.length - 2));
			} else {
				bot.speak("Queue is empty!");
			}
			SetValue('DjQueue', JSON.stringify(DjQueue));
		}
	});
};

global.dateDiff = function(a, b, format) {
	var milliseconds = a - b;
	var minutes = milliseconds / 60000;
	var days = milliseconds / 86400000;
	var hours = milliseconds / 3600000;
	var weeks = milliseconds / 604800000;
	var months = milliseconds / 2628000000;
	var years = milliseconds / 31557600000;
	if(format == "min") {
		return Math.round(minutes);
	}
	if(format == "h") {
		return Math.round(hours);
	}
	if(format == "d") {
		return Math.round(days);
	}
	if(format == "w") {
		return Math.round(weeks);
	}
	if(format == "m") {
		return Math.round(months);
	}
	if(format == "y") {
		return Math.round(years);
	}
};

global.LoadDjs = function(data){
			Log("Loading Djs");
			var ttdjs = data.room.metadata.djs;

			GetValue("Djs", 10, function(results) {
				if(results !== null) {
					if(results.length !== 0 && results !== " ") {
						var jsonResult = JSON.parse(results);
						Log("=== Before ===");
						Log(JSON.stringify(jsonResult));
						Log(JSON.stringify(ttdjs));
						for(var i = 0; i < ttdjs.length; i++) {
							if(jsonResult[ttdjs[i]] !== undefined) {
								Log("Cached DJ " + ttdjs[i]);
								var djInfo = {
									userid: ttdjs[i],
									name: AllUsers[ttdjs[i]].name,
									remainingPlays: jsonResult[ttdjs[i]].remainingPlays,
									afkCount: jsonResult[ttdjs[i]].afkCount,
									waitDjs: jsonResult[ttdjs[i]].waitDjs
								}
								Djs[ttdjs[i]] = djInfo;
							} else {
								Log("Not cached DJ " + ttdjs[i]);
								var djInfo = {
									userid: ttdjs[i],
									name: AllUsers[ttdjs[i]].name,
									remainingPlays: totalPlays,
									afkCount: 0,
									waitDjs: 0
								}
								Djs[ttdjs[i]] = djInfo;
							}
						}
					}
				} else {
					Log("No DJs cached");
					for(var i = 0; i < ttdjs.length; i++) {
						var djInfo = {
							userid: ttdjs[i],
							name: AllUsers[ttdjs[i]].name,
							remainingPlays: totalPlays,
							afkCount: 0,
							waitDjs: 0
						}
						Djs[ttdjs[i]] = djInfo;
					}
				}
				setTimeout(function() {
					SetValue('Djs', JSON.stringify(Djs));
					Log("=== After ===");
					Log(JSON.stringify(Djs));
				}, 5000);
			});
};