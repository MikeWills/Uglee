exports.name = '/listbans';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, userid, source) {
    //client.query('SELECT banned_by, DATE_FORMAT(timestamp, ' + '\'%c/%d/%y\') AS date, username FROM ' + dbName + '.BANNED) b INNER JOIN ' + dbName + '.' + dbTablePrefix + ' u on u.userid = b.userid', function cb(error, results, fields) {
        client.query('SELECT banned_by, timestamp, username FROM ' + dbName + '.BANNED b INNER JOIN ' + dbName + '.' + dbTablePrefix + 'User u on u.userid = b.userid', function cb(error, results, fields) {
            Speak('Banned users: ');
        for (i in results) {
            Speak(results[i]['username'] + ' (banned on ' + results[i]['timestamp'] + ' by ' + results[i]['banned_by'] + '), ');
        }
    });
}

// SELECT banned_by, timestamp, username FROM tt_bots.BANNED b INNER JOIN tt_bots.botty_User u on u.userid = b.userid