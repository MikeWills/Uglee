(function() {

  var wootButton = document.getElementById("woot");
  var mehButton = document.getElementById("meh");
  var hungSongCheck;

  hook = function(apiEvent, callback) {
    return API.on(apiEvent, callback);
  };

  unhook = function(apiEvent, callback) {
    return API.off(apiEvent, callback);
  };

  upVote = function(){
    var rand = Math.ceil(Math.random() * 20);
    var wait = rand * 1000;
    setTimeout(function() {
      wootButton.click();
    }, wait);
  };

  chatEvent = function(data)
  {
    //console.log("chatEvent");
    //console.log(JSON.stringify(data));

    if (data.message.substring(0,5) == ".boot"){
      bootUser(data.message.substring(7));
    }
  };

  bootUser = function(username){
    var userid;
    var users = API.getUsers();
      for (var i = 0; i < users.length; i++){
        var u = users[i];
        if (u.username.toLowerCase() == username.toLowerCase()){
          userid = u.id;
          API.moderateRemoveDJ(userid);
          API.moderateBanUser(userid, "Booting from the room");
          setTimeout(function() {
          API.moderateUnbanUser(userid);
        }, 2000);
          break;
        }
      }
  };

  djAdvanceEvent = function(data)
  {
    //console.log("djAdvanceEvent");
    //console.log(JSON.stringify(data));

    // Clear the timer if the skip worked.
    clearTimeout(hungSongCheck);

    upVote();

    //API.sendChat("Song length is " + data.media.duration);

    // Monitor for a hung song
    hungSongCheck = setTimeout(function() {
        API.sendChat("Hung song, skipping for you.");
        API.moderateForceSkip();
      }, (data.media.duration + 5) * 1000 );
  };

  userSkipEvent = function(data)
  {
    //console.log("userSkipEvent");
    //console.log(JSON.stringify(data));
  };

  userJoinEvent = function(data)
  {
    //console.log("userJoinEvent");
    //console.log(JSON.stringify(data));
    API.sendChat("Welcome @" + data.username);
  };

  userLeaveEvent = function(data)
  {
    //console.log("userLeaveEvent");
    //console.log(JSON.stringify(data));
  };

  userFanEvent = function(data)
  {
    //console.log("userFanEvent");
    //console.log(JSON.stringify(data));
  };

  friendJoinEvent = function(data)
  {
    //console.log("friendJoinEvent");
    //console.log(JSON.stringify(data));
  };

  fanJoinEvent = function(data)
  {
    //console.log("fanJoinEvent");
    //console.log(JSON.stringify(data));
  };

  curateUpdate = function(data)
  {
    //console.log("curateUpdate");
    //console.log(JSON.stringify(data));
  };

  roomScoreUpdate = function(data)
  {
    //console.log("roomScoreUpdate");
    //console.log(JSON.stringify(data));
  };

  waitListUpdate = function(data)
  {
    //console.log("waitListUpdate");
    //console.log(JSON.stringify(data));
  };

  voteSkipEvent = function(data)
  {
    //console.log("voteSkipEvent");
    //console.log(JSON.stringify(data));
  };

  chatCommandEvent = function(data)
  {
    //console.log("chatCommandEvent");
    //console.log(JSON.stringify(data));
  };

  historyUpdateEvent = function(data)
  {
    //console.log("historyUpdateEvent");
    //console.log(JSON.stringify(data));
  };

  modSkipEvent = function(data)
  {
    //console.log("modSkipEvent");
    //console.log(JSON.stringify(data));
  };

  djUpdateEvent = function(data)
  {
    //console.log("djUpdateEvent");
    //console.log(JSON.stringify(data));
    //wootButton.click();
  };

  apiHooks = [
    {
      'event': API.CHAT,
      'callback': chatEvent
    },{
      'event': API.USER_SKIP,
      'callback': userSkipEvent
    },{
      'event': API.USER_JOIN,
      'callback': userJoinEvent
    },{
      'event': API.USER_LEAVE,
      'callback': userLeaveEvent
    },{
      'event': API.USER_FAN,
      'callback': userFanEvent
    },{
      'event': API.FRIEND_JOIN,
      'callback': friendJoinEvent
    },{
      'event': API.FAN_JOIN,
      'callback': fanJoinEvent
    },{
      'event': API.CURATE_UPDATE,
      'callback': curateUpdate
    },{
      'event': API.ROOM_SCORE_UPDATE,
      'callback': roomScoreUpdate
    },{
      'event': API.DJ_ADVANCE,
      'callback': djAdvanceEvent
    },{
      'event': API.DJ_UPDATE,
      'callback': djUpdateEvent
    },{
      'event': API.WAIT_LIST_UPDATE,
      'callback': waitListUpdate
    },{
      'event': API.VOTE_SKIP,
      'callback': voteSkipEvent
    },{
      'event': API.MOD_SKIP,
      'callback': modSkipEvent
    },{
      'event': API.CHAT_COMMAND,
      'callback': chatCommandEvent
    },{
      'event': API.HISTORY_UPDATE ,
      'callback': historyUpdateEvent
    }
  ];

  initHooks = function() {
    var pair, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = apiHooks.length; _i < _len; _i++) {
      pair = apiHooks[_i];
      _results.push(hook(pair['event'], pair['callback']));
    }
    return _results;
  };

  undoHooks = function() {
    var pair, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = apiHooks.length; _i < _len; _i++) {
      pair = apiHooks[_i];
      _results.push(unhook(pair['event'], pair['callback']));
    }
    return _results;
  };

  initialize = function() {
    initHooks();
    API.sendChat("Mike's Cheats Loaded");
    upVote();
  };

  initialize();

}).call(this);