exports.name = '/myhearts';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
	client.query('SELECT SUM(snags) AS SUM FROM ' + dbName + '.' + dbTablePrefix + 'Song WHERE (djid = \'' + data.userid + '\')', function select(error, results, fields) {
		var response = 'You have ' + results[0]['SUM'] + ' hearts total!';
		Speak(response);
	});
}