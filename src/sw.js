const cacheName = 'Flux-v004';
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
    'ant/channel.js',
    'ant/common.js',
    'ant/constants.js',
    'ant/controllable.js',
    'ant/device.js',
    'ant/fec-channel.js',
    'ant/fec.js',
    'ant/hrm-channel.js',
    'ant/hrm.js',
    'ant/message.js',
    'ant/polyfill.js',
    'ant/search-channel.js',
    'ant/types.js',
    'ant/web-serial.js',
    'ant/web-usb.js',

    'ble/cps/control-point.js',
    'ble/cps/cps.js',
    'ble/cps/cycling-power-feature.js',
    'ble/cps/cycling-power-measurement.js',

    'ble/cscs/feature.js',
    'ble/cscs/measurement.js',
    'ble/cscs/cscs.js',

    'ble/dis/dis.js',
    'ble/fec/fec.js',

    'ble/ftms/control-point.js',
    'ble/ftms/fitness-machine-feature.js',
    'ble/ftms/fitness-machine-status.js',
    'ble/ftms/ftms.js',
    'ble/ftms/indoor-bike-data.js',
    'ble/ftms/supported-ranges.js',

    'ble/hrs/heartRateMeasurement.js',
    'ble/hrs/hrs.js',

    'ble/wcps/control.js',
    'ble/wcps/wcps.js',

    'ble/common.js',
    'ble/controllable.js',
    'ble/device.js',
    'ble/hrm.js',
    'ble/power-meter.js',
    'ble/service.js',
    'ble/speed-cadence.js',
    'ble/uuids.js',
    'ble/web-ble.js',

    // 'css/flux.css',

    'fit/activity.js',
    'fit/course.js',
    'fit/fields.js',
    'fit/fit.js',
    'fit/local-message-definitions.js',
    'fit/profiles.js',

    'models/models.js',

    'storage/idb.js',
    'storage/local-storage.js',
    'storage/uuid.js',

    'views/ant-device-scan.js',
    'views/connection-switch.js',
    'views/data-views.js',
    'views/effect-views.js',
    'views/graph.js',
    'views/keyboard.js',
    'views/tabs.js',
    'views/views.js',
    'views/watch.js',
    'views/workout-graph.js',
    'views/workout-list.js',

    'workouts/workouts.js',
    'workouts/zwo.js',

    'connectionManager.js',
    'course.js',
    'db.js',
    'file.js',
    'functions.js',
    // 'index.html',
    // 'index.js',
    'lock.js',
    'physics.js',
    // 'sw.js',
    'utils.js',
    'vibrate.js',
    'watch.js',

    'manifest.webmanifest',
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
