const cacheName = 'Flux-v001';
const resources = [
    '/',
    '/index.html',
    '/css/flux.css',
    '/images/connections/garmin-connect.jpg',
    '/images/logo/logo-36dpi-192px.png',
    '/images/logo/logo-96dpi-512px.png',
    '/favicon-16.png',
    '/favicon-32.png',
    '/favicon-180.png',
    '/favicon-192.png',
    '/favicon-196.png',
    '/index.js',

    '/ant/ant.js',
    '/ant/channel.js',
    '/ant/fit.js',
    '/ant/message.js',
    '/ant/usb.js',

    '/ble/device.js',
    '/ble/controllable.js',
    '/ble/fec-over-ble.js',
    '/ble/hrb.js',
    '/ble/power-meter.js',
    '/ble/services.js',
    '/ble/cps/cps.js',
    '/ble/ftms/control-point.js',
    '/ble/ftms/fitness-machine-feature.js',
    '/ble/ftms/fitness-machine-status.js',
    '/ble/ftms/ftms.js',
    '/ble/ftms/indoor-bike-data.js',
    '/ble/ftms/supported.js',
    '/ble/hrs/hrs.js',

    '/storage/idb.js',
    '/storage/idb-store.js',
    '/storage/local-storage.js',
    '/storage/session.js',
    '/storage/workout.js',

    '/workouts/parser.js',
    '/workouts/workouts.js',

    '/controllers.js',
    '/db.js',
    '/file.js',
    '/functions.js',
    '/lock.js',
    '/manifest.webmanifest',
    '/q.js',
    // '/sw.js',
    '/values.js',
    '/vibrate.js',
    '/views.js',
    '/watch.js',
    '/xf.js',
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
