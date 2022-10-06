// A $( document ).ready() block.
$(document).ready(function () {
  console.log("ready!");
  var song = document.getElementById("song").innerText;
  song = song.split("Song")[1];
  let artist = document.getElementById("artist").innerText;
  artist = artist.split("Artist")[1];
  let title = "Now Playing - " + song + artist;
  localStorage.setItem("webtitle", title);
  document.title = localStorage.getItem("webtitle");

  (function (c, a, m) {
    let webtitle = localStorage.getItem("webtitle")
    var title = (c || document.title) + " " + (a || "-") + " ";
    setInterval(function () {
        title = title.substring(1) + title.charAt(0);
        document.title = title;
    }, m || 300);
})(
  /* Tab Text */ webtitle,
  /* Title Repeat Separator */ "-",
  /* Scroll Speed (in milleseconds) */ 300
);
});
