import { xf, exists, empty, equals } from './functions.js';

var gps = false;
var watchId;

function onGPS(active) {
    gps = active;
}

function onGPSSwitch() {
    if(gps) {
        stopRecording();
    } else {
        startRecording();
    }
}

function startRecording() {
    navigator.geolocation.getCurrentPosition(function (location) {
        console.log(location);
        // xf.dispatch('location', location);
    });

    watchId = navigator.geolocation.watchPosition(onPositionWatch);
    console.log(`:location :on`);
};

function stopRecording() {
    navigator.geolocation.clearWatch(watchId);
    console.log(`:location :off`);
};

function onPositionWatch(position) {
    console.log(position);
}

// xf.sub('ui:gps:switch', onGPSSwitch);
// xf.sub('db:gps', onGPS);
