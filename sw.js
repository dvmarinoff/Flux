const cacheName = 'Flux-v001';
const resources = [
    '/',
    'index.html',
    'css/flux.css',
    'images/connections/garmin-connect.jpg',
    'images/logo/flux-logo-36dpi-192px.png',
    'images/logo/flux-logo-96dpi-512px.png',

    'ble/device.js',
    'ble/controllable.js',
    'ble/hrb.js',
    'ble/power-meter.js',
    'ble/ftms.js',
    'ble/hrs.js',
    'ble/cps.js',

    'controllers.js',
    'db.js',
    'index.js',
    'file.js',
    'fit.js',
    'functions.js',
    'lock.js',
    'parser.js',
    'q.js',
    'session.js',
    'simulation.js',
    'speed.js',
    'storage.js',
    'vibrate.js',
    'views.js',
    'watch.js',
    'xf.js',
];


self.addEventListener('install', e => {
    console.log('SW: Install');

    e.waitUntil(
        caches.open(cacheName).then(cache => {
                return cache.addAll(resources);
            }));
});

self.addEventListener('activate', e => {
    console.log('SW: Activate');
});

self.addEventListener('fetch', e => {
    console.log(`SW: Fetch: ${e.request.url}`);

    e.respondWith(caches.match(e.request).then(cachedResource => {
            return cachedResource || fetch(e.request);
        }));
});
