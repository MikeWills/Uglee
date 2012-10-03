exports.name = '/mostawesomed';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    client.query('SELECT CONCAT(song,\' by \',artist) AS TRACK, SUM(up) AS SUM FROM ' + dbName + '.' + dbTablePrefix + 'Song WHERE `roomid` = ? GROUP BY CONCAT(song,\' by \',artist) ORDER BY SUM ' + 'DESC LIMIT 3',[currentRoomId], function select(error, results, fields) {
        var response = 'The most awesomed songs I\'ve heard: ';
        for (i in results) {
            response += results[i]['TRACK'] + ': ' + results[i]['SUM'] + ' awesomes.  ';
        }
        Speak(response, "", source, userid);
    });

}