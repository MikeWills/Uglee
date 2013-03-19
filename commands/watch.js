exports.name = '/watch';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
    IsMod(userid, function(isMod) {
        if (isMod) {
            //Get name and userid
            var strings = data.text.substring(7).split(" | ");
            client.query('SELECT userid FROM (SELECT * FROM ' + dbName + '.' + dbTablePrefix + 'User WHERE username LIKE ?) a ORDER BY lastseen DESC', [strings[0]], function select(error, results, fields) {
                if (results != null && results.length > 0) {
                    addToWatchList(results[0]['userid'], strings[0], AllUsers[userid].name, userid, strings[1]);
                }
            });
        }
    });
}

function addToWatchList(userid, name, bannedby, byuserid, reason) {
    client.query('INSERT INTO ' + dbName + '.ALERT SET `userid` = ?, `byUserid` = ?, `byName` = ?, `reason` = ?, `dateTimeStamp` = NOW()', [userid, byuserid, bannedby, reason]);
    bot.pm(name + " has been added to the list.", byuserid)
}