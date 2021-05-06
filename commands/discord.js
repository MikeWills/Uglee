//Removes the user from the stage
exports.name = '/discord';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function (data) {
    Speak(global.discord);
}