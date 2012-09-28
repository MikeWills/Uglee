exports.name = '/mymostplayed';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    client.query('SELECT CONCAT(song,\' by \',artist) AS TRACK, COUNT(*) AS COUNT FROM ' + dbName + '.' + dbTablePrefix + 'Song WHERE (djid = \'' + data.userid + '\')' + ' GROUP BY CONCAT(song,\' by \',artist) ORDER BY COUNT(*) DESC LIMIT 3', function select(error, results, fields) {
        var response = 'The songs I\'ve heard the most from you: ';
        for (i in results) {
            response += results[i]['TRACK'] + ': ' + results[i]['COUNT'] + ' plays.  ';
        }
        Speak(response);
    });
}