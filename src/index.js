import { xf } from './functions.js';
import './db.js';
import './views/views.js';
import './connectionManager.js';
import './watch.js';
import './course.js';
import './lock.js';

function startServiceWorker() {
    if('serviceWorker' in navigator) {
        try {
            const reg = navigator.serviceWorker.register('./sw.js');
            console.log(`SW: register success.`);
            console.log('Cache Version: Flux-v003');
        } catch(err) {
            console.log(`SW: register error: `, err);
        }
    };
}


function start() {
    console.log('start app.');

    // startServiceWorker(); // stable version only

    xf.dispatch('app:start');
}

function stop() {}

start();
