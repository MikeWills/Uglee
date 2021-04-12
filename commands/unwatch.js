exports.name = '/unwatch';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, userid, source) {
    IsMod(userid, function (isMod) {
        if (isMod) {
            //Get name and userid
            var givenname = data.text.substring(9);
            client.query('SELECT userid FROM ' + dbName + '.' + dbTablePrefix + 'User WHERE username LIKE ? limit 1', [givenname], function select(error, results, fields) {
                if (results.length > 0) {
                    removeFromWatchList(results[0]['userid'], givenname, data.name, userid);
                }
            });
        }
    });
}

function removeFromWatchList(userid, name, bannedby, requesteduser) {
    client.query('DELETE FROM ' + dbName + '.ALERT WHERE userid = ?', [userid], function (error, results, fields) {
        if (error == null) {
            bot.pm(name + ' has been removed from the watch list.', requesteduser);
        } else {
            console.log(error);
        }
    });
}