exports.name = '/boot';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
    IsMod(userid, function(isMod) {
        if (isMod) {
            //Get name and userid
            var givenname = data.text.substring(7);
            client.query('SELECT userid FROM (SELECT * FROM ' + dbName + '.' + dbTablePrefix + 'User WHERE username LIKE ?) a ORDER BY lastseen DESC', [givenname], function select(error, results, fields) {
                if (results != null && results.length > 0) {
                    Log(color("EVENT BOOT: ", "red") + givenname + ' (UID ' + results[0]['userid'] + ') has been booted by ' + AllUsers[userid].name + '.', "error");
                    bot.speak(givenname + ' (UID ' + results[0]['userid'] + ') has been booted by ' + AllUsers[userid].name + '.');
                    bot.boot(results[0]['userid'], 'When you can be good, you can come back.');
                }
            });
        }
    });
}