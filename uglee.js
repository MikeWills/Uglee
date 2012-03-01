/* AMM = "roomid":"4ea390ac14169c0cc3caa078", */
/* Bootcamp = "roomid":"4f46ecd8590ca24b66000bfb", */

var fs = require('fs');
var Bot = require('ttapi');

var config;

//Creates the config object
try {
  config = JSON.parse(fs.readFileSync('config.json', 'ascii'));
} catch(e) {
  console.log(e);
  console.log('Ensure that config.json is present in this directory.');
  process.exit(0);
}

//Current song info
var currentsong = { artist: null, song: null };
var dislike = false;

var bot = new Bot(config.botinfo.auth, config.botinfo.userid);

  //Checks if the user id is present in the admin list. Authentication
//for admin-only privileges.
function admin(userid) {
  for (i in config.admins.admins) {
    if (userid == config.admins.admins[i]) {
      return true;
    };
  };
  return false;
};

function findAction(query, arr){
  query = escape(query);
  for (var i = 0, l = arr.length; i < l; i++){
    var item = arr[i];
    var reg = RegExp(escape(item.name), "i");
    if (reg.test(query)) 
      return i;
  }
  return -1;
}

bot.on('ready',        function (data) { bot.roomRegister(config.roomid); });
//bot.on('roomChanged',  function (data) { console.log('The bot has changed room.', data); });

//bot.on('speak',        function (data) { console.log('Someone has spoken', data); });
//bot.on('newsong',        function (data) { console.log('Someone has spoken', data); });
//bot.on('update_votes', function (data) { console.log('Someone has voted',  data); });
//bot.on('registered',   function (data) { console.log('Someone registered', data); });

bot.on('speak', function (data) {	

  /* ========== Public  ======== */
  if (data.text.match(/^@Uglee$/i)) {
    bot.speak('Yes Master @'+data.name+'? Here is what I can do for you: speak | dance | beer | water | whois');
  } 

	if (data.text.match(/^\@Uglee speak$/i)) {
    bot.speak('GWAAAARRRRR!!!!!');
  }	

	if (data.text.match(/^\@Uglee beer$/i)) {
    bot.speak('/me hands @'+data.name+' a cold one.');
    bot.speak('Here you go Master @'+data.name+'.');
  } 

  if (data.text.match(/^\@Uglee water$/i)) {
    bot.speak('Do we serve water here??');
    bot.speak('HELL NO H2O!!');
  }

  if (data.text.match(/^\@Uglee dance$/i)) {
    bot.speak("Dwarves don't dance Master @"+data.name+".");
  }

  if (data.text.match(/^\@Uglee whois$/i)) {
    bot.speak("Me is a bot that is created by @PodcastMike. Me guts are at https://github.com/MikeWills/Uglee.");
  }


  /* ========== ADMIN ONLY ======== */
  if ((data.text.match(/^\@Uglee awesome$/i)) || (data.text.match(/^\@Uglee a$/i))) {
    if (!admin(data.userid)) { 
      bot.speak("I was abused and now you can't control me."); 
    } else { 
      bot.vote('up');
      bot.speak('Me like this song.');
    }
  }

  if ((data.text.match(/^\@Uglee lame$/i)) || (data.text.match(/^\@Uglee l$/i))) {
    if (!admin(data.userid)) { 
      bot.speak("That's not a nice thing to do to people @"+data.name); 
    } else { 
      bot.vote('down');
      bot.speak('Wow! Me NOT like this song');
    }
  }

  if (data.text.match(/^\@Uglee addsong$/i)) {
    if (!admin(data.userid)) { 
      bot.speak("You ain't my master. Screw you!"); 
    } else {
      bot.roomInfo(true, function(data) {
        var newSong = data.room.metadata.current_song._id;
        var newSongName = songName = data.room.metadata.current_song.metadata.song;
        bot.playlistAdd(newSong);
        bot.speak('Added '+newSongName+' to queue.');
      });
    }
  }

  if (data.text.match(/^@Uglee die$/i)) {
    if (!admin(data.userid)) { 
      bot.speak("Fuck you! Me take orders from no one!"); 
    } else { 
      bot.speak("Sorry I disappointed you master.")
      bot.speak("**bang** :gun:")
      bot.roomDeregister();
      process.exit(0);
    }
  }
});

bot.on('newsong', function (data) {
  
  delete require.cache['./actions.js'];
  var Actions = require('./actions.js');

  //console.log('newsong',  data);
  //console.log('newsong',  data.room.metadata.current_song.metadata);

  //Populate new song data in currentsong
  currentsong.artist = data.room.metadata.current_song.metadata.artist;
  currentsong.song = data.room.metadata.current_song.metadata.song;

  /* First check for artist */
  var idx = findAction(currentsong.artist, Actions.artists);
  if (idx != -1){
    bot.vote(Actions.artists[idx].vote);
    if (Actions.artists[idx].speak != "") {
      bot.speak(Actions.artists[idx].speak);
    }
    dislike = Actions.artists[idx].dislike;
  }

  /* Then check for song */
  idx = findAction(currentsong.song, Actions.songs);
  if (idx != -1){
    bot.vote(Actions.songs[idx].vote);
    if (Actions.songs[idx].speak != "") {
      bot.speak(Actions.songs[idx].speak);
    }
    dislike = Actions.songs[idx].dislike;
  }
});

bot.on('endsong', function (data) {
  if (dislike){
    bot.speak('FINALLY that hell is over!');
    dislike = false;
  }
});

bot.on('pmmed', function(data){ 

  //console.log('Private message: ',  data);

  if ((data.text.match(/^awesome$/i)) || (data.text.match(/^a$/i))) {
    if (!admin(data.senderid)) { 
      bot.pm("Your not me master @"+data.name+".",data.senderid); 
    } else { 
      bot.vote('up');
    }
  }

  if ((data.text.match(/^lame$/i)) || (data.text.match(/^l$/i))) {
    if (!admin(data.senderid)) { 
      bot.pm("That's not a nice thing to do to people @"+data.name,data.senderid); 
    } else { 
      bot.vote('down');
      bot.speak('Gah! I have heard drunken dwarves sing better!');
    }
  }

  if (data.text.match(/^die$/i)) {
    if (!admin(data.senderid)) { 
      bot.pm("Fuck you! Me take orders from no one!",data.senderid); 
    } else { 
      bot.pm("Sorry I disappointed you master.",data.senderid);
      bot.roomDeregister();
      process.exit(0);
    }
  }

  if (data.text.match(/^addsong$/i)) {
    if (!admin(data.senderid)) { 
      bot.pm("You ain't my master. Screw you!",data.senderid); 
    } else {
      bot.roomInfo(true, function(data) {
        var newSong = data.room.metadata.current_song._id;
        var newSongName = songName = data.room.metadata.current_song.metadata.song;
        bot.playlistAdd(newSong);
        bot.pm('Added '+newSongName+' to queue.',data.senderid);
      });
    }
  }

  if (data.text.match(/^step up$/i)) {
    if (!admin(data.senderid)) { 
      bot.pm("You ain't my master. Screw you!",data.senderid); 
    } else { 
      bot.addDj(); 
    }
  }

  if (data.text.match(/^skip$/i)) {
    if (!admin(data.senderid)) { 
      bot.pm("You ain't my master. Screw you!",data.senderid); 
    } else { 
      bot.skip(); 
    }
  }

  if (data.text.match(/^step down$/i)) {
    if (!admin(data.senderid)) { 
      bot.pm("You ain't my master. Screw you!",data.senderid); 
    } else { 
      bot.remDj(); 
    }
  }

  if (data.text.match(/^goto AMM$/i)) {
    if (!admin(data.senderid)) { 
      bot.pm("You ain't my master. Screw you!",data.senderid); 
    } else { 
      bot.roomDeregister();
      bot.roomRegister('4ea390ac14169c0cc3caa078');
    }
  }

  if (data.text.match(/^goto bootcamp$/i)) {
    if (!admin(data.senderid)) { 
      bot.pm("You ain't my master. Screw you!",data.senderid); 
    } else { 
      bot.roomDeregister();
      bot.roomRegister('4f46ecd8590ca24b66000bfb');
    }
  }   
})