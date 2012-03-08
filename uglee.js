/* Last changed 3/7/2012 @ 1300 */

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
var djing = false;

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

/* Add a brief pause to script */
function pause(ms) {
    ms += new Date().getTime();
    while (new Date() < ms){}
} 

function awesomeSong(userid){
    if (isMod(userid) || admin(userid)) { 
        bot.vote('up');
    }
}

function lameSong(userid){ 
    if (isMod(userid) || admin(userid)) { 
        bot.vote('down');
    }
}

function killBot(userid){
    if (admin(userid)) {  
        bot.pm("Sorry I disappointed you master.",userid);
        bot.roomDeregister();
        process.exit(0); 
    } else {
        bot.pm("Fuck you! Me take orders from no one!",userid);
    }
}

function addSong(userid){
    if (admin(userid)) { 
        bot.roomInfo(true, function(data) {
            var newSong = data.room.metadata.current_song._id;
            var songName = data.room.metadata.current_song.metadata.song;
            bot.playlistAdd(newSong);
            bot.speak("Hope you don't mind me adding \""+songName+"\" to me queue.");
        });
    } else {
        bot.speak("You ain't my master. Screw you!"); 
    }
}

function stepUp(){
    bot.addDj();
    bot.speak("Imma help you out for a bit.");
    djing = true;
}

function stepDown(){
    bot.speak("Looks like me not needed anymore.");
    pause(500);
    bot.speak("/me pouts and slowly walks to the floor.");
    pause(500);
    bot.remDj();
    djing = false;
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
        console.log('DJs', data.room.metadata.djs);
    }
    
    djs = data.room.metadata.djs;
    moderators = data.room.metadata.moderator_id;
});

/* ============================ */
/* speak */
/* ============================ */
bot.on('speak', function (data) {	

    /* ========== Public  ======== */  
    if (data.text.match(/^@Uglee$/i)) {
        bot.speak('Yes Master @'+data.name+'? Here is what I can do for you: speak | dance | beer | water | coke | dew | whois');
        if (isMod(data.userid)) { 
            pause(500);
            bot.speak('As a moderator, you can also `awesome` (or a) and `lame` (or l) songs. You can also PM me.');
        }
    }

    if (data.text.match(/^\@Uglee speak$/i)) {
        bot.speak('GWAAAARRRRR!!!!!');
    }

	if (data.text.match(/^\@Uglee beer$/i)) {
        bot.speak('/me hands @'+data.name+' a cold one.');
        pause(500);
        bot.speak('Here you go Master @'+data.name+'.');
    }

	if (data.text.match(/^\@Uglee coke$/i)) {
        bot.speak('/me hands @'+data.name+' a cold one.');
        pause(500);
        bot.speak('Here you go Master @'+data.name+'.');
    }

    if (data.text.match(/^\@Uglee dew$/i)) {
        bot.speak('/me hands @'+data.name+' a Mt. Dew.');
        pause(500);
        bot.speak('Here you go Master @'+data.name+'. Like to do the Dew huh?');
    }

    if (data.text.match(/^\@Uglee coffee$/i)) {
        bot.speak('/me hands @'+data.name+' a large cup of liquid energy.');
        pause(500);
        bot.speak('Here you go Master @'+data.name+'.');
    }

    if (data.text.match(/^\@Uglee water$/i)) {
        bot.speak('Do we serve water here??');
        pause(500);
        bot.speak('HELL NO H2O!!');
    }

    if (data.text.match(/^\@Uglee cake$/i)) {
        bot.speak('Mmmm cake!');
        pause(500);
        bot.speak('/me cuts a slice and hands it to @'+data.name);
    }

    if (data.text.match(/^\@Uglee dance$/i)) {
        bot.speak("Dwarves don't dance Master @"+data.name+".");
    }

    if (data.text.match(/^\@Uglee whois$/i)) {
        bot.speak("Me is a bot that is created by @PodcastMike. Me guts are at https://github.com/MikeWills/Uglee.");
    }


    /* ========== ADMINS & MODS ONLY ======== */
    if ((data.text.match(/^\@Uglee awesome$/i)) || (data.text.match(/^\@Uglee a$/i))) {
        awesomeSong(data.userid); 
    }

    if ((data.text.match(/^\@Uglee lame$/i)) || (data.text.match(/^\@Uglee l$/i))) {
        lameSong(data.userid);
    }

    /* ========== ADMINS ONLY ======== */
    if (data.text.match(/^\@Uglee addsong$/i)) {
        addSong(data.userid);
    }

    if (data.text.match(/^@Uglee die$/i)) {
        killBot(data.userid);
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
    
    /* Update the moderator list */ 
    moderators = data.room.metadata.moderator_id;
    
    /* Check if the bot should step up to DJ */
    if (config.autodj){
        if (data.room.metadata.djcount <= (data.room.metadata.max_djs - 2)){
            if (!djing) {
                stepUp();
            }
        }
        
        if (data.room.metadata.djcount == data.room.metadata.max_djs){
            if (djing){
                stepDown();
            }
        }
    }
    
    /* Autobop if DJing */
    if (djing){
        pause(30000);
        bot.vote('up');
        voted = true;
    }

    /* Selectively awesome/lame songs */
    if (config.newsongcomments && !voted){
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

    switch(data.text.toLowerCase()){
        case "awesome" : case "a":
            awesomeSong(data.senderid);
            break;

        case "lame": case "l":
            lameSong(data.senderid);
            break;

        case "die":
            killBot(data.senderid);
            break;

        case "addsong":
            addSong(data.senderid);
            break;

        case "step up":
            if (admin(data.senderid)) {
                stepUp();
            }
            break;

        case "step down":
            if (admin(data.senderid)) {
                stepDown();
            }
            break;

        case "skip":
            if (admin(data.senderid)) {
                bot.skip(); 
            }
            break;

        case "goto amm":
            if (admin(data.senderid)) {
                bot.roomDeregister();
                bot.roomRegister('4ea390ac14169c0cc3caa078');
            }
            break;

        case "goto bootcamp":
            if (admin(data.senderid)) {
                bot.roomDeregister();
                bot.roomRegister('4f46ecd8590ca24b66000bfb');
            }
            break;

        case "help":
            if (isMod(data.senderid)) { 
                bot.pm("You can awesome (or a) | lame (or l)", data.senderid);
            }
            if (admin(data.senderid)){
                pause(500);
                bot.pm("step up | step down | skip | die | goto AMM & bootcamp", data.senderid);
            }
            break;

        default:
            bot.pm("Unknown command. Type 'help' for commands.", data.senderid);
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