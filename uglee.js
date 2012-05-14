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
    sys.print('stdout: ' + stdout);
    sys.print('stderr: ' + stderr);
    if (error !== null) {
        console.log('exec error: ' + error);
    }

    child = exec("t update 'd @mikewills This is Uglee, I rebooted for you!'", function(error, stdout, stderr) {
        sys.print('stdout: ' + stdout);
        sys.print('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
});


/*  Current song info */

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

function awesomeSong(userid) {
    if (isMod(userid) || admin(userid)) {
        bot.vote('up');
    }
}

function lameSong(userid) {
    if (isMod(userid) || admin(userid)) {
        bot.vote('down');
    }
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
        bot.speak("Type in your choice by typing '@Uglee #'. Voting is open for 1 minute.");
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
            bot.playlistAll(function(data) {
                bot.speak("Next song is: " + data.list[0].metadata.song + " by " + data.list[0].metadata.artist);
                console.log("Next song is: " + data.list[0].metadata.song + " by " + data.list[0].metadata.artist);
            });

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

    //Populate new song data in currentsong
    populateSongData(data);

    delete require.cache['./actions.js'];
    var Actions = require('./actions.js');

    if (config.consolelog) {
        console.log('newsong', data.room.metadata.current_song.metadata);
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
            bot.vote(Actions.artists[idx].vote);
            if (Actions.artists[idx].speak !== "") {
                bot.speak(Actions.artists[idx].speak);
            }
            dislike = Actions.artists[idx].dislike;
            voted = true;
            console.log("Autobop by artist");
        }

        /* Then check for song */
        idx = findAction(currentsong.song, Actions.songs);
        if (idx != -1) {
            bot.vote(Actions.songs[idx].vote);
            if (Actions.songs[idx].speak !== "") {
                bot.speak(Actions.songs[idx].speak);
            }
            dislike = Actions.songs[idx].dislike;
            voted = true;
            console.log("Autobop by song");
        }

        /* Then check for genre */
        idx = findAction(currentsong.genre, Actions.genres);
        if (idx != -1) {
            bot.vote(Actions.genres[idx].vote);
            if (Actions.genres[idx].speak !== "") {
                bot.speak(Actions.genres[idx].speak);
            }
            dislike = Actions.genres[idx].dislike;
            voted = true;
            console.log("Autobop by genre");
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

    /* If autobop is enabled, determine if the bot should autobop or not based on votes */
    if (config.autobop) {
        var percentAwesome = (data.room.metadata.upvotes / data.room.metadata.listeners) * 100;
        var percentLame = (data.room.metadata.downvotes / data.room.metadata.listeners) * 100;

        if ((percentAwesome - percentLame) > 25) {
            if (!voted) {
                bot.vote('up');
                voted = true;
                console.log("Autobop");
            }
        }

        if ((percentLame - percentAwesome) > 25) {
            if (!voted) {
                bot.vote('down');
                dislike = true;
                voted = true;
                console.log("Autolame");
            }
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

    CheckAutoDj();

});

/* ============================ */
/* rem_dj */
/* ============================ */
bot.on('rem_dj', function(data) {

    if (config.consolelog) {
        console.log('Removed DJ: ', data);
    }

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

    if (data.text == "Fuck you @Uglee") {
        bot.speak("Fuck you too!");
    }

    if (data.text.match(/^\!putmeinthequeuedouchebag$/)) {
        bot.speak("Leave me alone, @ShiningDimLight");
    }

    if (data.text.match(/^a$/) || data.text.match(/^\#a$/)) {
        awesomeSong(data.userid);
        console.log("Vote by mass a");
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
            case "a":
            case "awesome":
                awesomeSong(data.userid);
                break;

            case "l":
            case "lame":
                lameSong(data.userid);
                break;

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

            case "die":
                killBot(data.userid);
                break;

            default:
                if (command === "") {
                    bot.speak('Yes Master @' + data.name + '? Here is what I can do for you: speak | dance | beer | water | coke | dew | cake | coffee | whois');
                    if (isMod(data.userid)) {
                        pause(500);
                        bot.speak('As a moderator, you can also `awesome` (or a) and `lame` (or l) songs. You can also PM me.');
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
});

/* ============================ */
/* pmmed */
/* ============================ */
bot.on('pmmed', function(data) {

    if (config.consolelog) {
        console.log('Private message: ', data);
    }

    console.log("PMMED >> ", data.text);

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
        case "awesome":
        case "a":
            awesomeSong(data.senderid);
            break;

        case "lame":
        case "l":
            lameSong(data.senderid);
            break;

        case "die":
            killBot(data.senderid);
            break;

        case "addsong":
            addSong(data.senderid);
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

        case "goto":
            if (admin(data.senderid)) {
                if (param == "amm") {
                    bot.roomDeregister();
                    bot.roomRegister('4ea390ac14169c0cc3caa078');
                } else if (param == "maw") {
                    bot.roomDeregister();
                    bot.roomRegister('4ef82538590ca23e33001b3b');
                } else if (param == "bootcamp") {
                    bot.roomDeregister();
                    bot.roomRegister('4f46ecd8590ca24b66000bfb');
                } else if (param == "tgshuffle") {
                    bot.roomDeregister();
                    bot.roomRegister('4f5e1e11590ca246db01e6fc');
                } else if (param == "vip") {
                    bot.roomDeregister();
                    bot.roomRegister('4f73ef36eb35c10888004976');
                } else if (param == "campfire") {
                    bot.speak("The campfire is lit! See you there! http://murl.me/campfire");
                    bot.roomDeregister();
                    bot.roomRegister('4f6c119d68f5540c6d1dd67d');
                }
            }
            break;

        case "help":
            if (isMod(data.senderid)) {
                bot.pm("You can awesome (or a) | lame (or l) | djwarn 1 | djwarn 2", data.senderid);
            }
            if (admin(data.senderid)) {
                pause(500);
                bot.pm("step up | step down | skip | die | goto AMM & bootcamp", data.senderid);
            }
            break;

        default:
            bot.pm("Unknown command. Type 'help' for commands.", data.senderid);
        }
    }
});
