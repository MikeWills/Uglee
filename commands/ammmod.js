exports.name = '/ammmod';
exports.hidden = true;
exports.enabled = true;
exports.matchStart = false;
exports.handler = function(data, userid, source) {
  if (currentRoom === "4ea390ac14169c0cc3caa078"){
  IsMod(userid, function(isMod) {
		if(isMod) {

      var setVal = "";

      if (data.text.substring(8) == "on"){
        setVal = "true";
  		  Speak("I am now moderating this room!")
      } else if (data.text.substring(8) == "off"){
        setVal = "false";
    	  Speak("I am no longer moderating this room!")
      } else { return; }

			SetValue("isModerating", setVal);
      SetValue("monitorHungSong", setVal);
      SetValue("monitorAfk", setVal);
      SetValue("autobop", setVal);
		}
	});
  }
}
