exports.name = '/listbans';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
    client.query('SELECT banned_by, DATE_FORMAT(timestamp, ' + '\'%c/%d/%y\') AS date, username FROM (SELECT * FROM ' + dbName + '.BANNED) a INNER JOIN (SELECT * FROM (SELECT *' + ' FROM ' + dbName + '.' + dbTablePrefix + 'User ORDER BY lastseen DESC) as test GROUP BY ' + 'userid) b ON a.userid = b.userid', function cb(error, results, fields) {
        var rp = 'Banned users: ';
        for (i in results) {
            rp += results[i]['username'] + ' (banned ' + results[i]['date'] + ' by ' + results[i]['banned_by'] + '), ';
        }
        Speak(rp.substring(0, rp.length - 2));
    });
}