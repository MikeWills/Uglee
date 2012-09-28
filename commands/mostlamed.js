exports.name = '/mostlamed';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    client.query('SELECT CONCAT(song,\' by \',artist) AS TRACK, SUM(down) AS SUM FROM ' + dbName + '.' + dbTablePrefix + 'Song GROUP BY CONCAT(song,\' by \',artist) ORDER BY SUM ' + 'DESC LIMIT 3', function select(error, results, fields) {
        var response = 'The most lamed songs I\'ve heard: ';
        for (i in results) {
            response += results[i]['TRACK'] + ': ' + results[i]['SUM'] + ' lames.  ';
        }
        Speak(response);
    });

}