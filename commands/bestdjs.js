//Returns the three DJs with the most points logged in the songlist table
exports.name = '/bestdjs';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    client.query('SELECT username, upvotes FROM (SELECT djid, sum(up) AS upvotes ' + 'FROM ' + dbName + '.' + dbTablePrefix + 
    			 'Song WHERE `roomid` = ? GROUP BY djid ORDER BY sum(up) DESC LIMIT 3) a INNER JOIN (SELECT * FROM (SELECT * FROM ' + 
    			 dbName + '.' + dbTablePrefix + 'User WHERE `roomid` = ? ORDER BY lastseen DESC) as test GROUP BY userid)' + 
    			 ' b ON a.djid = b.userid ORDER BY upvotes DESC LIMIT 3', [currentRoomId, currentRoomId] , function select(error, results, fields) {
        var response = 'The DJs with the most points accrued in this room: ';
        for (i in results) {
            response += results[i]['username'] + ': ' + results[i]['upvotes'] + ' points.  ';
        }
        Speak(response);
    });
}