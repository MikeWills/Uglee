var fs = require('fs');
var util = require('util');
var Bot = require('ttapi');

/*  Creates the config object */
var config;
try {
    config = JSON.parse(fs.readFileSync('config.json', 'ascii'));
} catch (e) {
    Log(e);
    Log('Ensure that config.json is present in this directory.');
    process.exit(0);
}

//Creates mysql db object
if (config.database.usedb) {
    try {
        mysql = require('mysql');
    } catch (e) {
        Log(e);
        Log('It is likely that you do not have the mysql node module installed.' + '\nUse the command \'npm install mysql\' to install.');
        Log('Starting bot without database functionality.');
        config.database.usedb = false;
    }

    //Connects to mysql server
    try {
        client = mysql.createClient(config.database.login);
    } catch (e) {
        Log(e);
        Log('Make sure that a mysql server instance is running and that the ' + 'username and password information in config.js are correct.');
        Log('Starting bot without database functionality.');
        config.database.usedb = false;
    }
}

// http://nodejs.org/api.html#_child_processes
var sys = require('util');
var exec = require('child_process').exec;
var child;

/* Sends me a message every time Uglee reboots */
child = exec("t set active GilimYurhig", function(error, stdout, stderr) {
    if (error !== null) {
        Log('exec error: ' + error);
    }

    child = exec("t update 'd @mikewills This is Uglee, I rebooted for you!'", function(error, stdout, stderr) {
        if (error !== null) {
            Log('exec error: ' + error);
        }
    });
});


/*  banned users */
var bannedUsers = ['4fedd7baaaa5cd41130001d1'];

//Current song info
var currentsong = {
    artist: null,
    song: null,
    djname: null,
    djid: null,
    up: 0,
    down: 0,
    listeners: 0,
    snags: 0
};
var usersList = {}; //A list of users in the room
var dislike = false;
var voted = false;
var moderators = [];
var djing = false;
var votelog = [];
var djs = [];

var djQueue = {
    "length": 0
};
var nextDj = null;
var nextDjTime = null;
var queueRefreshIntervalId = null;
var missedQueue = [];
var qPosn = 0;
var waitingOnNextDj = false;

var acceptingVotes = false;
var incomingVotes = {
    One: 0,
    Two: 0,
    Three: 0,
    Four: 0,
    Five: 0
};
var voteStart = null;
var refreshIntervalId = null;
var botOnTable = false;
var ctsSequenceCount = -1;
var ctsSequenceMax = 0;
var ctsActive = false;
var ctsExcludedWords = ["in", "the", "is", "that", "and", "a", "an"];
var ctsLastWords = null;
var alreadyRolled = false;

var isAmmDown = false;
var ammResponded = false;
var ammRefreshIntervalId = null;
var lastAnnouncement = new Date();
var announcement = "HEAR YE! HEAR YE! On 6/17 @ 10pm CST, @PodcastMike will be marking a trio of events: 1 year on TT, 20k for his avatar, and 10k in room points. Come and help us celebrate!";

var bot = new Bot(config.botinfo.auth, config.botinfo.userid);

/* ============== */
/* Log - Log the information to the console */
/* ============== */
global.Log = function(data) {
    if (config.consolelog) {
        console.log(data);
    }
};

function PostAnnouncement() {
    var roll = Math.ceil(Math.random() * 8);
    var now = new Date();
    var timePassed = Math.round((now - lastAnnouncement) / 3600000);
    if (roll == 1 && timePassed > 2) {
        bot.speak(announcement);
        lastAnnouncement = new Date();
    }
}

function CheckThatAMMisAlive() {
    bot.pm("!count", "4e7bf475a3f7511657030c34");
    isAmmDown = false;
    ammResponded = false;
    ammRefreshIntervalId = setInterval(HasAmmResponded, 30000);
    Log("Sent Request");
    //PostAnnouncement();
}
//setInterval(CheckThatAMMisAlive, 60000); // Check every 15 minutes
setInterval(CheckThatAMMisAlive, 900000); // Check every 15 minutes

function HasAmmResponded() {
    Log("Checking AMM status");
    Log(ammResponded);
    if (!ammResponded) { /* Sends me a message every time Uglee reboots */
        child = exec("t set active GilimYurhig", function(error, stdout, stderr) {
            if (error !== null) {
                Log('exec error: ' + error);
            }

            child = exec("t update '@mikewills This is Uglee, AMM is being a jerk and not answering me.'", function(error, stdout, stderr) {
                if (error !== null) {
                    Log('exec error: ' + error);
                }
            });
        });
    }
    clearInterval(ammRefreshIntervalId);
}

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

function isBanned(userid) {
    if (bannedUsers.indexOf(userid) == -1) {
        return false;
    } else {
        Log("Banned");
        return true;
    }
}

/* Search the array for the value */

function findAction(query, arr) {
    query = escape(query);
    for (var i = 0, l = arr.length; i < l; i++) {
        var item = arr[i];
        var reg = RegExp(escape(item.name), "i");
        if (reg.test(query)) return i;
    }
    return -1;
}

/* Add a brief pause to script */

function pause(ms) {
    ms += new Date().getTime();
    while (new Date() < ms) {}
}

function killBot(userid) {
    if (admin(userid)) {
        bot.pm("Sorry I disappointed you master.", userid);
        bot.roomDeregister();
        process.exit(0);
    } else {
        bot.pm("You ain't me master.", userid);
    }
}

function addSong(userid) {
    if (admin(userid)) {
        bot.roomInfo(true, function(data) {
            var newSong = data.room.metadata.current_song._id;
            var songName = data.room.metadata.current_song.metadata.song;
            bot.playlistAdd(newSong);
            bot.snag();
            //bot.speak("Hope you don't mind me adding \"" + songName + "\" to me queue.");
            bot.vote('up');
        });
    } else {
        bot.speak("You ain't me master.");
    }
}

function stepUp() {
    bot.addDj();
    bot.speak("Imma help you out for a bit.");
    djing = true;
}

function stepDown() {
    bot.speak("Looks like me not needed anymore.");
    pause(500);
    bot.speak("/me pouts and slowly walks to the floor.");
    pause(500);
    bot.remDj();
    djing = false;
}

function mustAwesome(id) {
    if (id == 1) {
        bot.speak("DJs: The gorilla doesn't like jerks. Please support your fellow DJs by clicking awesome for their songs. See Rule #4.");
        pause(250);
        bot.speak("Me have heard the screams... not pleasant.");
    } else if (id == 2) {
        bot.speak("DJs: Please support your fellow DJs by clicking the awesome button! It's easy and it's a rule! See #4. Just type !rules to see. Otherwise you WILL be booted off in two songs.");
    }
}

//Sets up the database

function setUpDatabase() {
    //Creates DB and tables if needed, connects to db
    client.query('CREATE DATABASE ' + config.database.dbname, function(error) {
        if (error && error.number != mysql.ERROR_DB_CREATE_EXISTS) {
            throw (error);
        }
    });
    client.query('USE ' + config.database.dbname);

    //song table
    client.query('CREATE TABLE ' + config.database.tablenames.song + '(id INT(11) AUTO_INCREMENT PRIMARY KEY,' + ' artist VARCHAR(255),' + ' song VARCHAR(255),' + ' djid VARCHAR(255),' + ' up INT(3),' + ' down INT(3),' + ' listeners INT(3),' + ' started DATETIME,' + ' snags INT(3),' + ' bonus INT(3))',

    function(error) {
        //Handle an error if it's not a table already exists error
        if (error && error.number != 1050) {
            throw (error);
        }
    });

    //chat table
    client.query('CREATE TABLE ' + config.database.tablenames.chat + '(id INT(11) AUTO_INCREMENT PRIMARY KEY,' + ' userid VARCHAR(255),' + ' chat VARCHAR(255),' + ' time DATETIME)', function(error) {
        //Handle an error if it's not a table already exists error
        if (error && error.number != 1050) {
            throw (error);
        }
    });

    //user table
    client.query('CREATE TABLE ' + config.database.tablenames.user + '(userid VARCHAR(255), ' + 'username VARCHAR(255), ' + 'lastseen DATETIME, ' + 'PRIMARY KEY (userid, username))', function(error) {
        //Handle an error if it's not a table already exists error
        if (error && error.number != 1050) {
            throw (error);
        }
    });
}

function populateSongData(data) {
    currentsong.artist = data.room.metadata.current_song.metadata.artist;
    currentsong.song = data.room.metadata.current_song.metadata.song;
    currentsong.djname = data.room.metadata.current_song.djname;
    currentsong.djid = data.room.metadata.current_song.djid;
    currentsong.up = data.room.metadata.upvotes;
    currentsong.down = data.room.metadata.downvotes;
    currentsong.listeners = data.room.metadata.listeners;
    currentsong.started = data.room.metadata.current_song.starttime;
    currentsong.snags = 0;
}

//Adds the song data to the songdata table.
//This runs on the endsong event.

function addSongToDb(data) {
    client.query('INSERT INTO ' + config.database.dbname + '.' + config.database.tablenames.song + ' ' + 'SET artist = ?,song = ?, djid = ?, up = ?, down = ?,' + 'listeners = ?, started = NOW(), snags = ?, bonus = ?', [currentsong.artist, currentsong.song, currentsong.djid, currentsong.up, currentsong.down, currentsong.listeners, currentsong.snags, 0]);
}

function VoteNextSong() {
    bot.speak("I want you to vote what song I should play next! Your choices are: ");
    incomingVotes = {
        One: 0,
        Two: 0,
        Three: 0,
        Four: 0,
        Five: 0
    };
    bot.playlistAll(function(data) {
        var options = "";
        for (var i = 0; i <= data.list.length && i <= 4; i++) {
            options += "[" + (i + 1) + "] " + data.list[i].metadata.song + " by " + data.list[i].metadata.artist + "\n";
        }
        bot.speak(options);
        //Log(options);
        pause(500);
        bot.speak("Type in your choice by typing the number of the song you would like to hear. Voting is open for 1 minute.");
        acceptingVotes = true;
        voteStart = new Date();
        refreshIntervalId = setInterval(VotingEnded, 10000);
    });
}

function ProcessVote(vote) {
    if (acceptingVotes) {
        if (vote == "1") {
            incomingVotes.One++;
        } else if (vote == "2") {
            incomingVotes.Two++;
        } else if (vote == "3") {
            incomingVotes.Three++;
        } else if (vote == "4") {
            incomingVotes.Four++;
        } else if (vote == "5") {
            incomingVotes.Five++;
        }
        Log(incomingVotes);
    }
}

function VotingEnded() {
    var currentTime = new Date();
    if (currentTime.getTime() - voteStart.getTime() >= (60000)) {
        acceptingVotes = false;
        clearInterval(refreshIntervalId);

        var topVote = 1;
        var topVoteCount = incomingVotes.One;

        if (incomingVotes.Two > topVoteCount) {
            topVote = 2;
            topVoteCount = incomingVotes.Two;
        }

        if (incomingVotes.Three > topVoteCount) {
            topVote = 3;
            topVoteCount = incomingVotes.Three;
        }

        if (incomingVotes.Four > topVoteCount) {
            topVote = 4;
            topVoteCount = incomingVotes.Four;
        }

        if (incomingVotes.Five > topVoteCount) {
            topVote = 5;
            topVoteCount = incomingVotes.Five;
        }
        Log("Vote " + topVote + " wins!");

        var winner = topVote - 1;
        Log(winner);
        bot.playlistReorder(winner, 0, function() {
            //bot.playlistAll(function(data) {
            //bot.speak("Next song is: " + data.list[0].metadata.song + " by " + data.list[0].metadata.artist);
            //Log("Next song is: " + data.list[0].metadata.song + " by " + data.list[0].metadata.artist);
            //});
        });
    }
}

/* ============== */
/* CheckAutoDj - The bot will see if it should step up the decks */
/* ============== */
var CheckAutoDj = function() {
        if (config.autodj) {
            bot.roomInfo(function(data) {
                if (data.room.metadata.djcount !== 0) {
                    if (data.room.metadata.djcount === 1 && IsBot(data.room.metadata.djs[0])) {
                        stepDown();
                        return;
                    }

                    if (data.room.metadata.djcount <= (data.room.metadata.max_djs - 2)) {
                        if (!botOnTable) {
                            stepUp();
                            return;
                        }
                    }

                    if (data.room.metadata.djcount == data.room.metadata.max_djs) {
                        if (botOnTable && !botIsPlayingSong) {
                            stepDown();
                            return;
                        }
                    }
                }
            });
        }
    };

var CheckCTS = function() {
        var isOk = false;
        /*var ctsSequenceCount = 0;
        var ctsSequenceMax = 0;
        var ctsActive = false;
        var ctsExcludedWords = ["in", "the", "is", "that"];
        var ctsLastWords = [];*/
        Log(ctsLastWords);
        var song = currentsong.song.toLowerCase().replace("'", " ").replace("\"", " ").replace("(", " ").replace(")", " ").replace(".", " ").replace("/", " ").replace("\\", " ").replace("  ", " ");
        Log(song);
        var words = song.split(" ");
        Log(words);
        if (ctsLastWords !== null) {
            for (var i = 0; i <= words.length; i++) {
                if (ctsLastWords.indexOf(words[i]) != -1) {
                    isOk = true;
                }
            }
        } else {
            isOk = true;
        }

        if (isOk) {
            ctsLastWords = words;
            ctsSequenceCount++;
            if (ctsSequenceCount > ctsSequenceMax) {
                ctsSequenceMax = ctsSequenceCount;
            }
            bot.speak("Sweet! The score is " + ctsSequenceCount + ". The next DJ needs to play a song with at least one of the following words: " + ctsLastWords);
        } else {
            if (ctsSequenceCount > ctsSequenceMax) {
                ctsSequenceMax = ctsSequenceCount;
                SetCacheValue('ctsSequenceMax', ctsSequenceMax);
            }
            bot.speak("Boo! The game is over with a score of " + ctsSequenceCount + ". The highest score is " + ctsSequenceMax);
            Log("Game ended");
            ctsActive = false;
            ctsSequenceCount = -1;
            ctsLastWords = null;
        }
    };

function dateDiff(a, b, format) {
    var milliseconds = a - b;
    var minutes = milliseconds / 60000;
    var days = milliseconds / 86400000;
    var hours = milliseconds / 3600000;
    var weeks = milliseconds / 604800000;
    var months = milliseconds / 2628000000;
    var years = milliseconds / 31557600000;
    if (format == "min") {
        return Math.round(minutes);
    }
    if (format == "h") {
        return Math.round(hours);
    }
    if (format == "d") {
        return Math.round(days);
    }
    if (format == "w") {
        return Math.round(weeks);
    }
    if (format == "m") {
        return Math.round(months);
    }
    if (format == "y") {
        return Math.round(years);
    }
}

var findIdle = function(senderid) {
        var pmText = "The following users have been idle for more than 6 hours: ";
        for (var z in usersList) {
            //Log(usersList[z]);
            //if (usersList[z].laptop != "iphone" || usersList[z].laptop != "android") {
            //Log(usersList[z]);
            var startDate = new Date();
            var idleTime = Math.round((startDate - usersList[z].lastActivity) / 3600000); // in hours
            //var idleTime = Math.round((startDate - usersList[z].lastActivity) / 60000); // for testing minutes
            Log(usersList[z].name + ": " + idleTime);
            if (idleTime >= 6) {
                pmText += usersList[z].name + ": " + idleTime + " on " + usersList[z].laptop + " | ";
            }
            //}
        }
        bot.pm(pmText, senderid);
    };

var summonModerators = function(name) {
        //child = exec("t set active GilimYurhig; t update 'Uglee: A moderator is requested in AMM. @mikewills'", function(error, stdout, stderr) {
        child = exec("t set active GilimYurhig; t update 'Uglee: " + name + " requested that a moderator comes to murl.me/amm. @mikewills @techguyjason @mikebdotorg @Drew_Cash'", function(error, stdout, stderr) {
            if (error !== null) {
                Log('exec error: ' + error);
            }
        });

        for (var i = 0; i <= moderators.length; i++) {
            bot.pm("Excuse me, " + name + " requested that moderator comes to http://tt.fm/all_music_mix for some help. Please stop by if you can.", moderators[i]);
        }
    };

var answeredModerators = function() {
        //child = exec("t set active GilimYurhig; t update 'Uglee: A moderator is requested in AMM. @mikewills'", function(error, stdout, stderr) {
        child = exec("t set active GilimYurhig; t update 'Uglee: @mikewills @techguyjason @mikebdotorg @Drew_Cash the request has been answered.'", function(error, stdout, stderr) {
            if (error !== null) {
                Log('exec error: ' + error);
            }
        });

        for (var i = 0; i <= moderators.length; i++) {
            bot.pm("The request has been answered. Sorry for inturrupting.", moderators[i]);
        }
    };

var summonBouncer = function() {
        bot.speak("HEY BOUNCER! Weee neeeeed yooooouuu!!!!!");
        child = exec("cd /home/mikewills/ && ./amm.sh", function(error, stdout, stderr) {
            if (error !== null) {
                Log('exec error: ' + error);
            }
        });
    };

var dismissBouncer = function() {
        bot.speak("Thanks for helping us out Bouncer. We don't need you anymore.");
        child = exec("cd /home/mikewills/ && ./killamm.sh", function(error, stdout, stderr) {
            if (error !== null) {
                Log('exec error: ' + error);
            }
        });
    };

/* ============================ */
/* ready */
/* ============================ */
bot.on('ready', function(data) {

    try {

        if (config.database.usedb) {
            setUpDatabase();
            client.query("SELECT `value` FROM " + config.database.dbname + "." + config.database.tablenames.cache + " WHERE `key` = 'enableQueue'", function select(error, results, fields) {
                if (results.length !== 0) {
                    if (results[0]['value'] == 1) {
                        config.enableQueue = true;
                    } else {
                        config.enableQueue = false;
                    }
                }
            });
            client.query("SELECT `value` FROM " + config.database.dbname + "." + config.database.tablenames.cache + " WHERE `key` = 'djQueue'", function select(error, results, fields) {
                if (results.length !== 0) {
                    Log(results[0]['value']);
                    var jsonResult = JSON.parse(results[0]['value']);
                    djQueue.length = jsonResult.length;
                    for (var i in jsonResult) {
                        var dj = jsonResult[i];
                        djQueue[i] = dj;
                    }
                    Log(djQueue);
                }
            });

            GetCacheValue('ctsSequenceMax', 0, function(value) {
                if (value !== null) {
                    ctsSequenceMax = value;
                }
            });
        }

        bot.roomRegister(config.roomid);

    } catch (e) {
        Log("*** Error *** " + e);
    }

});

/* ============================ */
/* roomchanged */
/* ============================ */
bot.on('roomChanged', function(data) {

    try {

        Log('Moderator IDs ' + data.room.metadata.moderator_id);
        Log('DJs' + data.room.metadata.djs);

        djs = data.room.metadata.djs;
        moderators = data.room.metadata.moderator_id;

        //Fill currentsong array with room data
        if ((data.room !== null) && (data.room.metadata !== null)) {
            if (data.room.metadata.current_song !== null) {
                populateSongData(data);
            }
        }

        //Repopulates usersList array.
        var users = data.users;
        for (var i in users) {
            var user = users[i];
            user.lastActivity = new Date();
            usersList[user.userid] = user;
        }

        //Adds all active users to the users table - updates lastseen if we've seen
        //them before, adds a new entry if they're new or have changed their username
        //since the last time we've seen them
        if (config.database.usedb) {
            for (i in users) {
                if (users[i].name !== null) {
                    client.query('INSERT INTO ' + config.database.dbname + '.' + config.database.tablenames.user + ' (userid, username, lastseen)' + 'VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE lastseen = NOW()', [users[i].userid, users[i].name]);
                }
            }
        }

        UpdateDjs(function() {});

        /* Notify the next DJ on the list */
        //NextDjOnQueue();
        bot.speak("Ready to serve!");

    } catch (e) {
        Log("*** Error *** " + e);
    }

});

/* ============================ */
/* newsong */
/* ============================ */
bot.on('newsong', function(data) {

    try {

        alreadyRolled = false;

        //Populate new song data in currentsong
        populateSongData(data);

        delete require.cache['./actions.js'];
        var Actions = require('./actions.js');

        Log('New Song: ' + data.room.metadata.current_song.metadata);

        if (ctsActive) {
            CheckCTS();
        }

        /* Update the moderator list */
        moderators = data.room.metadata.moderator_id;

        /* Autobop if DJing */
        if (djing) {
            bot.vote('up');
            voted = true;
            Log("Autobop by DJing");
        }

        /* Selectively awesome/lame songs */
        if (config.newsongcomments && !voted) {
            //Populate new song data in currentsong
            currentsong.artist = data.room.metadata.current_song.metadata.artist;
            currentsong.song = data.room.metadata.current_song.metadata.song;
            currentsong.genre = data.room.metadata.current_song.metadata.genre;

            /* First check for artist */
            var idx = findAction(currentsong.artist, Actions.artists);
            if (idx != -1) {
                //bot.vote(Actions.artists[idx].vote);
                if (Actions.artists[idx].speak !== "") {
                    bot.speak(Actions.artists[idx].speak);
                }
                //dislike = Actions.artists[idx].dislike;
                //voted = true;
                //Log("Autobop by artist");
            }

            /* Then check for song */
            idx = findAction(currentsong.song, Actions.songs);
            if (idx != -1) {
                //bot.vote(Actions.songs[idx].vote);
                if (Actions.songs[idx].speak !== "") {
                    bot.speak(Actions.songs[idx].speak);
                }
                //dislike = Actions.songs[idx].dislike;
                //voted = true;
                //Log("Autobop by song");
            }

            /* Then check for genre */
            idx = findAction(currentsong.genre, Actions.genres);
            if (idx != -1) {
                //bot.vote(Actions.genres[idx].vote);
                if (Actions.genres[idx].speak !== "") {
                    bot.speak(Actions.genres[idx].speak);
                }
                //dislike = Actions.genres[idx].dislike;
                //voted = true;
                //Log("Autobop by genre");
            }
        }

        /* Check the song length and bitch if it is too long */
        if (config.monitorsonglength) {
            if (data.room.metadata.current_song.metadata.length >= config.maxsonglength) {
                var songlength = Math.round(data.room.metadata.current_song.metadata.length / 60);
                bot.speak("Really?? We have to listen to a " + songlength + " minute song? Is that really nessesary?");
            }
        }

    } catch (e) {
        Log("*** Error *** " + e);
    }
});

/* ============================ */
/* endsong */
/* ============================ */
bot.on('endsong', function(data) {
    try {
        //Log song in DB
        if (config.database.usedb) {
            addSongToDb();
        }

        if (dislike) {
            dislike = false;
        }
        votelog = [];
        voted = false;


    } catch (e) {
        Log("*** Error *** " + e);
    }
});

/* ============================ */
/* update_votes */
/* ============================ */
bot.on('update_votes', function(data) {
    try {
        //Update vote and listener count
        currentsong.up = data.room.metadata.upvotes;
        currentsong.down = data.room.metadata.downvotes;
        currentsong.listeners = data.room.metadata.listeners;

        var votelog = data.room.metadata.votelog;
        for (var i = 0; i < votelog.length; i++) {
            var userid = votelog[i][0];
            //Log("Update Vote: " + userid);
            if (userid !== "") {
                usersList[userid].lastActivity = new Date();
            } else {
                Log("Update Vote: " + userid);
            }
        }

    } catch (e) {
        Log("*** Error *** " + e);
    }
});

/* ============================ */
/* add_dj */
/* ============================ */
bot.on('add_dj', function(data) {
    try {
        Log('Added DJ: ' + data);

        NewDjFromQueue(data);

        var user = data.user[0];
        usersList[user.userid].lastActivity = new Date();

        /*if (data.user[0].userid === '4f7a1a75aaa5cd26ee005b5f'){ bot.speak("Me hopes that @Lord of Nerds plays GOOD music this time."); }*/

        CheckAutoDj();

        UpdateDjs(function() {});

    } catch (e) {
        Log("*** Error *** " + e);
    }

});

/* ============================ */
/* rem_dj */
/* ============================ */
bot.on('rem_dj', function(data) {

    try {
        Log('Removed DJ: ' + data);

        waitingOnNextDj = false;

        /* Notify the next DJ on the list */
        NextDjOnQueue();

        CheckAutoDj();

        UpdateDjs(function() {
            AddToQueue(data.user[0].userid);
        });

    } catch (e) {
        Log("*** Error *** " + e);
    }

});

bot.on('nosong', function(data) {
    Log("nosong: " + data);
})

/* ============================ */
/* registered */
/* Runs when a user joins */
/* ============================ */
bot.on('registered', function(data) {

    try {

        if (isBanned(data.user[0].userid)) {
            bot.bootUser(data.user[0].userid, "Banned");
            Log("Banned: " + data.user[0].name);
            return;
        }

        //Log event in console
        Log('Joined room: ' + data.user[0].name);

        //Add user to usersList
        var user = data.user[0];
        user.lastActivity = new Date();
        usersList[user.userid] = user;
        if (currentsong !== null) {
            currentsong.listeners++;
        }

        //Add user to user table
        if (config.database.usedb) {
            if (user.name !== null) {
                client.query('INSERT INTO ' + config.database.dbname + '.' + config.database.tablenames.user + ' (userid, username, lastseen)' + 'VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE lastseen = NOW()', [user.userid, user.name]);
            }
        }

        if (config.enableQueue) {
            if (djQueue[data.user[0].userid] !== undefined) {
                djQueue[data.user[0].userid].isAfk = false;
                djQueue[data.user[0].userid].akfTime = null;
                djQueue.length++;
                SetCacheValue('djQueue', JSON.stringify(djQueue));
            }
            bot.pm("Greetings @" + data.user[0].name + ". If you would like to DJ, please type 'q+' to get added to the queue.", data.user[0].userid);
        }

    } catch (e) {
        Log("*** Error *** " + e);
    }
});

/* ============================ */
/* registered */
/* Runs when a user joins */
/* ============================ */
bot.on('deregistered', function(data) {
    try {

        //Log event in console
        Log('Left room: ' + data.user[0].name);

        //bot.speak("Don't let the door hit you in the ass on the way out " + data.user[0].name + "!");
        if (config.enableQueue) {
            if (djQueue[data.user[0].userid] !== undefined) {
                djQueue[data.user[0].userid].isAfk = true;
                djQueue[data.user[0].userid].akfTime = new Date();
                djQueue.length--;
                SetCacheValue('djQueue', JSON.stringify(djQueue));
            }
        }

        delete usersList[data.user[0].userid];

        if (data.user[0].userid == config.botinfo.userid) {
            killBot("4dfb57154fe7d061dd013a44");
        }

    } catch (e) {
        Log("*** Error *** " + e);
    }
});

/* ============================ */
/* registered */
/* Runs when a user joins */
/* ============================ */
bot.on('booted_user', function(data) {
    try {
        Log("booted_user: " + data);
        /*if (data.user[0].userid == config.botinfo.userid){
        killBot("4dfb57154fe7d061dd013a44");
    }*/

    } catch (e) {
        Log("*** Error *** " + e);
    }
});

/* ============================ */
/* update_user */
/* ============================ */
bot.on('update_user', function(data) {
    try {
        //Log event in console
        Log('Edited user: ' + data);

        //Update user name in users table
        /*if (config.database.usedb && (data.name !== null)) {
        client.query('INSERT INTO ' + config.database.dbname + '.' + config.database.tablenames.user +
            ' (userid, username, lastseen)' +
            'VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE lastseen = NOW()',
                [data.userid, data.name]);
    }*/

    } catch (e) {
        Log("*** Error *** " + e);
    }
});

/* ============================ */
/* snagged */
/* ============================ */
bot.on('snagged', function(data) {
    try {
        //Increase song snag count
        currentsong.snags++;

        var userid = data.userid;
        usersList[userid].lastActivity = new Date();

    } catch (e) {
        Log("*** Error *** " + e);
    }
});

/* ============================ */
/* speak */
/* ============================ */
bot.on('speak', function(data) {
    try {
        //Log in db (chatlog table)
        /*if (config.database.usedb) {
        client.query('INSERT INTO ' + config.database.dbname + '.' + config.database.tablenames.chat + ' '
            + 'SET userid = ?, chat = ?, time = NOW()',
            [data.userid, data.text]);
    }*/
        usersList[data.userid].lastActivity = new Date();

        if (data.text == "roll") {
            var roll = Math.ceil(Math.random() * 6);
            if (!alreadyRolled) {
                if (currentsong.djid == data.userid) {
                    alreadyRolled = true;
                    if (roll > 4) {
                        bot.speak(data.name + ', you rolled a ' + roll + ', Awesome!');
                        bot.vote('up');
                    } else if (roll === 1) {
                        bot.speak(data.name + ', you rolled a ' + roll + ', Lame!');
                        bot.vote('down');
                    } else {
                        bot.speak(data.name + ', you rolled a ' + roll + ', bummer.');
                    }
                    bonusvote = true;
                } else {
                    bot.speak("@Uglee roll");
                }
            }
            return;
        }

        if (data.text == '!mod') {
            bot.speak("Me summoned a moderator for you. Once should arrive soon.");
            summonModerators(data.name);
        }

        if (data.text == '!answered') {
            if (isMod(data.userid)) {
                answeredModerators();
            }
        }

        /* Catch all for the morons that can't read. */
        if (data.text == "!q+" || data.text == "q+" || data.text == "+q" || data.text == "addme" || data.text.match(/^\/addme$/) || data.text.match(/^\/a$/) || data.text.match(/^\!a$/) || data.text.match(/^\/q$/)) {
            AddToQueue(data.userid);
        }

        if (data.text == "!q-" || data.text == "q-") {
            RemoveFromQueue(data.userid);
        }

        if (data.text == "q") {
            QueueStatus();
        }

        if (data.text.substring(0, 2) == "iq") {
            if (data.text == "iq") {
                bot.speak("Usage: iq position username");
            } else {
                var position = data.text.substring(2, 4);
                var username = data.text.substring(5).substring(1);
                Log("Position: " + position);
                client.query("SELECT `userid` FROM " + config.database.dbname + "." + config.database.tablenames.user + " WHERE `username` = ?", [username], function select(error, results, fields) {
                    AddToQueue(results[0]['userid']);
                });
            }
        }

        if (data.text.substring(0, 2) == "dq") {
            if (data.text == "dq") {
                bot.speak("Usage: dq username");
            } else {
                var username = data.text.substring(3).substring(1);
                Log(username);
                client.query("SELECT `userid` FROM " + config.database.dbname + "." + config.database.tablenames.user + " WHERE `username` = ?", [username], function select(error, results, fields) {
                    RemoveFromQueue(results[0]['userid']);
                });
            }
        }

        /*var twss = require('twss');
    twss.threshold = 0.9;
    //Log("Probability: " + twss.prob(data.text));
    if (twss.is(data.text)) {
        var roll1 = Math.ceil(Math.random() * 20);
        //Log("TWSS roll: " + roll1);
        if (roll1 >= 19) {
            bot.speak("That's what she said!");
        }
    }*/

        var reg1 = RegExp(escape("roll again jerk"), "i");
        if (reg1.test(escape(data.text)) && admin(data.userid)) {
            var roll2 = Math.ceil(Math.random() * 6);
            if (roll2 > 4) {
                bot.speak(data.name + ', you rolled a ' + roll2 + ', Awesome!');
                bot.vote('up');
            } else {
                bot.speak(data.name + ', you rolled a ' + roll2 + ', bummer.');
            }
        }

        if ((data.text.toLowerCase() == "/me kicks @uglee") && admin(data.userid)) {
            bot.speak("Fine! *grumble*Jerk*mumble*");
            bot.vote("up");
        }

        if ((data.text === "CRANK IT!!!!!") && admin(data.userid)){
            bot.speak("Already did!");
            bot.vote("up");
        }

        if ((data.text === ":metal:") && admin(data.userid)){
            bot.speak(":metal:");
            bot.vote("up");
        }

        var reg2 = RegExp(escape("dance bitch"), "i");
        if (reg2.test(escape(data.text)) && admin(data.userid)) {
            bot.vote("up");
        }

        if (data.text.toLowerCase() == "fuck you @uglee") {
            bot.speak("Fuck you too!");
        }

        var result = data.text.match(/^\@(.*?)( .*)?$/);
        if (result) {

            // break out the command and parameter if one exists
            var botName = result[1].trim().toLowerCase();
            var command = '';

            if (result.length == 3 && result[2]) {
                command = result[2].trim().toLowerCase();
            }

            if (config.botName.toLowerCase() == botName) {

                Log(data.name + " >> " + data.text);

                delete require.cache['./actions.js'];
                var Actions = require('./actions.js');

                Log('Command is ' + command);

                switch (command) {
                case "addsong":
                    addSong(data.userid);
                    break;

                case "votenext":
                    VoteNextSong();
                    break;

                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                    ProcessVote(command);
                    break;

                case "endcts":
                case "stopcts":
                    if (isMod(data.userid)) {
                        if (ctsActive) {
                            ctsActive = false;
                            ctsLastWords = null;
                            bot.speak("Sorry folks, the game is over. Play what you want now.");
                        }
                    }
                    break;

                case "startcts":
                    if (isMod(data.userid)) {
                        if (!ctsActive) {
                            ctsActive = true;
                            bot.speak("We are now playing 'Connect the Songs' each DJ must play a song with at least one word in the title from the previous song title. It will begin with the next song. The best score is currently " + ctsSequenceMax);
                        }
                    }
                    break;

                case "enableq":
                case "enablequeue":
                case "startq":
                case "startqueue":
                    if (isMod(data.userid)) {
                        config.enableQueue = true;
                        bot.speak("We are now using a queue! Sign up using 'q+'.");
                        enableQueueCache();
                    }
                    break;

                case "endq":
                case "endqueue":
                case "stopq":
                case "stopqueue":
                    if (isMod(data.userid)) {
                        config.enableQueue = false;
                        djQueue = {
                            length: 0
                        };
                        clearInterval(queueRefreshIntervalId);
                        bot.speak("There is no queue...");
                        clearQueueCache();
                    }
                    break;

                case "mod":
                case "needhelp":
                    bot.speak("Me summoned a moderator for you. Once should arrive soon.");
                    summonModerators(data.name);
                    break;

                case "i got it":
                case "igotit":
                    answeredModerators();
                    break;

                case "news":
                    bot.speak(announcement);
                    break;

                case "listenercount":
                    bot.speak("There is " + currentsong.listeners + " listeners right now.");
                    break;

                case "ctsmax":
                    bot.speak("The highest 'Connect the Songs' count is: " + ctsSequenceMax);
                    break;

                case "summonbouncer":
                    if (isMod(data.userid)) {
                        summonBouncer();
                    }
                    break;

                case "dismissbouncer":
                    if (admin(data.userid)) {
                        dismissBouncer();
                    }
                    break;

                case "die":
                    killBot(data.userid);
                    break;

                case "userCount":
                    bot.roomInfo(true, function(data) {
                        Log(data.room.metadata.listeners);
                        bot.speak("Total users in room is: " + data.room.metadata.listeners);
                    });
                    break;

                default:
                    if (command === "") {
                        bot.speak('Yes Master @' + data.name + '? Here is what I can do for you: speak | dance | menu | whois | startcts | stopcts | needhelp');

                        if (isMod(data.senderid)) {
                            bot.pm("As moderator, you can startq | endq | dq @name | iq pos# @name", data.senderid);
                        }
                    } else {
                        var idx = findAction(command, Actions.chat_responses);
                        if (idx != -1) {
                            bot.speak(Actions.chat_responses[idx].response1.replace("{0}", data.name));
                            if (Actions.chat_responses[idx].response2 !== "") {
                                pause(500);
                                bot.speak(Actions.chat_responses[idx].response2.replace("{0}", data.name));
                            }
                        }
                    }
                }
            }
        }

    } catch (e) {
        Log("*** Error *** " + e);
    }
});

/* ============================ */
/* pmmed */
/* ============================ */
bot.on('pmmed', function(data) {
    try {
        Log('Private message: ' + data);

        if (isBanned(data.senderid)) {
            return;
        }

        Log("PMMED >> " + data.text);

        /* Catch all for the morons that can't read. */
        if (data.text == "!q+" || data.text == "q+" || data.text == "+q" || data.text == "addme" || data.text.match(/^\/addme$/) || data.text.match(/^\/a$/) || data.text.match(/^\!a$/) || data.text.match(/^\/q$/)) {
            AddToQueue(data.senderid);
        }

        //if (data.text.match(/^Uglee$/) && data.senderid == '4e7bf475a3f7511657030c34') {
        //var reg = RegExp(escape("Uglee"), "i");
        if (data.senderid == '4e7bf475a3f7511657030c34') {
            var query = escape(data.text);
            var reg = RegExp(escape("Uglee"));
            if (reg.test(query)) {
                ammResponded = true;
                Log("AMM Responded");
            }
        }

        var result = data.text.match(/^(.*?)( .*)?$/);
        if (result) {
            // break out the command and parameter if one exists
            var command = result[1].trim().toLowerCase();
            var param = '';
            if (result.length == 3 && result[2]) {
                param = result[2].trim().toLowerCase();
            }
            // handle valid commands
            Log('Command: ' + command);
            Log('Param: ' + param);

            switch (command) {
            case "die":
                killBot(data.senderid);
                break;

            case "addsong":
                addSong(data.senderid);
                break;

            case "summonbouncer":
                if (isMod(data.senderid)) {
                    summonBouncer();
                }
                break;

            case "dismissbouncer":
                if (admin(data.senderid)) {
                    dismissBouncer();
                }
                break;

            case "news":
                bot.speak(announcement);
                break;

            case "djwarn":
                mustAwesome(param);
                break;

            case "stepup":
                if (admin(data.senderid)) {
                    stepUp();
                }
                break;

            case "stepdown":
                if (admin(data.senderid)) {
                    stepDown();
                }
                break;

            case "skip":
                if (admin(data.senderid)) {
                    bot.skip();
                }
                break;

            case "test":

                break;

            case "votenext":
                VoteNextSong();
                break;

            case "roll":
                if (admin(data.senderid)) {
                    var roll2 = Math.ceil(Math.random() * 6);
                    if (roll2 > 4) {
                        bot.speak('A ' + roll2 + ' has been rolled on your behalf, Awesome!');
                        bot.vote('up');
                    } else {
                        bot.speak('A ' + roll2 + ' has been rolled on your behalf, bummer.');
                    }
                }
                break;

            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
                ProcessVote(command);
                break;

            case "autodj":
                if (admin(data.senderid)) {
                    config.autodj = param;
                    bot.pm("Autodj set to: " + config.autodj, data.senderid);
                }
                break;

            case "autobop":
                if (admin(data.senderid)) {
                    config.autobop = param;
                    bot.pm("Autobop set to: " + config.autobop, data.senderid);
                }
                break;

            case "setlaptop":
                bot.modifyLaptop(param);
                break;

            case "avatar":
                bot.setAvatar(param);
                break;

            case "speak":
                if (isMod(data.senderid)) {
                    bot.speak(param);
                }
                break;

            case "findidle":
                if (isMod(data.senderid)) {
                    findIdle(data.senderid);
                }
                break;

            case "goto":
                if (admin(data.senderid)) {
                    if (param == "amm") {
                        bot.roomDeregister();
                        bot.roomRegister('4ea390ac14169c0cc3caa078');
                    }
                    /*else if (param == "maw") {
                    bot.roomDeregister();
                    bot.roomRegister('4ef82538590ca23e33001b3b');
                } else if (param == "bootcamp") {
                    bot.roomDeregister();
                    bot.roomRegister('4f46ecd8590ca24b66000bfb');
                } else if (param == "tgshuffle") {
                    bot.roomDeregister();
                    bot.roomRegister('4f5e1e11590ca246db01e6fc');
                }*/
                    else if (param == "vip") {
                        bot.roomDeregister();
                        bot.roomRegister('4f73ef36eb35c10888004976');
                    } else if (param == "rock") {
                        bot.roomDeregister();
                        bot.roomRegister("503cc5b72e3817632f1e6d93");
                    }
                    /*else if (param == "campfire") {
                    bot.speak("The campfire is lit! See you there! http://murl.me/campfire");
                    bot.roomDeregister();
                    bot.roomRegister('4f6c119d68f5540c6d1dd67d');
                }*/
                    else {
                        bot.roomDeregister();
                        bot.roomRegister(param);
                    }
                }
                break;

            case "help":
                if (isMod(data.senderid)) {
                    bot.pm("You can awesome (or a) | lame (or l) | djwarn 1 | djwarn 2 | findidle | summonbouncer", data.senderid);
                }
                if (admin(data.senderid)) {
                    pause(500);
                    bot.pm("roll | step up | step down | skip | die | summonbouncer | dismissbouncer", data.senderid);
                }
                break;
            }
        }

    } catch (e) {
        Log("*** Error *** " + e);
    }
});

/* ============== */
/* AddToQueue */
/* ============== */
global.AddToQueue = function(userid) {
    var text = "";

    if (config.enableQueue) { /* Check if they are a DJ */
        if (djs.indexOf(userid) == -1) { /* Check if they are already on the queue*/
            if (djQueue[userid] === undefined && usersList[userid] !== undefined) {
                djQueue[userid] = {
                    "id": userid,
                    "name": usersList[userid].name,
                    "isAfk": false,
                    "akfCount": 0,
                    "akfTime": null
                };
                djQueue.length++;

                text = "@" + djQueue[userid].name + ", you have been added to the queue. There is a total of " + djQueue.length + " now.";
                bot.speak(text);
                SetCacheValue('djQueue', JSON.stringify(djQueue));
            }
        } else {
            text = "@" + usersList[userid].name + ", seriously?!? Can't you wait until you're OFF the TABLE before adding yourself to the queue again? FAIL! ";
            bot.speak(text);
        }
    }
};

/* ============== */
/* InsertInQueue */
/* ============== */
global.InsertInQueue = function(userid, position) {
    var text = "";

    if (config.enableQueue) { /* Check if they are a DJ */
        if (djs.indexOf(userid) == -1) { /* Check if they are already on the queue*/
            if (djQueue.indexOf(userid) == -1) {
                djQueue.splice((position - 1), 0, userid);
                text = "@" + usersList[userid].name + ", you have been added to the queue. There is a total of " + djQueue.length + " now.";
                bot.speak(text);
                Log(djQueue);
                djQueue.length++;
                SetCacheValue('djQueue', JSON.stringify(djQueue));
            }
        }
    }
};

/* ============== */
/* RemoveFromQueue */
/* ============== */
global.RemoveFromQueue = function(userid) {
    if (config.enableQueue) {
        if (djQueue[userid] !== undefined) {
            delete djQueue[userid];
            djQueue.length--;
            bot.speak("You have been removed from the queue @" + usersList[userid].name);
            SetCacheValue('djQueue', JSON.stringify(djQueue));
        }
    }
};

/* ============== */
/* NewDjFromQueue - This checks to see if the DJ that just stepped up is the next DJ in the queue */
/* ============== */
global.NewDjFromQueue = function(data) {
    if (config.enableQueue) {
        var text = "";
        if (djQueue.length > 0 && (nextDj !== null || nextDj === undefined)) {
            if (data.user[0].userid != nextDj) {
                bot.remDj(data.user[0].userid);
                text = "Sorry @" + usersList[data.user[0].userid].name + ", it's @" + usersList[nextDj].name + " turn. You need to wait your turn.";
                bot.speak(text);
            } else {
                delete djQueue[data.user[0].userid];
                djQueue.length--;
                SetCacheValue('djQueue', JSON.stringify(djQueue));
                waitingOnNextDj = false;
                clearInterval(queueRefreshIntervalId);
                nextDj = null;
            }
        }
    }
};

/* ============== */
/* NextDjOnQueue - This lets the room know who is next to DJ */
/* ============== */
global.NextDjOnQueue = function() {
    qPosn = 0;
    nextDj = null;
    Log("Waiting on next DJ" + waitingOnNextDj);
    if (config.enableQueue && !waitingOnNextDj) {
        if (djQueue.length > 0) {
            Log(djQueue);
            for (var i in djQueue) {
                if (djQueue[i].id !== undefined) {
                    if (djQueue[i].isAfk) djQueue[i].afkCount++;
                    else {
                        nextDj = djQueue[i].id;
                        Log("Next DJ is: " + usersList[nextDj]);
                        break;
                    }
                }
            }

            if (nextDj === null) {
                bot.speak("The queue is empty. All DJs in the queue are currently not here. Anyone can DJ at this time!");
                return;
            }

            var text = "It is now @" + djQueue[nextDj].name + "'s turn to DJ! You have " + config.nextDjQueueTimeout + " seconds to step up.";
            waitingOnNextDj = true;
            bot.speak(text);
            bot.pm("It's your turn to DJ.", nextDj);
            nextDjTime = new Date();
            queueRefreshIntervalId = setInterval(CheckForNextDjFromQueue, 5000);
        } else {
            bot.speak("The queue is empty. Anyone can DJ at this time!");
        }
    }
};

/* ============== */
/* CheckForNextDjFromQueue */
/* ============== */
global.CheckForNextDjFromQueue = function() {
    if (nextDj !== null) {
        var currentTime = new Date();
        if (currentTime.getTime() - nextDjTime.getTime() > (config.nextDjQueueTimeout * 1000)) {
            var pastDj = djQueue[nextDj];
            Log(pastDj);
            pastDj.afkCount++;

            delete djQueue[nextDj];
            djQueue.length--;

            if (pastDj.afkCount >= 2) {
                bot.speak("Sorry @" + pastDj.name + ", you missed out! Whatta looser! You can add yourself back to the queue, but pay attention this time.");
            } else {
                djQueue[nextDj] = pastDj;
                djQueue.length++;
                bot.speak("Too late @" + pastDj.name + " you can try once more on the next opening.");
            }

            waitingOnNextDj = false;

            SetCacheValue('djQueue', JSON.stringify(djQueue));
            clearInterval(queueRefreshIntervalId);
            NextDjOnQueue();
        }
    }
};

/* ============== */
/* QueueStatus */
/* ============== */
global.QueueStatus = function() {

    if (config.enableQueue) {
        var djList = "";

        for (var i in djQueue) {
            var queuedDj = djQueue[i];
            Log(queuedDj);
            if (!queuedDj.isAfk) {
                if (queuedDj.name !== undefined) {
                    djList += queuedDj.name + ", ";
                }
            } else {
                var now = new Date();
                var afkTime = new Date(queuedDj.akfTime);
                var afkFor = dateDiff(now, afkTime, 'min');
                Log(afkFor);
                if (queuedDj.isAfk && afkFor >= 5) {
                    Log("Remove DJ: " + djQueue[i].name);
                    delete djQueue[i];
                }
            }
        }

        if (djList !== "") {
            var text = djQueue.length + " DJ(s) in the queue. They are: " + djList;
            bot.speak(text.substring(0, text.length - 2));
        } else {
            bot.speak("Queue is empty!");
        }
        SetCacheValue('djQueue', JSON.stringify(djQueue));
    }
};

var enableQueueCache = function() {
        if (config.database.usedb) {
            client.query('INSERT INTO ' + config.database.dbname + '.' + config.database.tablenames.cache + ' (`key`, `value`, `DateStamp`) VALUES (?, ?, CURRENT_TIMESTAMP)', ["enableQueue", config.enableQueue]);
            client.query('INSERT INTO ' + config.database.dbname + '.' + config.database.tablenames.cache + ' (`key`, `value`, `DateStamp`) VALUES (?, ?, CURRENT_TIMESTAMP)', ["djQueue", JSON.stringify(djQueue)]);
        }
    };

var clearQueueCache = function() {
        if (config.database.usedb) {
            client.query("DELETE FROM " + config.database.dbname + "." + config.database.tablenames.cache + " WHERE `key` = 'enableQueue'");
            client.query("DELETE FROM " + config.database.dbname + "." + config.database.tablenames.cache + " WHERE `key` = 'djQueue'");
        }
    };



/* ============== */
/* UpdateDjs - Check to see if the user is a moderator */
/* ============== */
global.UpdateDjs = function(callback) {
    bot.roomInfo(function(data) { /* Update the list since we are here */
        djs = data.room.metadata.djs;
        moderators = data.room.metadata.moderator_id;
        callback();
    });
};

/* ============== */
/* SetCacheValue - Sets the value to the DB cache */
/* ============== */
global.SetCacheValue = function(key, value) {
    if (config.database.usedb) {
        client.query("SELECT `value` FROM " + config.database.dbname + "." + config.database.tablenames.cache + " WHERE `key` = ?", [key], function select(error, results, fields) {
            if (results !== undefined) {
                if (results.length !== 0) {
                    client.query("UPDATE " + config.database.dbname + "." + config.database.tablenames.cache + " SET `value` = ? WHERE `key` = ?", [value, key]);
                } else {
                    client.query("INSERT INTO " + config.database.dbname + "." + config.database.tablenames.cache + " (`key`, `value`, `DateStamp`) VALUES (?, ?, CURRENT_TIMESTAMP)", [key, value]);
                }
            } else {
                client.query("INSERT INTO " + config.database.dbname + "." + config.database.tablenames.cache + " (`key`, `value`, `DateStamp`) VALUES (?, ?, CURRENT_TIMESTAMP)", [key, value]);
            }
        });
    }
};

/* ============== */
/* GetCacheValue - Gets the value from the DB cache */
/* ============== */
global.GetCacheValue = function(key, timeout, callback) {
    if (config.database.usedb) {
        client.query("SELECT `value`, `DateStamp` FROM " + config.database.dbname + "." + config.database.tablenames.cache + " WHERE `key` = ?", [key], function select(error, results, fields) {
            Log("Results: " + results);
            if (results !== undefined) {
                if (results.length !== 0) {
                    var now = new Date();
                    if (timeout === 0 || dateDiff(now, results[0]['DateStamp'], 'min') <= timeout) {
                        callback(results[0]['value']);
                    } else {
                        callback(null);
                    }
                } else {
                    callback(null);
                }
            } else {
                callback(null);
            }
        });
    }
};

/* ============== */
/* RemoveCacheValue - Sets the value to the DB cache */
/* ============== */
global.RemoveCacheValue = function(key) {
    if (config.database.usedb) {
        client.query("DELETE FROM " + config.database.dbname + "." + config.database.tablenames.cache + " WHERE `key` = ?", [key]);
    }
};