exports.name = '/mostsnagged';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    client.query('SELECT CONCAT(song,\' by \',artist) AS TRACK, sum(snags) AS SNAGS FROM ' + dbName + '.' + dbTablePrefix + 'Song WHERE `roomid` = ? and `song` <> "untitled" and `artist` <> "Unknown" GROUP BY CONCAT(song, \' by \', artist) ORDER BY SNAGS ' + 'DESC LIMIT 3', [currentRoomId], function select(error, results, fields) {
        var response = 'The songs I\'ve seen snagged the most: ';
        for (i in results) {
            response += results[i]['TRACK'] + ': ' + results[i]['SNAGS'] + ' snags.  ';
        }
        Speak(response, "", source, userid);
    });
}