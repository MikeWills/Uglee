/* AMM = "roomid":"4ea390ac14169c0cc3caa078", */
/* Bootcamp = "roomid":"4f46ecd8590ca24b66000bfb", */

var fs = require('fs');
var Bot = require('ttapi');

/*  Creates the config object */
var config;
try {
  config = JSON.parse(fs.readFileSync('config.json', 'ascii'));
} catch(e) {
  console.log(e);
  console.log('Ensure that config.json is present in this directory.');
  process.exit(0);
}

/*  Current song info */
var currentsong = { artist: null, song: null, genre: null };
var dislike = false;
var voted = false;
var moderators = [ ];

var bot = new Bot(config.botinfo.auth, config.botinfo.userid);

/*  Checks if the user id is present in the admin list. Authentication
    for admin-only privileges. */
function admin(userid) {
    for (var i in config.admins.admins) {
        if (userid == config.admins.admins[i]) {
            return true;
        }
    }
    return false;
}

/*  Checks if the user id is present in the moderator list. Authentication
    for moderator-only privileges. */
function isMod(userid) {
    for (var i in moderators) {
        if (userid == moderators[i]) {
            return true;
        }
    }
    return false;
}

/* Search the array for the value */
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

/* ============================ */
/* ready */
/* ============================ */
bot.on('ready', function (data) { 
    bot.roomRegister(config.roomid); 
});

/* ============================ */
/* roomchanged */
/* ============================ */
bot.on('roomChanged', function (data) { 
    
    if (config.consolelog){
        //console.log('Room Changed',  data);
        console.log('Moderator IDs', data.room.metadata.moderator_id);
    }
    
    moderators = data.room.metadata.moderator_id;
});

/* ============================ */
/* speak */
/* ============================ */
bot.on('speak', function (data) {	

  /* ========== Public  ======== */  
  if (data.text.match(/^@Uglee$/i)) {
    bot.speak('Yes Master @'+data.name+'? Here is what I can do for you: speak | dance | beer | water | whois');
    if (isMod(data.userid)) { 
        bot.speak('As a moderator, you can also `awesome` (or a) and `lame` (or l) songs. You can also PM me.');
    }
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
    if (!isMod(data.userid)) { 
      bot.speak("I was abused and now you can't control me."); 
    } else { 
      bot.vote('up');
      bot.speak('Me like this song.');
    }
  }

  if ((data.text.match(/^\@Uglee lame$/i)) || (data.text.match(/^\@Uglee l$/i))) {
    if (!isMod(data.userid)) { 
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
        var songName = data.room.metadata.current_song.metadata.song;
        var newSongName = songName;
        bot.playlistAdd(newSong);
        bot.speak('Added '+newSongName+' to queue.');
      });
    }
  }

  if (data.text.match(/^@Uglee die$/i)) {
    if (!admin(data.userid)) { 
      bot.speak("Fuck you! Me take orders from no one!"); 
    } else { 
      bot.speak("Sorry I disappointed you master.");
      bot.speak("**bang** :gun:");
      bot.roomDeregister();
      process.exit(0);
    }
  }
});

/* ============================ */
/* newsong */
/* ============================ */
bot.on('newsong', function (data) {
  
  delete require.cache['./actions.js'];
  var Actions = require('./actions.js');

    if (config.consolelog){
        console.log('newsong',  data.room.metadata.current_song.metadata);
    }

    if (config.newsongcomments){
        //Populate new song data in currentsong
        currentsong.artist = data.room.metadata.current_song.metadata.artist;
        currentsong.song = data.room.metadata.current_song.metadata.song;
        currentsong.genre = data.room.metadata.current_song.metadata.genre;

        /* First check for artist */
        var idx = findAction(currentsong.artist, Actions.artists);
        if (idx != -1){
            bot.vote(Actions.artists[idx].vote);
            if (Actions.artists[idx].speak !== "") {
                bot.speak(Actions.artists[idx].speak);
            }
        dislike = Actions.artists[idx].dislike;
        voted = true;
        }

        /* Then check for song */
        idx = findAction(currentsong.song, Actions.songs);
        if (idx != -1){
            bot.vote(Actions.songs[idx].vote);
            if (Actions.songs[idx].speak !== "") {
                bot.speak(Actions.songs[idx].speak);
            }
            dislike = Actions.songs[idx].dislike;
            voted = true;
        }

        /* Then check for genre */
        idx = findAction(currentsong.genre, Actions.genres);
        if (idx != -1){
            bot.vote(Actions.genres[idx].vote);
            if (Actions.genres[idx].speak !== "") {
                bot.speak(Actions.genres[idx].speak);
            }
            dislike = Actions.genres[idx].dislike;
            voted = true;
        }
    }
  
    /* Check the song length and bitch if it is too long */
    if (config.monitorsonglength){
        if (data.room.metadata.current_song.metadata.length >= config.maxsonglength){
            var songlength = Math.round(data.room.metadata.current_song.metadata.length / 60);
            bot.speak("Really?? We have to listen to a "+songlength+" minute song? Is that really nessesary?");
        }
    }
});

/* ============================ */
/* endsong */
/* ============================ */
bot.on('endsong', function (data) {

  if (dislike){
    bot.speak('FINALLY that hell is over!');
    dislike = false;
  }

  voted = false;
});

/* ============================ */
/* pmmed */
/* ============================ */
bot.on('pmmed', function(data){ 
    
    if (config.consolelog){
        console.log('Private message: ',  data);
    }

  if ((data.text.match(/^awesome$/i)) || (data.text.match(/^a$/i))) {
    if (!isMod(data.senderid)) { 
      bot.pm("Your not me master @"+data.name+".",data.senderid); 
    } else { 
      bot.vote('up');
    }
  }

  if ((data.text.match(/^lame$/i)) || (data.text.match(/^l$/i))) {
    if (!isMod(data.senderid)) { 
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
        var songName = data.room.metadata.current_song.metadata.song;
        var newSongName = songName;
        //bot.playlistAll();
        bot.playlistAdd(newSong);
        bot.pm('Added '+newSongName+' to queue.',data.senderid);
      });
    }
  }

  if (data.text.match(/^help$/i)) {
    if (!isMod(data.senderid)) { 
      bot.pm("You ain't my master. Screw you!",data.senderid); 
    } else { 
      bot.pm("You can awesome (or a) | lame (or l)", data.senderid);
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
});

/* ============================ */
/* update_votes */
/* ============================ */
bot.on('update_votes', function(data){ 
    
    /* If autobop is enabled, determine if the bot should autobop or not based on votes */
    if (config.autobop){
        var percentAwesome = (data.room.metadata.upvotes / data.room.metadata.listeners) * 100;
        var percentLame = (data.room.metadata.downvotes / data.room.metadata.listeners) * 100;
  
        if ((percentAwesome - percentLame) > 25){
            if (!voted) {
                bot.vote('up');
                voted = true;
            }
        }
  
        if ((percentLame - percentAwesome) > 25){
            if (!voted) {
                bot.vote('down'); 
                dislike = true;
                voted = true;
            }
        }
    }
});

/* ============================ */
/* add_dj */
/* ============================ */
bot.on('add_dj', function(data){ 
    
    if (config.consolelog){
        console.log('Added DJ: ',  data);
    }
    
});

/* ============================ */
/* rem_dj */
/* ============================ */
bot.on('rem_dj', function(data){ 
    
    if (config.consolelog){
        console.log('Removed DJ: ',  data);
    }
    
});