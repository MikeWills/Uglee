exports.name = '/worstdjs';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    client.query('SELECT username, downvotes FROM (SELECT djid, sum(down) AS downvotes ' + 'FROM ' + dbName + '.' + dbTablePrefix + 
    	'Song WHERE `roomid` = ? GROUP BY djid ORDER BY sum(down) DESC LIMIT 3) a INNER JOIN (SELECT * FROM (SELECT * FROM ' + 
    		dbName + '.' + dbTablePrefix + 'User ORDER BY lastseen DESC) as test GROUP BY userid)' + 
    ' b ON a.djid = b.userid ORDER BY downvotes DESC LIMIT 3',[currentRoomId], function select(error, results, fields) {
        var response = 'The DJs with the most lames accrued in this room: ';
        for (i in results) {
            response += results[i]['username'] + ': ' + results[i]['downvotes'] + ' lames.  ';
        }
        Speak(response, "", source, userid);
    });

}