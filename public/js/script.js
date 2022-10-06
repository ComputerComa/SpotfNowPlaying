console.log("This is coming from script.js");
localStorage.setItem("webtitle","Now Playing")
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

    }
})
}
