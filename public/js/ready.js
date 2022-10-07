var dataurl = localStorage.getItem("dataURL");
var checkurl = localStorage.getItem("checkURL");
errored_reqs = 0;
error_limit = 10;
const interval = window.setInterval(checkReload(), 2000);
function refreshData() {
  getSongData(dataurl);
}
function getSongData(dataURL) {
  fetch(dataURL, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        console.error(`Request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      //console.log(data);
      var title = `${data.song} - ${data.artist} - `;
      updatePageData(data);
      transitionColors(data.colorPrimary, data.colorSecondary);
    });
}
function checkReload() {
  console.info("polling for updates");
  fetch(checkurl, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        console.error(`Request failed with status ${response.status}`);
      }
      console.log(response.json())
      return response.json();
    })
    .then((data) => {
      //console.log(data.reload)
      if (data.reload == "true") {
        console.info("update requested");
        refreshData();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function transitionColors(primary, secondary) {
  primary = primary.toString();
  secondary = secondary.toString();
  console.log("updating background", primary, secondary);
  $("body").animate(
    { backgroundColor: primary, color: secondary },
    5000,
    function () {
      console.log("animation complete");
    }
  );
}

function updatePageData(data) {
  //console.log(data);
  var title = `${data.song} - ${data.artist} - `;
  localStorage.setItem("webtitle", title);
  var msg = localStorage.getItem("webtitle");
  var chars = Array.from(msg);

  function scrollTitle() {
    chars.push(chars.shift());
    document.title = chars.join("");
    window.setTimeout(scrollTitle, 120);
  }

  (function () {
    scrollTitle();
  })();
  document.getElementById("song").innerText = "Song " + data.song;
  document.getElementById("album").innerText = "Album " + data.album;
  document.getElementById("artist").innerText = "Artist " + data.artist;
  document.getElementById("duration").innerText = "Duration " + data.duration;
  document.getElementById("albumart").src = data.imageURL;
}
function stetupPage(dataURL) {
  getSongData(dataURL);

  console.info("initial load complete, setting up update timer");
}

$(document).ready(function () {
  console.log("document ready");
  stetupPage(dataurl);
});
