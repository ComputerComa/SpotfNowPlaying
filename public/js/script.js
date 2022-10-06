console.log("This is coming from script.js");
localStorage.setItem("webtitle","Now Playing")
var errored_reqs = 0
const checkInterval = setInterval(checkReload,1000)
var checkURL = localStorage.getItem("checkURL")
function checkReload(){
    fetch("https://nowplaying.synapselabs.xyz/reload")
.then(response =>{
    if (!response.ok){
        console.error(`Request failed with status ${response.status}`)
        errored_reqs +=1
        if(errored_reqs >=5){
            clearInterval(checkInterval)
            alert("Unable to communicate with backend")
        }
    }
    errored_reqs = 0
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
