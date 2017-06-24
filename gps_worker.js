console.log(WorkerGlobalScope.geolocation)
self.onmessage = function (e) {
    initGeoLoc();
}

function initGeoLoc() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            self.postMessage("Got position!");
        });
    } else {
        self.postMessage("GPS is not supported on this platform.");
    }
}