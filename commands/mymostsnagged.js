exports.name = '/mymostsnagged';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    client.query('SELECT CONCAT(song,\' by \',artist) AS TRACK, SUM(snags) AS SUM FROM ' + dbName + '.' + dbTablePrefix + 'Song WHERE `roomid` = ? AND (djid = \'' + data.userid + '\')' + ' GROUP BY CONCAT(song,\' by \',artist) ORDER BY SUM DESC LIMIT 3', [currentRoomId], function select(error, results, fields) {
        var response = 'The songs I\'ve seen snagged the most from you: ';
        for (i in results) {
            response += results[i]['TRACK'] + ': ' + results[i]['SUM'] + ' snags.  ';
        }
        Speak(response);
    });
}