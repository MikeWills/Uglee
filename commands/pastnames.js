exports.name = '/pastnames';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
    Log("Name: " + data.text.substring(11));
    client.query('SELECT username FROM ' + dbName + '.' + dbTablePrefix + 'User  WHERE `roomid` = ? AND (userid like (SELECT ' + 'userid FROM ' + dbName + '.' + dbTablePrefix + 'User  WHERE `roomid` = ? AND username LIKE ? limit 1)) ORDER BY RAND()', [currentRoomId, currentRoomId, data.text.substring(11)], function select(error, results, fields) {
        var response = '';
        if (results != null && results.length > 6) {
            response = 'That user has gone by ' + results.length + ' names, including: ';
            for (i = 0; i < 6; i++) {
                response += results[i]['username'] + ', ';
            }
        } else {
            response = 'Names I\'ve seen that user go by: ';
            for (i in results) {
                response += results[i]['username'] + ', ';
            }
        }
        Speak(response.substring(0, response.length - 2), "", source, userid);
    });
}