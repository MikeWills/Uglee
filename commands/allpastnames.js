exports.name = 'allpastnames';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
    if (data.source != 'pm') {
        Speak('That is a PM-only command.');
    } else {
        client.query('SELECT username FROM ' + dbName + '.' + dbTablePrefix + 'User WHERE (userid like (SELECT ' + 'userid FROM ' + dbName + '.' + dbTablePrefix + 'User WHERE username LIKE ? limit 1)) ORDER BY RAND()', [data.text.substring(13)], function select(error, results, fields) {
            var response = '';
            response = 'That user has gone by ' + results.length + ' names: ';
            for (i in results) {
                response += results[i]['username'] + ', ';
            }
            TellUser(userid, response.substring(0, response.length - 2));
        });
    }
}