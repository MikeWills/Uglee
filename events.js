global.OnReady = function(data){
	Log(blue + "EVENT Ready" + reset);
};

global.OnRoomChanged = function(data){
	Log(blue + "EVENT Room Changed to " + data.room.name + reset);
	//Speak("Oi! Ten thousand cycles will give you such a crick in the neck.");
};

global.OnRegistered = function(data){
	Log(blue + "EVENT Registered: " + reset + JSON.stringify(data));
};

global.OnDeregistered = function(data){
	Log(blue + "EVENT Deregistered: " + reset + JSON.stringify(data));
};

global.OnSpeak = function(data){
	//Log(blue + "EVENT Speak: " + reset + JSON.stringify(data));
	Command("speak", data);
};

global.OnEndSong = function(data){
	//Log(blue + "EVENT End Song: " + reset + JSON.stringify(data));
};

global.OnNewSong = function(data){
	//Log(blue + "EVENT New Song: " + reset + JSON.stringify(data));
};

global.OnNoSong = function(data){
	Log(blue + "EVENT No Song: " + reset + JSON.stringify(data));
};

global.OnUpdateVotes = function(data){
	Log(blue + "EVENT Update Votes: " + reset + JSON.stringify(data));
};

global.OnBootedUser = function(data){
	Log(blue + "EVENT Booted User: " + reset + JSON.stringify(data));
};

global.OnUpdateUser = function(data){
	//Log(blue + "EVENT Update User: " + reset + JSON.stringify(data));
};

global.OnAddDJ = function(data){
	Log(blue + "EVENT Add DJ: " + reset + JSON.stringify(data));
};

global.OnRemDJ = function(data){
	Log(blue + "EVENT Remove DJ: " + reset + JSON.stringify(data));
};

global.OnNewModerator = function(data){
	Log(blue + "EVENT New Moderator: " + reset + JSON.stringify(data));
};

global.OnRemModerator = function(data){
	Log(blue + "EVENT Remove Moderator: " + reset + JSON.stringify(data));
};

global.OnSnagged = function(data){
	Log(blue + "EVENT Snagged: " + reset + JSON.stringify(data));
};

global.OnPmmed = function(data){
	Log(blue + "EVENT PMmed: " + reset + JSON.stringify(data));
	Command("pm", data);
};

global.OnError = function(data){
	Log(blue + "EVENT **ERROR**: " + reset + JSON.stringify(data));
};

global.OnTcpConnect = function(socket){
	Log(blue + "EVENT TCP Connect: " + socket);
};

global.OnTcpMessage = function(socket, msg){
	Log(blue + "EVENT TCP Message: " + socket + msg);
};

global.OnTcpEnd = function(socket){
	Log(blue + "EVENT TCP End: " + socket);
};

global.OnHttpRequest = function(request, response){
	Log(blue + "EVENT HTTP Request: " + request + response);
};