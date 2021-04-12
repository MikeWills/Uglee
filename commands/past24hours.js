//Returns the three DJs with the most points in the last 24 hours
exports.name = '/past24hours';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
    client.query('SELECT username, upvotes FROM (SELECT djid, sum(up) as upvotes ' + 'FROM ' + dbName + '.' + dbTablePrefix +
        'Song  WHERE `roomid` = ? AND started > DATE_SUB(NOW(), INTERVAL ' + '1 DAY) GROUP BY djid) a INNER JOIN (SELECT * FROM (SELECT * FROM ' +
        dbName + '.' + dbTablePrefix + 'User ORDER BY lastseen DESC) as test GROUP BY userid) b ON a.djid = b.userid' +
        ' ORDER BY upvotes DESC LIMIT 5', [currentRoomId], function select(error, results, fields) {
            var response = 'DJs with the most points in the last 24 hours: ';
            for (i in results) {
                response += results[i]['username'] + ': ' + results[i]['upvotes'] + ' awesomes.  ';
            }
            Speak(response, "", source, userid);

            /*if (source !== "pm"){
                Speak("Don't masterbate in public! PM me privately instead!");
            }*/
        });
}