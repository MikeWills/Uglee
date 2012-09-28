exports.name = '/mypast24hours';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    client.query('SELECT count(*) AS songs, sum(up) AS upvotes, sum(down) AS downvotes FROM ' + dbName + '.' + dbTablePrefix + 'Song WHERE started > DATE_SUB(NOW(), ' + 'INTERVAL 1 DAY) AND djid LIKE \'' + data.userid + '\'', function select(error, results, fields) {
        var response = data.name + ', you have played ' + results[0]['songs'] + ' songs in the past 24 hours, with ' + results[0]['upvotes'] + ' upvotes and ' + results[0]['downvotes'] + ' downvotes.';
        Speak(response);
    });

}