exports.name = 'reloadcommands';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
    if (source === "pm") {
    var newCommands = new Array();
    var j = 0;
    try {
        var filenames = fs.readdirSync('./commands');
        for (i in filenames) {
            var command = require('./' + filenames[i]);
            newCommands.push({name: command.name, handler: command.handler, hidden: command.hidden,
                enabled: command.enabled, matchStart: command.matchStart});
            j++;
        }
    } catch (e) {
        TellUser(userid, 'Command reload failed: ' + e);
    }
    commands = newCommands;
    
    TellUser(userid, j + ' commands loaded.');
    }
}