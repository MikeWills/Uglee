exports.name = '/mostnames';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
    client.query('SELECT COUNT(u1.userid) AS name_count, (SELECT u2.username FROM ' + dbName + '.' + dbTablePrefix + 'User u2 WHERE `roomid` = ? AND u1.userid = u2.userid ORDER BY lastseen LIMIT 1) AS current_username ' + ' FROM ' + dbName + '.' + dbTablePrefix + 'User u1 WHERE `roomid` = ? GROUP BY userid ORDER BY COUNT(userid) DESC LIMIT 5', [currentRoomId, currentRoomId], function select(error, results, fields) {
        var response = 'The users with the most name changes: ';
        for (i in results) {
            response += results[i]['current_username'] + ': ' + results[i]['name_count'] + ' name changes.  ';
        }
        Speak(response);
    });
}