exports.name = '/ban';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
    IsMod(userid, function(isMod) {
        if (isMod) {
            //Get name and userid
            var givenname = data.text.substring(9);
            client.query('SELECT userid FROM (SELECT * FROM ' + dbName + '.' + dbTablePrefix + 'User WHERE username LIKE ?) a ORDER BY lastseen DESC', [givenname], function select(error, results, fields) {
                if (results != null && results.length > 0) {
                    addToBanList(results[0]['userid'], givenname, data.name);
                }
            });
        }
    });
}

function addToBanList(userid, name, bannedby) {
    client.query('INSERT INTO ' + dbName + '.BANNED SET userid = ?, banned_by = ?, timestamp = NOW()', [userid, bannedby]);
    Log(color("EVENT BOOT: ", "red") + name + ' (UID ' + userid + ') has been banned by ' + bannedby + '.');
    bot.speak(name + ' (UID ' + userid + ') has been banned by ' + bannedby + '.');
    bot.boot(userid, 'You have been banned by ' + bannedby + '.');
}