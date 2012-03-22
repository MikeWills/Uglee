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
            bot.speak("Hope you don't mind me adding \"" + songName + "\" to me queue.");
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

    /* Check if the bot should step up to DJ */
    if (config.autodj) {
        if (data.room.metadata.djcount <= (data.room.metadata.max_djs - 2)) {
            if (!djing) {
                stepUp();
            }
        }

        if (data.room.metadata.djcount == data.room.metadata.max_djs) {
            if (djing) {
                stepDown();
            }
        }
    }

    /* Autobop if DJing */
    if (djing) {
        bot.vote('up');
        voted = true;
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
            }
        }

        if ((percentLame - percentAwesome) > 25) {
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
bot.on('add_dj', function(data) {

    if (config.consolelog) {
        console.log('Added DJ: ', data);
    }

});

/* ============================ */
/* rem_dj */
/* ============================ */
bot.on('rem_dj', function(data) {

    if (config.consolelog) {
        console.log('Removed DJ: ', data);
    }

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

    var result = data.text.match(/^\@(.*?)( .*)?$/);
    if (result) {

        // break out the command and parameter if one exists
        var botName = result[1].trim().toLowerCase();
        var command = '';

        if (result.length == 3 && result[2]) {
            command = result[2].trim().toLowerCase();
        }

        if (config.botName.toLowerCase() == botName) {

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
                    } else {
                        bot.speak("/me looks at " + data.name + " with a confused look.");
                        pause(500);
                        bot.speak("Me not know what you said. Type @Uglee to see what me do.");
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
