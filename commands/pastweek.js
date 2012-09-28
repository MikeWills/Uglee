//Returns the five DJs with the most points in the last week
exports.name = '/pastweek';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    client.query('SELECT username, upvotes FROM (SELECT djid, sum(up) as upvotes ' + 'FROM ' + dbName + '.' + dbTablePrefix + 'Song WHERE started > DATE_SUB(NOW(), INTERVAL ' + '1 WEEK) GROUP BY djid) a INNER JOIN (SELECT * FROM (SELECT * FROM ' + dbName + '.' + dbTablePrefix + 'User ORDER BY lastseen DESC) as test GROUP BY userid) b ON a.djid = b.userid' + ' ORDER BY upvotes DESC LIMIT 5', function select(error, results, fields) {
        var response = 'DJs with the most points in the last week: ';
        for (i in results) {
            response += results[i]['username'] + ': ' + results[i]['upvotes'] + '▲. ';
        }
        Speak(response);
    });

}