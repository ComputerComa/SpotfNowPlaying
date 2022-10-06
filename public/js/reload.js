        let song = document.getElementById("song").innerText
        song = song.split("Song")[1]
        let artist = document.getElementById("artist")[1]
        artist = artist.split("Artist")[1]
        let title = "Now Playing - " + song + artist
        localStorage.setItem("webtitle",title)
        document.title = localStorage.getItem("webtitle")