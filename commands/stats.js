//Returns the room's play count, total awesomes/lames, and average awesomes/lames
//in the room
exports.name = '/stats';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data) {
    client.query('SELECT @uniquesongs := count(*) FROM (select * from ' + dbName + '.' + dbTablePrefix + 'Song WHERE `roomid` = ? group by concat(song, \' by \', artist)) as songtbl', [currentRoomId]);
    client.query('SELECT @numdjs := count(*) FROM (select * from ' + dbName + '.' + dbTablePrefix + 'Song WHERE `roomid` = ? group by djid) as djtable', [currentRoomId]);
    client.query('SELECT @uniquesongs as uniquesongs, @numdjs as numdjs, ' + 'count(*) as total, sum(up) as up, avg(up) as avgup, ' + 'sum(down) as down, avg(down) as avgdown FROM ' + dbName + '.' + dbTablePrefix + 'Song WHERE `roomid` = ?',[currentRoomId], function select(error, results, fields) {
        var response = ('In this room, ' + results[0]['total'] + ' songs (' + results[0]['uniquesongs'] + ' unique) have been played by ' + results[0]['numdjs'] + ' DJs with a total of ' + results[0]['up'] + ' awesomes and ' + results[0]['down'] + ' lames (avg +' + new Number(results[0]['avgup']).toFixed(1) + '/-' + new Number(results[0]['avgdown']).toFixed(1) + ').');
        Speak(response);
    });
}