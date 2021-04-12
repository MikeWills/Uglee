exports.name = '/mod';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function (data, userid, source) {
  IsMod(userid, function (isMod) {
    if (isMod) {

      var setVal = "";

      if (data.text.substring(5) == "on") {
        setVal = "true";
        Speak("I'm not bossy, I'm the boss.")
      } else if (data.text.substring(5) == "off") {
        setVal = "false";
        Speak("Cancel my subscription because I am done with your issues.")
      } else {
        return;
      }

      SetValue("isModerating", setVal);
    }
  });
}