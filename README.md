# 🎧 Spotify : Current Track 

![NodeJS and Spotify Logo](https://image.prntscr.com/image/FHtaiEkPTjalgfKIupVZWg.png)

##### What does it do
Automatically fetches "currently playing track" information from user's Spotify Account and writes it into a plain *.txt file. Also outputs it to console. In addition it has the ability to send the info to a discord webhook. 

#####  How does it work
It utilizes Spotify's [`Web API`](https://developer.spotify.com/documentation/web-api/) and specifically the endpoint for current track informations `https://api.spotify.com/v1/me/player/currently-playing`. The user's `refresh_token` is used to make continuous requests on behalf of the authorized user. After a one-time authorization process the `refresh_token` is kept locally ⚠️ so please use at your own risk ⚠️. 


##### What do you need

 - NodeJS & NPM
 - CLIENT_ID & CLIENT_SECRET from the [Spotify Developer Console](https://developer.spotify.com/dashboard/login)
 - a discord webhook if you plan to use them

 
 
# Setup
**Install project**
```bash
git clone https://github.com/turbopasi/spotify-current-track
cd spotify-current-track
npm install
```

**Copy `.env.example` to `.env` file in project root directory and fill out the fields**
if you plan on using a discord webhook, fill out the `DISCORD_WEBHOOK_URL` and the `DISCORD_USERNAME` (This does not have to be a username but could be something like your channel name, your streamer name, etc.

**Start App**
```bash
npm start
```
If you start it for the first time, follow the instructions in the console to authorize your user account with Spotify. After that, you should start to see the following:
