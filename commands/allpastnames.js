exports.name = '/allpastnames';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, userid, source) {
    if (source != 'pm') {
        Speak('That is a PM-only command.');
    } else {
        Log("Past Names: " + data.text.substring(14));
        client.query('SELECT username FROM ' + dbName + '.' + dbTablePrefix + 'User WHERE (userid like (SELECT ' + 'userid FROM ' + dbName + '.' + dbTablePrefix + 'User WHERE username LIKE ? limit 1)) ORDER BY RAND()', [data.text.substring(14)], function select(error, results, fields) {
            var response = '';
            response = 'That user has gone by ' + results.length + ' names: ';
            for (i in results) {
                response += results[i]['username'] + ', ';
            }
            Speak(response.substring(0, response.length - 2), "", source, userid);
        });
    }
}