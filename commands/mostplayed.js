exports.name = '/mostplayed';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    client.query('SELECT CONCAT(song,\' by \',artist) AS TRACK, COUNT(*) AS COUNT FROM ' + dbName + '.' + dbTablePrefix + 'Song WHERE `roomid` = ? GROUP BY CONCAT(song,\' by \',artist) ORDER BY COUNT(*) ' + 'DESC LIMIT 3', [currentRoomId], function select(error, results, fields) {
        var response = 'The songs I\'ve heard the most: ';
        for (i in results) {
            response += results[i]['TRACK'] + ': ' + results[i]['COUNT'] + ' plays.  ';
        }
        Speak(response, "", source, userid);
    });
}