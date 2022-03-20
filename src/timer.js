var interval;

function onStart() {
    interval = setInterval(function(){
        self.postMessage('tick');
    }, 1000);
}

function onStop() {
    clearInterval(interval);
}

self.addEventListener('message', function(e) {
    switch (e.data) {
    case 'start': onStart(); break;
    case 'stop':  onStop(); break;
    case 'pause': onStop(); break;
    };
}, false);
