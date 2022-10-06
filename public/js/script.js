console.log("This is coming from script.js");
localStorage.setItem("webtitle","Now Playing")
var errored_reqs = [0,0]
var error_limit = 5
const checkInterval = setInterval(checkReload,1000)
var checkURL = localStorage.getItem("checkURL")
function cancelReqs(){
        clearInterval(checkInterval)
        alert("Unable to communicate with backend")
}
function checkReload(){
    fetch("https://nowplaying.synapselabs.xyz/reload")
.then(response =>{
    if (!response.ok){
        console.error(`Request failed with status ${response.status}`)
        errored_reqs[0] +=1
        if(errored_reqs[0] >= error_limit || errored_reqs[1] >=error_limit){
            cancelReqs()
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
}).catch(error =>{
    errored_reqs[1] +=1
console.error(`${error} \n Try ${errored_reqs[1]} of ${error_limit}`)
})
}
