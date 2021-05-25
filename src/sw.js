const cacheName = 'Flux-v001';
const resources = [
    './',
    'index.html',
    'css/flux.css',
    'images/connections/garmin-connect.jpg',
    'images/logo/logo-36dpi-192px.png',
    'images/logo/logo-96dpi-512px.png',
    'favicon-16.png',
    'favicon-32.png',
    'favicon-180.png',
    'favicon-192.png',
    'favicon-196.png',
    'index.js',

    'ant/ant.js',
    'ant/fit.js',
    'ant/message.js',
    'ant/page.js',
    'ant/serial.js',

    'ble/cps/control-point.js',
    'ble/cps/cps.js',
    'ble/cps/cycling-power-feature.js',
    'ble/cps/cycling-power-measurement.js',
    'ble/dis/dis.js',
    'ble/fec/fec.js',
    'ble/ftms/control-point.js',
    'ble/ftms/fitness-machine-feature.js',
    'ble/ftms/fitness-machine-status.js',
    'ble/ftms/ftms.js',
    'ble/ftms/indoor-bike-data.js',
    'ble/ftms/supported.js',
    'ble/hrs/heartRateMeasurement.js',
    'ble/hrs/hrs.js',
    'ble/controllable.js',
    'ble/device.js',
    'ble/hrm.js',
    'ble/power-meter.js',
    'ble/uuids.js',
    'ble/web-ble.js',

    'controllers/controllers.js',
    'models/models.js',

    'storage/idb.js',
    'storage/idb-store.js',
    'storage/local-storage.js',
    'storage/session.js',
    'storage/uuid.js',
    'storage/workout.js',

    'views/connection-switch.js',
    'views/data-display.js',
    'views/data-graph.js',
    'views/graphs.js',
    'views/inputs.js',
    'views/list.js',
    'views/q.js',
    'views/tabs.js',
    'views/upload.js',
    'views/views.js',
    'views/watch.js',
    'views/workout-graph.js',

    'workouts/parser.js',
    'workouts/workouts.js',

    'db.js',
    'file.js',
    'functions.js',
    'gps.js',
    'lock.js',
    'manifest.webmanifest',
    'vibrate.js',
    'watch.js',
];

self.addEventListener('install', e => {
    console.log('SW: Install.');

    e.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(resources)));
});

self.addEventListener('activate', e => {
    console.log('SW: Activate.');

    e.waitUntil(
        caches.keys().then((keyList) => {
                Promise.all(keyList.map((key) => {
                    console.log(key);
                    if (key === cacheName) { return; }
                    console.log(`deleting cache ${key}.`);
                    caches.delete(key);
                }));
            }));
});

self.addEventListener('fetch', e => {
    console.log(`SW: fetch: `, e.request.url);

    // Cache falling back to the Network
    e.respondWith(
        caches.match(e.request)
            .then(cachedResource => {
                if(cachedResource) {
                    return cachedResource;
                }
                return fetch(e.request);
            }));

    // Network falling back to the Cache
    // e.respondWith(
    //     fetch(e.request).catch(function() {
    //         return caches.match(e.request);
    //     }));
});
