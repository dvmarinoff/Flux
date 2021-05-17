import { xf, exists, empty, equals } from '../functions.js';
// import { models } from './models/models.js';


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
    // navigator.geolocation.getCurrentPosition(function (location) {
    //     console.log(location);
    // });

    watchId = navigator.geolocation.watchPosition(onPositionWatch);
};

function stopRecording() {
    navigator.geolocation.clearWatch(watchId);
};

function onPositionWatch(position) {
    console.log(position);
}

// xf.dispatch();

xf.sub('ui:gps:switch', onGPSSwitch);
xf.sub('db:gps', onGPS);
