exports.name = '/aboutsong';
exports.hidden = false;
exports.enabled = true;
exports.matchStart = true;
exports.handler = function(data, userid, source) {
  if(lastfmApiKey != null) {
    var query = data.text.substring(10);
    Log("Query: " + query);
    var components = query.split('-');
    Log("Components: " + components);
    if(components.length === 2) {
      getLastFmData(components[0], components[1], function(text) {
        Speak(text, '', source, userid)
      });
    } else {
      getLastFmData(currentsong.artist, currentsong.song, function(text) {
        Speak(text, '', source, userid)
      });
    }
  }
}

function getLastFmData(artist, song, callback) {
  var request = lastfm.request("track.getInfo", {
    artist: artist,
    track: song,
    handlers: {
      success: function(data) {
        console.log("Success: " + JSON.stringify(data));
        var text = data.track.name + ' by ' + data.track.artist.name;
        if(data.track.album !== undefined) {
          text += ' was on the "' + data.track.album.title + '" album. ';
        }
        var request2 = lastfm.request("album.getInfo", {
          artist: artist,
          album: data.track.album.title,
          mbid: data.track.album.mbid,
          handlers: {
            success: function(albumData) {
              console.log("Success: " + JSON.stringify(albumData));
              if(albumData.album.releasedate !== undefined && albumData.album.releasedate !== " ") {
                text += 'It was released on ' + Date.parse(albumData.album.releasedate).toString("d") + '.';
              }
              text += ' More information can be found at ' + data.track.url;
              callback(text);
            },
            error: function(albumError) {
              console.log("Error: " + albumError.message);
              callback(text);
            }
          }
        });
      },
      error: function(error) {
        console.log("Error: " + error.message);
        callback(text);
      }
    }
  });
}