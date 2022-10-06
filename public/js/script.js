console.log("This is coming from script.js");
setInterval(checkReload,1000)
function checkReload(){
    fetch("https://nowplaying.synapselabs.xyz/reload")
.then(response =>{
    if (!response.ok){
        console.error(`Request failed with status ${response.status}`)
    }
    return response.json()

})
.then(data => {
    //console.log(data.reload)
    if(data.reload == "true"){
        console.log("Reloading page")
        location.reload()
        let song = document.getElementById("song").innerText
        song = song.split("Song")[1]
        let artist = document.getElementById("Artist")[1]
        artist = artist.split("Artist")[1]
        let title = "Now Playing - " + song + artist
        document.title = title
    }
})
}
