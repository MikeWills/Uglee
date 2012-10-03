//Returns the three song plays with the most awesomes in the songlist table
exports.name = '/bestplays';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	client.query('SELECT CONCAT(song,\' by \',artist) AS TRACK, UP FROM ' + dbName + '.' + dbTablePrefix + 'Song WHERE `roomid` = ? ORDER BY UP DESC LIMIT 3', [currentRoomId], function select(error, results, fields) {
		var response = 'The song plays I\'ve heard with the most awesomes: ';
		for (i in results) {
			response += results[i]['TRACK'] + ': ' + results[i]['UP'] + ' awesomes.  ';
		}
		Speak(response, "", source, userid);
	});
}