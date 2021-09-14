import { xf } from './xf.js';

function pista() {
    navigator.vibrate([200, 800, 200, 800, 200, 800, 1000]);
}

function keypress() {
    navigator.vibrate([250]);
}

function interval() {
    navigator.vibrate([250]);
}

function Vibrate(args) {
    let vibrate = true;
    let turnOn = args.turnOn;

    xf.sub('ui:vibrate', e => {
        keypress();
    });

    xf.sub(`db:vibrate`, x => {
        vibrate = x;
    });

    xf.sub('db:lapTime', time => {
        if(vibrate) {
            if(time === 0) {
                interval();
            }
        }
    });
}

export { Vibrate };
