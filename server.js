require("dotenv").config();
const { getData, getPreview, getTracks, getDetails } =
  require("spotify-url-info")(fetch);
const path = require("node:path");
const { Webhook, MessageBuilder } = require("discord-webhook-node");
const axios = require("axios");
const express = require("express");
const fs = require("fs");
const app = express();
const hook = new Webhook(process.env.DISCORD_WEBHOOK_URL);
hook.setUsername("Now Playing");
const buff = Buffer.from(
  process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
);
const base64data = buff.toString("base64");
const DISCORD_USERNAME = process.env.DISCORD_USERNAME;
const CALLBACKURL = process.env.CALLBACK_URL_IP;
const SENDWEBHOOKS = process.env.SEND_WEBHOOKS;
let new_song = false;
//const PORT = process.env.PORT
const debug = process.env.debug;
const https = require("https");
const http = require("http");
const { Colors } = require("discord.js");
const use_https = process.env.USE_HTTPS;
let currentSpotifyURL = "";
PROTOCOL = "http://";
PORT = 80;
let redirect_uri = "";
let song_history = [" "];
let colorPrimary = "#081c53";
let colorSecondary = "#f71e29";

class albumColors {
  constructor(primary, secondary) {
    (this.primaryColor = primary), (this.secondaryColor = secondary);
  }
}

class mediaInfo {
  constructor(
    artist,
    song,
    album,
    duration_time,
    colorPrimary,
    colorSecondary,
    imageURL
  ) {
    this.artist = artist;
    this.song = song;
    this.album = album;
    this.duration = duration_time;
    this.colorPrimary = colorPrimary;
    this.colorSecondary = colorSecondary;
    this.imageURL = imageURL;
  }
}
let nowPlayingMediaInfo = new mediaInfo(
  "artist",
  "song",
  "album",
  "time",
  "colorprimary",
  "colorsecondary",
  "imageURL"
);

//app.listen(PORT, () => {
//  console.log("App listening on http://localhost:80");
//});

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

if (use_https == "true") {
  PROTOCOL = "https://";
  PORT = "443";
  const certPath = process.env.CERT_PATH;
  const keyPath = process.env.KEYFILE_Path;
  var checkURL = `"${PROTOCOL}${CALLBACKURL}/reload"`;
  var dataURL = `"${PROTOCOL}${CALLBACKURL}/data"`;
  var localData = `localStorage.setItem("checkURL", ${checkURL}) \n localStorage.setItem("dataURL", ${dataURL}) `;
  redirect_uri = `https://${CALLBACKURL}/callback`;
  fs.writeFileSync("public/js/callback.js", localData);
  const httpsServer = https.createServer(
    {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    },
    app
  );
  httpsServer.listen(443, () => {
    console.log("HTTPS Server running on port 443");
  });
} else {
  console.info("HTTPS disabled , serving on http only!");
  var checkURL = `"${PROTOCOL}${CALLBACKURL}:80/reload"`;
  var dataURL = `"${PROTOCOL}${CALLBACKURL}:80/data"`;
  console.info(dataURL);
  var localData = `localStorage.setItem("checkURL", ${checkURL}) \n localStorage.setItem("dataURL", ${dataURL})`;
  fs.writeFileSync("public/js/callback.js", localData);
  redirect_uri = `http://${CALLBACKURL}/callback`;
}

const httpServer = http.createServer(app);
httpServer.listen(80, () => {
  console.log("HTTP Server running on port 80");
});

/* ++++++++++++++++++++++++++ */
/* +++ USER AUTHORIZATION +++ */
/* ++++++++++++++++++++++++++ */
app.get("/", function (req, res) {
  res.render("index");
});

app.get("/login", function (req, res) {
  const scopes = "user-read-currently-playing";
  res.redirect(
    "https://accounts.spotify.com/authorize" +
      "?response_type=code" +
      "&client_id=" +
      process.env.SPOTIFY_CLIENT_ID +
      "&scope=" +
      encodeURIComponent(scopes) +
      "&redirect_uri=" +
      encodeURIComponent(redirect_uri)
  );
});

app.get("/reload", function (req, res) {
  res.json({
    reload: `${new_song}`,
  });
});

app.get("/data", function (req, res) {
  res.json(nowPlayingMediaInfo)
});

app.post("/ack",function(req,res){
  new_song = false
  res.status(200)
})

app.get("/callback", function (req, res) {
  const auth_code = req.query.code;
  const options = {
    url: "https://accounts.spotify.com/api/token",
    method: "post",
    headers: {
      authorization: `Basic ${base64data}`,
      contentType: "application/x-www-form-urlencoded",
    },
    params: {
      grant_type: "authorization_code",
      code: auth_code,
      redirect_uri: redirect_uri,
    },
  };

  axios(options)
    .then((r) => {
      const refresh_token = r.data.refresh_token;
      fs.writeFileSync("./token/refresh_token.txt", refresh_token);
      return res.end("Success ! You can close this tab now !");
    })
    .catch((err) => {
      console.log(err.message);
    });
});

/* +++++++++++++++++ */
/* +++ MAIN LOOP +++ */
/* +++++++++++++++++ */

let isRequesting = false;
let requestsMade = 0;
async function main() {
  if (isRequesting) {
    return;
  }
  isRequesting = true;

  // GET SAVED REFRESH_TOKEN
  const refresh_token = fs.readFileSync("./token/refresh_token.txt", "utf8");
  if (refresh_token && refresh_token !== "") {
    // GET NEW ACCESS_TOKEN
    const options1 = {
      url: "https://accounts.spotify.com/api/token",
      method: "post",
      headers: {
        authorization: `Basic ${base64data}`,
        contentType: "application/x-www-form-urlencoded",
      },
      params: {
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      },
    };

    let access_token = "";
    try {
      const auth = await axios(options1);
      access_token = auth.data.access_token;
    } catch (e) {
      console.error("refresh_token request error");
      console.error(e.message);
    }

    // REQUEST CURRENTLY PLAYING SONG DATA
    const options2 = {
      url: "https://api.spotify.com/v1/me/player/currently-playing",
      method: "get",
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    };

    let trackInformation = {};
    try {
      trackInformation = await axios(options2);
    } catch (e) {
      console.error("currently-playing request error");
      console.error(e.message);
    }

    if (trackInformation.data) {
      // WRITE TRACK INFORMATIONS TO FILE
      let artist = trackInformation.data.item.artists[0].name;
      let song = trackInformation.data.item.name;
      let album = trackInformation.data.item.album.name;
      let progress_ms = trackInformation.data.progress_ms;
      let duration_ms = trackInformation.data.item.duration_ms;
      let image_url = trackInformation.data.item.album.images[1].url;
      let progress_time = millisToMinutesAndSeconds(progress_ms);
      let duration_time = millisToMinutesAndSeconds(duration_ms);
      let currentSpotifyURL = trackInformation.data.item.external_urls.spotify;
      let last_song = song_history[song_history.length - 1];
      new_song = song != last_song;
      if (song_history.length > 10) {
        song_history.shift();
      }
      if (new_song) {
        nowPlayingMediaInfo.artist = artist;
        nowPlayingMediaInfo.album = album
        nowPlayingMediaInfo.song = song;
        nowPlayingMediaInfo.duration = duration_time;
        nowPlayingMediaInfo.imageURL = image_url;
        song_colors = new albumColors("#000000", "#FFFFFF");
        song_history.push(song.toString());
        await get_album_colors(currentSpotifyURL).then((colors) => {
        nowPlayingMediaInfo.colorPrimary = colors.primaryColor
        nowPlayingMediaInfo.colorSecondary = colors.secondaryColor
         //console.log(colors);
        });

        if (SENDWEBHOOKS == "true") {
          updateWebhook(artist, song, album, duration_time, image_url);
        }
      }

      const text = `${progress_time} / ${duration_time} - ${song} by ${artist} - is new song -> ${new_song} - History length : ${song_history.length}`;

      fs.writeFileSync("./output/song.txt", text);
      requestsMade++;
      if (debug == "true") {
        console.clear();
        console.table(song_history);
        console.log("Currently playing:");
        console.log(text);
        console.log("Requests Made:", requestsMade);
      }
      isRequesting = false;
    } else {
      console.clear();
      console.log("Looks like you are not playing anyting at the moment.");
      isRequesting = false;
    }
  } else {
    console.clear();
    console.log("Please authorize first.");
    console.log(
      `Open "${PROTOCOL}${CALLBACKURL}:${PORT}/login in your browser.`
    );
    isRequesting = false;
  }
}

/* +++++++++++++++++++++++ */
/* +++ START MAIN LOOP +++ */
/* +++++++++++++++++++++++ */
setupRefreshTokenTxt(() => {
  setInterval(main, 2000);
});

/* ++++++++++++++++++++++++ */
/* +++ HELPER FUNCTIONS +++ */
/* ++++++++++++++++++++++++ */

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function updateWebhook(artist, song, album, duration, imageURL) {
  //Stringify the embeds using JSON.stringify()
  const embed = new MessageBuilder()
    .setTitle("Now playing for " + DISCORD_USERNAME)
    .addField("Artist", artist)
    .addField("Song", song)
    .addField("Album", album)
    .addField("Duration", duration)
    .setImage(imageURL)
    .setTimestamp();

  hook.send(embed);
}
async function get_album_colors(url) {
  let colors = new albumColors("3fff", "4fff");
  await getDetails(url).then((data) => {
    colorPrimary = data.tracks[0].coverArt.extractedColors.colorDark.hex;
    colorSecondary = data.tracks[0].coverArt.extractedColors.colorLight.hex;
    //console.log(`Dark: ${colorPrimary} , Light: ${colorSecondary}`);
    colors.primaryColor = colorPrimary;
    colors.secondaryColor = colorSecondary;
  });
  return colors;
}

function setupRefreshTokenTxt(next) {
  fs.open("./token/refresh_token.txt", "r", (err, fd) => {
    if (err) {
      if (err.code === "ENOENT") {
        fs.writeFileSync("./token/refresh_token.txt", "");
        return next();
      }
      throw err;
    }
    return next();
  });
}
