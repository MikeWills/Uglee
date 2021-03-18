exports.name = '/mod';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
    IsMod(userid, function(isMod) {
      if (isMod) {

        var setVal = "";

        if (data.text.substring(5) == "on") {
          setVal = "true";
          Speak("I am now moderating this room!")
        } else if (data.text.substring(5) == "off") {
          setVal = "false";
          Speak("I am no longer moderating this room!")
        } else {
          return;
        }

        SetValue("isModerating", setVal);
      }
    });
}