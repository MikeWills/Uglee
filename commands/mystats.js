exports.name = '/mystats';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data, userid, source) {
    //These two statements gets the user's rank (by awesomes) and sets it to @rank
    client.query('SET @rownum := 0');
    client.query('SELECT @rank := rank FROM (SELECT @rownum := @rownum + 1 AS ' + 'rank, djid, POINTS FROM (SELECT djid, sum(up) as POINTS from ' + dbName + '.' + dbTablePrefix + 'Song WHERE `roomid` = ? group by djid order by sum(up) desc) as test) as rank where ' + 'djid like \'' + userid + '\'', [currentRoomId]);
    //This statement grabs the rank from the previous query, and gets the total songs
    //played, total awesomes, lames, and averages
    client.query('SELECT @rank as rank, count(*) as total, sum(up) as up, avg(up) as avgup, ' + 'sum(down) as down, avg(down) as avgdown ' + 'FROM ' + dbName + '.' + dbTablePrefix + 'Song  WHERE `roomid` = ? AND `djid` LIKE \'' + userid + '\'', [currentRoomId], function select(error, results, fields) {
        var response = (data.name + ', you have played ' + results[0]['total'] + ' songs in this room with a total of ' + results[0]['up'] + ' awesomes and ' + results[0]['down'] + ' lames (avg +' + new Number(results[0]['avgup']).toFixed(1) + '/-' + new Number(results[0]['avgdown']).toFixed(1) + ') (Rank: ' + results[0]['rank'] + ')');
        Speak(response, "", source, userid);
    });
}