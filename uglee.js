var fs = require('fs');
var Bot    = require('ttapi');

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
admin = function (userid) {
  for (i in config.admins.admins) {
    if (userid == config.admins.admins[i]) {
      return true;
    };
  };
  return false;
};

bot.on('ready',        function (data) { bot.roomRegister(config.roomid); });
//bot.on('roomChanged',  function (data) { console.log('The bot has changed room.', data); });

//bot.on('speak',        function (data) { console.log('Someone has spoken', data); });
//bot.on('newsong',        function (data) { console.log('Someone has spoken', data); });
//bot.on('update_votes', function (data) { console.log('Someone has voted',  data); });
//bot.on('registered',   function (data) { console.log('Someone registered', data); });

bot.on('speak', function (data) {	

	if (data.text.match(/^\@Uglee speak$/)) {
    bot.speak('GWAAAARRRRR!!!!!');
  }	

	if (data.text.match(/^\@Uglee beer$/)) {
    bot.speak('/me hands @'+data.name+' a cold one.');
    bot.speak('Here you go Master @'+data.name+'.');
  } 

  if (data.text.match(/^\@Uglee water$/)) {
    bot.speak('Do we serve water here??');
    bot.speak('HELL NO H2O!!');
  }

  if (data.text.match(/^\@Uglee dance$/)) {
    bot.speak("Dwarves don't dance Master @"+data.name+".");
  }

  if ((data.text.match(/^\@Uglee awesome$/)) || (data.text.match(/^\@Uglee a$/))) {
    if (!admin(data.userid)) { 
      bot.speak("Your not me master @"+data.name+"."); 
    } else { 
      bot.vote('up');
      bot.speak('Me like this song.');
    }
  }

  if ((data.text.match(/^\@Uglee lame$/)) || (data.text.match(/^\@Uglee l$/))) {
    if (!admin(data.userid)) { 
      bot.speak("That's not a nice thing to do to people @"+data.name); 
    } else { 
      bot.vote('down');
      bot.speak('Gah! I have heard drunken dwarves sing better!');
    }
  }

  if (data.text.match(/^\@Uglee addsong$/)) {
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

  if (data.text.match(/^\@Uglee step up$/)) {
    if (!admin(data.userid)) { 
      bot.speak("You ain't my master. Screw you!"); 
    } else { 
      bot.addDj(); 
    }
  }

  if (data.text.match(/^\@Uglee skip$/)) {
    if (!admin(data.userid)) { 
      bot.speak("You ain't my master. Screw you!"); 
    } else { 
      bot.skip(); 
    }
  }

  if (data.text.match(/^\@Uglee step down$/)) {
    if (!admin(data.userid)) { 
      bot.speak("You ain't my master. Screw you!"); 
    } else { 
      bot.remDj(); 
    }
  }

  if (data.text.match(/^\@Uglee goto AMM$/)) {
    if (!admin(data.userid)) { 
      bot.speak("You ain't my master. Screw you!"); 
    } else { 
      bot.roomDeregister();
      bot.roomRegister('4ea390ac14169c0cc3caa078');
    }
  }

  if (data.text.match(/^\@Uglee goto bootcamp$/)) {
    if (!admin(data.userid)) { 
      bot.speak("You ain't my master. Screw you!"); 
    } else { 
      bot.roomDeregister();
      bot.roomRegister('4f46ecd8590ca24b66000bfb');
    }
  }   

  if (data.text.match(/^\@Uglee die$/)) {
    if (!admin(data.userid)) { 
      bot.speak("Fuck you! Me take orders from no one!"); 
    } else { 
      bot.speak("Sorry I disappointed you master.")
      bot.speak("**bang** :gun:")
      bot.roomDeregister();
      process.exit(0);
    }
  }   

  if (data.text.match(/^\@Uglee regenerate$/)) {
    if (!admin(data.userid)) { 
      bot.speak("Fuck you! Me take orders from no one!"); 
    } else { 
      bot.speak("Okay BRB...")
      bot.speak("**bang** :gun:")
      bot.roomDeregister();
      process.exit(1);
    }
  }   

  if (data.text.match(/^\@Uglee$/)) {
    bot.speak('Yes Master @'+data.name+'? Here is what I can do for you: speak | dance | beer');
  } 
});

bot.on('newsong', function (data) {
  //Populate new song data in currentsong
  currentsong.artist = data.room.metadata.current_song.metadata.artist;
  currentsong.song = data.room.metadata.current_song.metadata.song;

  if ((currentsong.artist.indexOf('Skrillex') != -1) || (currentsong.song.indexOf('Skrillex') != -1)) {
      bot.vote('down');
      bot.speak('Gah! I have heard drunken dwarves sing better!');
      dislike = true;
  }

  if (currentsong.artist.indexOf('Coldplay') != -1) {
    bot.vote('down');
    bot.speak('Me like banshee song better than this shit!');
      dislike = true;
  }

  if (currentsong.artist.indexOf('Linkin Park') != -1) {
      bot.vote('up');
      bot.speak('This is good shit!');
  }

  if (currentsong.artist.indexOf('Will Smith') != -1) {
      bot.vote('up');
      bot.speak('This me boy! Go Fresh Prince of Bel Aire!');
  }

  if (currentsong.song.indexOf('Baby Got Back') != -1) {
      bot.vote('up');
      bot.speak('/me sings with the song.');
  }

  if (currentsong.song.indexOf('Jump Around') != -1) {
      bot.vote('up');
      bot.speak('This me jam!');
  }
});

bot.on('endsong', function (data) {
  if (dislike){
    bot.speak('FINALLY that hell is over!');
    dislike = false;
  }
});