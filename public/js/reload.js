    
 


// A $( document ).ready() block.
$( document ).ready(function() {

    function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

      console.log("ready!");
  var song = document.getElementById("song").innerText;
  song = song.split("Song")[1];
  let artist = document.getElementById("artist").innerText;
  artist = artist.split("Artist")[1];
  let title = song + " -" + artist + " - ";
  localStorage.setItem("webtitle", title);
  document.title = localStorage.getItem("webtitle");
  document.body.style.backgroundColor = localStorage.getItem("background")
  document.body.style.color = localStorage.getItem("foreground")
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


