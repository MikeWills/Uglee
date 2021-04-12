exports.name = '/fan';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, userid, source) {
    IsMod(userid, function (isMod) {
        if (isMod) {
            //Get name and userid
            var givenname = data.text.substring(6);
            client.query('SELECT userid FROM (SELECT * FROM ' + dbName + '.' + dbTablePrefix + 'User WHERE username LIKE ?) a ORDER BY lastseen DESC', [givenname], function select(error, results, fields) {
                if (results != null && results.length > 0) {
                    bot.becomeFan(results[0]['userid']);
                }
            });
        }
    });
}