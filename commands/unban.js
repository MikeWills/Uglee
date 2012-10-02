exports.name = '/unbanuser';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
    IsMod(userid, function(isMod) {
        if (isMod) {
            //Get name and userid
            var givenname = data.text.substring(11);
            client.query('SELECT userid FROM ' + dbName + '.' + dbTablePrefix + 'User WHERE username LIKE ? limit 1', [givenname], function select(error, results, fields) {
                if (results.length > 0) {
                    removeFromBanList(results[0]['userid'], givenname, data.name);
                }
            });
        }
    });
}

function removeFromBanList(userid, name, bannedby) {
    client.query('DELETE FROM ' + dbName + '.BANNED WHERE userid = ?', [userid], function(error, results, fields) {
        if (error == null) {
            bot.speak(name + ' has been unbanned.');
        } else {
            console.log(error);
        }
    });
}