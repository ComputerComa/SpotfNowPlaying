require("dotenv").config();
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
let new_song = false
const PROTOCOL = process.env.PROTOCOL
const PORT = process.env.PORT
const debug = process.env.debug
let song_history = [" "];
app.listen(80, () => {
  console.log("App listening on http://localhost:80");
});
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
/* ++++++++++++++++++++++++++ */
/* +++ USER AUTHORIZATION +++ */
/* ++++++++++++++++++++++++++ */
app.get("/", function (req, res) {
  res.render("index");
});

app.get("/login", function (req, res) {
  const scopes = "user-read-currently-playing";
  const redirect_uri = PROTOCOL + CALLBACKURL + PORT + "/callback";

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
app.get("/reload",function(req,res){
    res.json({reload : `${new_song}`})
})
app.get("/callback", function (req, res) {
  const auth_code = req.query.code;
  const redirect_uri = PROTOCOL + CALLBACKURL + PORT + "/callback";
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
      const artist = trackInformation.data.item.artists[0].name;
      const song = trackInformation.data.item.name;
      const album = trackInformation.data.item.album.name;
      const progress_ms = trackInformation.data.progress_ms;
      const duration_ms = trackInformation.data.item.duration_ms;
      const image_url = trackInformation.data.item.album.images[1].url;
      const progress_time = millisToMinutesAndSeconds(progress_ms);
      const duration_time = millisToMinutesAndSeconds(duration_ms);
      let last_song = song_history[song_history.length - 1];
       new_song = song != last_song;
      if (song_history.length > 10) {
        song_history.shift();
      }
      if (new_song) {
        song_history.push(song.toString());
        if (SENDWEBHOOKS == "true") {
          updateWebhook(artist, song, album, duration_time, image_url);
        }
      }
      
      const text = `${progress_time} / ${duration_time} - ${song} by ${artist} - is new song -> ${new_song} - History length : ${song_history.length}`;
      const songText = `<p id="song"> Song ${song} </p>`;
      const albumText = `<p id="album> Album ${album} </p>`;
      const artistText = `<p id="artist> Artist ${artist} </p>`;
      const durationText = `<p id="duration"> Duration ${duration_time} </p>`;
      const imageLink = `<img src="${image_url}" id="albumart"> </img>`
      const newSongText = `<p hidden> ${new_song} </p>`
      const spacer = "<br>"
      const finalText = songText + spacer + albumText + spacer + artistText + spacer + durationText + spacer + newSongText  + spacer + imageLink
      fs.writeFileSync("./output/song.txt", text);
      fs.writeFileSync("./views/body.ejs", finalText);
      requestsMade++;
      if(debug == "true"){
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
    console.log(`Open "http://${CALLBACKURL}:80/login in your browser.`);
    isRequesting = false;
  }
}

/* +++++++++++++++++++++++ */
/* +++ START MAIN LOOP +++ */
/* +++++++++++++++++++++++ */
setupRefreshTokenTxt(() => {
  setInterval(main, 5000);
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
function refreshPage(){
    axios({
        method: 'get',
        url: PROTOCOL + CALLBACKURL + PORT + "/#refresh"
    })
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
