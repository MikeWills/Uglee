var botWasBooted = false;

global.OnReady = function(data){
	Log(color("EVENT Ready", "blue"));
};

global.OnRoomChanged = function(data){
	try{
		Log(color("EVENT Room Changed to " + data.room.name, "blue"));
		if (botWasBooted){
			Speak("You're despicable!");
			botWasBooted = false;
		} else {
			//Speak("Oi! Ten thousand cycles will give you such a crick in the neck.");
		}
	} catch (e) {
		Log(color("**ERROR** Room Changed ", "red") + e);
		process.exit(0);
	}
};

global.OnRegistered = function(data){
	Log(color("EVENT Registered: ", "blue") + JSON.stringify(data));
};

global.OnDeregistered = function(data){
	Log(color("EVENT Deregistered: ", "blue") + JSON.stringify(data));
};

global.OnSpeak = function(data){
	//Log(blue + "EVENT Speak: " + reset + JSON.stringify(data));
	Command("speak", data);
};

global.OnEndSong = function(data){
	Log(color("EVENT End Song: ", "blue") + data.room.metadata.current_song.metadata.artist + " - " + 
		data.room.metadata.current_song.metadata.song);
};

global.OnNewSong = function(data){
	Log(color("EVENT New Song: ", "blue") + data.room.metadata.current_song.metadata.artist + " - " + 
		data.room.metadata.current_song.metadata.song);
};

global.OnNoSong = function(data){
	Log(color("EVENT No Song: ", "blue") + JSON.stringify(data));
};

global.OnUpdateVotes = function(data){
	//Log(blue + "EVENT Update Votes: " + reset + JSON.stringify(data));
	if (data.room.metadata.votelog[0][1] == "down"){
		SpeakRandom(downVoteText);
	}
};

global.OnBootedUser = function(data){
	Log(color("EVENT Booted User: ", "blue") + JSON.stringify(data));
	if (data.userid === botUserId){
		bot.roomRegister(botRoomId);
		botWasBooted = true;
	}
};

global.OnUpdateUser = function(data){
	Log(color("EVENT Update User: ", "blue") + JSON.stringify(data));
};

global.OnAddDJ = function(data){
	Log(color("EVENT Add DJ: ", "blue") + JSON.stringify(data));
};

global.OnRemDJ = function(data){
	Log(color("EVENT Remove DJ: ", "blue") + JSON.stringify(data));
};

global.OnNewModerator = function(data){
	Log(color("EVENT New Moderator: ", "blue") + JSON.stringify(data));
};

global.OnRemModerator = function(data){
	Log(color("EVENT Remove Moderator: ", "blue") + JSON.stringify(data));
};

global.OnSnagged = function(data){
	Log(color("EVENT Snagged: ", "blue") + JSON.stringify(data));
};

global.OnPmmed = function(data){
	Log(color("EVENT PMmed: ", "blue") + JSON.stringify(data));
	Command("pm", data);
};

global.OnError = function(data){
	Log(color("EVENT **ERROR**: ", "red") + JSON.stringify(data));
};

global.OnTcpConnect = function(socket){
	Log(color("EVENT TCP Connect: ", "blue") + socket);
};

global.OnTcpMessage = function(socket, msg){
	Log(color("EVENT TCP Message: ", "blue") + socket + msg);
};

global.OnTcpEnd = function(socket){
	Log(color("EVENT TCP End: ", "blue") + socket);
};

global.OnHttpRequest = function(request, response){
	Log(color("EVENT HTTP Request: ", "blue") + request + response);
};