/* Last changed 3/7/2012 @ 2016 */

/* AMM = "roomid":"4ea390ac14169c0cc3caa078", */
/* Bootcamp = "roomid":"4f46ecd8590ca24b66000bfb", */
/* MAW = "roomid":"4ef82538590ca23e33001b3b", */

var fs = require('fs');
var Bot = require('ttapi');

/*  Creates the config object */
var config;
try {
    config = JSON.parse(fs.readFileSync('config.json', 'ascii'));
} catch (e) {
    console.log(e);
    console.log('Ensure that config.json is present in this directory.');
    process.exit(0);
}

//Creates mysql db object
if (config.database.usedb) {
    try {
        mysql = require('mysql');
    } catch (e) {
        console.log(e);
        console.log('It is likely that you do not have the mysql node module installed.' + '\nUse the command \'npm install mysql\' to install.');
        console.log('Starting bot without database functionality.');
        config.database.usedb = false;
    }

    //Connects to mysql server
    try {
        client = mysql.createClient(config.database.login);
    } catch (e) {
        console.log(e);
        console.log('Make sure that a mysql server instance is running and that the ' + 'username and password information in config.js are correct.');
        console.log('Starting bot without database functionality.');
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
        console.log('exec error: ' + error);
    }

    child = exec("t update 'd @mikewills This is Uglee, I rebooted for you!'", function(error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
});


/*  banned users */
var bannedUsers = ['4f7a1a75aaa5cd26ee005b5f', '4f7bd3adeb35c15efd00005a'];

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
var ctsSequenceMax = 26;
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

function PostAnnouncement() {
    var roll = Math.ceil(Math.random() * 8);
    var now = new Date();
    var timePassed = Math.round((now - lastAnnouncement) / 3600000);
    if (roll == 1 && timePassed > 2){
        bot.speak(announcement);
        lastAnnouncement = new Date();
    }
}

function CheckThatAMMisAlive() {
    bot.pm("!count", "4e7bf475a3f7511657030c34");
    isAmmDown = false;
    ammResponded = false;
    ammRefreshIntervalId = setInterval(HasAmmResponded, 30000);
    console.log("Sent Request");
    //PostAnnouncement();
}
//setInterval(CheckThatAMMisAlive, 60000); // Check every 15 minutes
setInterval(CheckThatAMMisAlive, 900000); // Check every 15 minutes

function HasAmmResponded() {
    console.log("Checking AMM status");
    console.log(ammResponded);
    if (!ammResponded) { /* Sends me a message every time Uglee reboots */
        child = exec("t set active GilimYurhig", function(error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }

            child = exec("t update '@mikewills This is Uglee, AMM is being a jerk and not answering me.'", function(error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
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
        console.log("Banned");
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
        bot.speak("DJs: The gorilla doesn't like jerks. Please support your fellow DJs by clicking awesome for their songs. See Rule #3.");
        pause(250);
        bot.speak("Me have heard the screams... not pleasant.");
    } else if (id == 2) {
        bot.speak("DJs: Please support your fellow DJs by clicking the awesome button! It's easy and it's a rule! See #3. Just type !rules to see. Otherwise you WILL be booted off in two songs.");
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
        //console.log(options);
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
        console.log(incomingVotes);
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
        console.log("Vote " + topVote + " wins!");

        var winner = topVote - 1;
        console.log(winner);
        bot.playlistReorder(winner, 0, function() {
            //bot.playlistAll(function(data) {
            //bot.speak("Next song is: " + data.list[0].metadata.song + " by " + data.list[0].metadata.artist);
            //console.log("Next song is: " + data.list[0].metadata.song + " by " + data.list[0].metadata.artist);
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
        console.log(ctsLastWords);
        var song = currentsong.song.toLowerCase().replace("'", " ").replace("\"", " ").replace("(", " ").replace(")", " ").replace(".", " ").replace("/", " ").replace("\\", " ").replace("  ", " ");
        console.log(song);
        var words = song.split(" ");
        console.log(words);
        if (ctsLastWords !== null) {
            for (var i = 0; i <= words.length; i++) {
                if (ctsLastWords.indexOf(words[i]) != -1) {
                    isOk = true;
                }
            }
        } else {
            isOk = true;
        }

        console.log(isOk);

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
            }
            bot.speak("Boo! The game is over with a score of " + ctsSequenceCount + ". The highest score is " + ctsSequenceMax);
            console.log("Game ended");
            ctsActive = false;
            ctsSequenceCount = -1;
            ctsLastWords = [];
        }
    };

function dateDiff(a, b, format) {
    var milliseconds = toDate(a) - toDate(b);
    var days = milliseconds / 86400000;
    var hours = milliseconds / 3600000;
    var weeks = milliseconds / 604800000;
    var months = milliseconds / 2628000000;
    var years = milliseconds / 31557600000;
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
            //console.log(usersList[z]);
            //if (usersList[z].laptop != "iphone" || usersList[z].laptop != "android") {
            //console.log(usersList[z]);
            var startDate = new Date();
            var idleTime = Math.round((startDate - usersList[z].lastActivity) / 3600000); // in hours
            //var idleTime = Math.round((startDate - usersList[z].lastActivity) / 60000); // for testing minutes
            console.log(usersList[z].name + ": " + idleTime);
            if (idleTime >= 6) {
                pmText += usersList[z].name + ": " + idleTime + " on " + usersList[z].laptop + " | ";
            }
            //}
        }
        bot.pm(pmText, senderid);
    };

var summonModerators = function() {
        child = exec("t set active GilimYurhig", function(error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }

            child = exec("t update 'Uglee: A moderator is requested in AMM. @mikewills @techguyjason @mikebdotorg'", function(error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
        });
    };

var goToWork = function() {
        bot.speak("Can a moderator make me a moderator when I return? Thanks!");
        child = exec("cd /home/mikewills/", function(error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
            }

            child = exec("./amm.sh", function(error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
        });
    };

/* ============================ */
/* ready */
/* ============================ */
bot.on('ready', function(data) {

    if (config.database.usedb) {
        setUpDatabase();
    }

    bot.roomRegister(config.roomid);
});

/* ============================ */
/* roomchanged */
/* ============================ */
bot.on('roomChanged', function(data) {

    if (config.consolelog) {
        //console.log('Room Changed',  data);
        console.log('Moderator IDs', data.room.metadata.moderator_id);
        console.log('DJs', data.room.metadata.djs);
    }

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
});

/* ============================ */
/* newsong */
/* ============================ */
bot.on('newsong', function(data) {

    alreadyRolled = false;

    //Populate new song data in currentsong
    populateSongData(data);

    delete require.cache['./actions.js'];
    var Actions = require('./actions.js');

    if (config.consolelog) {
        console.log('newsong', data.room.metadata.current_song.metadata);
    }

    if (ctsActive) {
        CheckCTS();
    }

    /* Update the moderator list */
    moderators = data.room.metadata.moderator_id;

    /* Autobop if DJing */
    if (djing) {
        bot.vote('up');
        voted = true;
        console.log("Autobop by DJing");
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
            //console.log("Autobop by artist");
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
            //console.log("Autobop by song");
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
            //console.log("Autobop by genre");
        }
    }

    /* Check the song length and bitch if it is too long */
    if (config.monitorsonglength) {
        if (data.room.metadata.current_song.metadata.length >= config.maxsonglength) {
            var songlength = Math.round(data.room.metadata.current_song.metadata.length / 60);
            bot.speak("Really?? We have to listen to a " + songlength + " minute song? Is that really nessesary?");
        }
    }
});

/* ============================ */
/* endsong */
/* ============================ */
bot.on('endsong', function(data) {
    //Log song in DB
    if (config.database.usedb) {
        addSongToDb();
    }

    if (dislike) {
        dislike = false;
    }
    votelog = [];
    voted = false;
});

/* ============================ */
/* update_votes */
/* ============================ */
bot.on('update_votes', function(data) {
    //Update vote and listener count
    currentsong.up = data.room.metadata.upvotes;
    currentsong.down = data.room.metadata.downvotes;
    currentsong.listeners = data.room.metadata.listeners;

    var votelog = data.room.metadata.votelog;
    for (var i = 0; i < votelog.length; i++) {
        var userid = votelog[i][0];
        //console.log("Update Vote: " + userid);
        if (userid !== "") {
            usersList[userid].lastActivity = new Date();
        } else {
            console.log("Update Vote: " + userid);
        }
    }
});

/* ============================ */
/* add_dj */
/* ============================ */
bot.on('add_dj', function(data) {

    if (config.consolelog) {
        console.log('Added DJ: ', data);
    }

    var user = data.user[0];
    usersList[user.userid].lastActivity = new Date();

    /*if (data.user[0].userid === '4f7a1a75aaa5cd26ee005b5f'){ bot.speak("Me hopes that @Lord of Nerds plays GOOD music this time."); }*/

    CheckAutoDj();

});

/* ============================ */
/* rem_dj */
/* ============================ */
bot.on('rem_dj', function(data) {

    if (config.consolelog) {
        console.log('Removed DJ: ', data);
    }

    var user = data.user[0];
    usersList[user.userid].lastActivity = new Date();

    CheckAutoDj();

});

/* ============================ */
/* registered */
/* Runs when a user joins */
/* ============================ */
bot.on('registered', function(data) {
    //Log event in console
    if (config.consolelog) {
        console.log('Joined room: ' + data.user[0].name);
    }

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
});

bot.on('deregistered', function(data) {
    delete usersList[data.user[0].userid];
});

/* ============================ */
/* update_user */
/* ============================ */
bot.on('update_user', function(data) {
    //Log event in console
    if (config.consolelog) {
        console.log('Edited user: ' + data);
    }

    //Update user name in users table
    /*if (config.database.usedb && (data.name !== null)) {
        client.query('INSERT INTO ' + config.database.dbname + '.' + config.database.tablenames.user +
            ' (userid, username, lastseen)' +
            'VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE lastseen = NOW()',
                [data.userid, data.name]);
    }*/
});

/* ============================ */
/* snagged */
/* ============================ */
bot.on('snagged', function(data) {
    //Increase song snag count
    currentsong.snags++;

    var userid = data.userid;
    usersList[userid].lastActivity = new Date();
});

/* ============================ */
/* speak */
/* ============================ */
bot.on('speak', function(data) {

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
    }

    /*var twss = require('twss');
    twss.threshold = 0.9;
    //console.log("Probability: " + twss.prob(data.text));
    if (twss.is(data.text)) {
        var roll1 = Math.ceil(Math.random() * 20);
        //console.log("TWSS roll: " + roll1);
        if (roll1 >= 19) {
            bot.speak("That's what she said!");
        }
    }*/

    if (isBanned(data.userid)) {
        return;
    }

    if (data.text == "roll again jerk" && admin(data.userid)) {
        var roll2 = Math.ceil(Math.random() * 6);
        if (roll2 > 4) {
            bot.speak(data.name + ', you rolled a ' + roll2 + ', Awesome!');
            bot.vote('up');
        } else {
            bot.speak(data.name + ', you rolled a ' + roll2 + ', bummer.');
        }
    }

    if (data.text == "Fuck you @Uglee") {
        bot.speak("Fuck you too!");
    }

    if (data.text.match(/^\!putmeinthequeuedouchebag$/)) {
        bot.speak("Leave me alone, @ShiningDimLight");
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

            console.log(data.name, " >> ", data.text);

            delete require.cache['./actions.js'];
            var Actions = require('./actions.js');

            if (config.consolelog) {
                console.log('Command is', command);
            }

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

            case "mod":
                summonModerators();
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

            case "gotowork":
                if (isMod(data.userid)) {
                    goToWork();
                }
                break;

            case "die":
                killBot(data.userid);
                break;

            case "userCount":
                bot.roomInfo(true, function(data) {
                    console.log(data.room.metadata.listeners);
                    bot.speak("Total users in room is: " + data.room.metadata.listeners);
                });
                break;

            default:
                if (command === "") {
                    bot.speak('Yes Master @' + data.name + '? Here is what I can do for you: speak | dance | menu | whois');
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
});

/* ============================ */
/* pmmed */
/* ============================ */
bot.on('pmmed', function(data) {

    if (config.consolelog) {
        console.log('Private message: ', data);
    }

    if (isBanned(data.senderid)) {
        return;
    }

    console.log("PMMED >> ", data.text);
    console.log('Private message: ', data);

    //if (data.text.match(/^Uglee$/) && data.senderid == '4e7bf475a3f7511657030c34') {
    //var reg = RegExp(escape("Uglee"), "i");
    if (data.senderid == '4e7bf475a3f7511657030c34') {
        var query = escape(data.text);
        var reg = RegExp(escape("Uglee"));
        if (reg.test(query)) {
            ammResponded = true;
            console.log("AMM Responded");
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
        if (config.consolelog) {
            console.log('Command: ', command);
            console.log('Param: ', param);
        }

        switch (command) {
        case "die":
            killBot(data.senderid);
            break;

        case "addsong":
            addSong(data.senderid);
            break;

        case "gotowork":
            if (isMod(data.userid)) {
                goToWork();
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

        case "votenext":
            VoteNextSong();
            break;

        case "roll":
        var roll2 = Math.ceil(Math.random() * 6);
        if (roll2 > 4) {
            bot.speak('A ' + roll2 + ' has been rolled on your behalf, Awesome!');
            bot.vote('up');
        } else {
            bot.speak('A ' + roll2 + ' has been rolled on your behalf, bummer.');
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
                }
                else if (param == "hothits"){
                    bot.roomDeregister();
                    bot.roomRegister("4f5f162268f554664cc5b2c4");
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
                bot.pm("You can awesome (or a) | lame (or l) | djwarn 1 | djwarn 2 | findidle", data.senderid);
            }
            if (admin(data.senderid)) {
                pause(500);
                bot.pm("roll | step up | step down | skip | die", data.senderid);
            }
            break;
        }
    }
});