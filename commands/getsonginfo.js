exports.name = '/aboutsong';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
  if(lastfmAPI != null) {
    var query = data.text.substring(10);
    var components = query.split('-');
    if(components.length !== 2) {
      lastfm.getSessionKey(function(result) {
        console.log("session key = " + result.session_key);
        if(result.success) {
          lastfm.getTrackInfo({
            track: currentsong.song,
            artist: currentsong.artist,
            callback: function(result) {
              console.log("in callback, finished: ", result);
            }
          });
        }
      });
    } else {
      lastfm.getSessionKey(function(result) {
        console.log("session key = " + result.session_key);
        if(result.success) {
          lastfm.getTrackInfo({
            track: components[1],
            artist: components[0],
            callback: function(result) {
              console.log("in callback, finished: ", result);
            }
          });
        }
      });
    }
  }
}