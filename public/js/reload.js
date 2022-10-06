    
 


// A $( document ).ready() block.
$( document ).ready(function() {
      console.log("ready!");
  var song = document.getElementById("song").innerText;
  song = song.split("Song")[1];
  let artist = document.getElementById("artist").innerText;
  artist = artist.split("Artist")[1];
  let title = "Now Playing - " + song + " By: " + artist + "  ";
  localStorage.setItem("webtitle", title);
  document.title = localStorage.getItem("webtitle");
 var msg = localStorage.getItem("webtitle")
var chars = Array.from(msg);

  function scrollTitle() {
    chars.push(chars.shift());
    document.title = chars.join("");
    window.setTimeout(scrollTitle, 120);
  }

  (function() {
    scrollTitle();
  })();
});


