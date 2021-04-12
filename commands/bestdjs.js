//Returns the three DJs with the most points logged in the songlist table
exports.name = '/bestdjs';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
    // SELECT username, upvotes FROM (SELECT djid, sum(up) AS upvotes FROM tt_bots.botty_Song WHERE `roomid` = '604131d63f4bfc001809d4a8' GROUP BY djid ORDER BY sum(up) DESC LIMIT 5) a INNER JOIN (SELECT * FROM (SELECT * FROM  tt_bots.botty_User ORDER BY lastseen DESC) as test GROUP BY roomid, userid, username) b ON a.djid = b.userid GROUP BY username, a.upvotes ORDER BY upvotes DESC LIMIT 5
    client.query('SELECT username, upvotes FROM (SELECT djid, sum(up) AS upvotes FROM ' + dbName + '.' + dbTablePrefix +
        'Song WHERE `roomid` = ? GROUP BY djid ORDER BY sum(up) DESC LIMIT 5) a INNER JOIN (SELECT * FROM (SELECT * FROM ' +
        dbName + '.' + dbTablePrefix + 'User ORDER BY lastseen DESC) as test GROUP BY roomid, userid, username) b' +
        ' ON a.djid = b.userid GROUP BY username, a.upvotes ORDER BY upvotes DESC LIMIT 5', [currentRoomId], function select(error, results, fields) {
            var response = 'The DJs with the most points accrued in this room: ';
            for (i in results) {
                response += results[i]['username'] + ': ' + results[i]['upvotes'] + ' points.  ';
            }
            Speak(response, "", source, userid);
        });
}