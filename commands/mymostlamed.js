exports.name = '/mymostlamed';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {

    client.query('SELECT CONCAT(song,\' by \',artist) AS TRACK, SUM(down) AS SUM FROM ' + dbName + '.' + dbTablePrefix + 'Song WHERE `roomid` = ? and `song` <> "untitled" and `artist` <> "Unknown" AND (djid = \'' + userid + '\')' + ' GROUP BY CONCAT(song,\' by \',artist) ORDER BY SUM DESC LIMIT 3', [currentRoomId], function select(error, results, fields) {
        var response = 'The most hated songs I\'ve heard from you: ';
        for (i in results) {
            response += results[i]['TRACK'] + ': ' + results[i]['SUM'] + ' lames.  ';
        }
        Speak(response, "", source, userid);
    });
}