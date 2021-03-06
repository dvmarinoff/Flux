import 'regenerator-runtime/runtime';

import { xf } from './xf.js';
import { db } from './db.js';
import { Controllable } from './ble/controllable.js';
import { PowerMeter } from './ble/power-meter.js';
import { Hrb } from './ble/hrb.js';
import { Watch } from './watch.js';
import { WakeLock } from './lock.js';
import { Views } from './views.js';
import { ant } from './ant/ant.js';
import { DeviceController,
         FileController,
         WorkoutController } from './controllers.js';
import { FileHandler } from './file.js';
import { LocalStorage } from './storage/local-storage.js';
import { Vibrate } from './vibrate.js';
import { DataMock } from './test/mock.js';

'use strict';

function startServiceWroker() {
    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log(`SW: register success: ${reg}`);
            })
            .catch(err => {
                console.log(`SW: register error: ${err}`);
            });
    };
}

async function start() {
    let hrb   = new Hrb({name: 'hrb'});
    let flux  = new Controllable({name: 'controllable'});
    let pm    = new PowerMeter({name: 'pm'});
    let watch = new Watch();
    let lock  = new WakeLock();

    Views();

    FileController();
    WorkoutController();
    DeviceController({controllable: flux, powerMeter: pm, watch: watch, hrb: hrb});

    let localStorage = new LocalStorage();

    xf.dispatch('app:start');

    Vibrate({turnOn: true});
    // DataMock({hr: true, pwr: true});
};

// startServiceWroker();

start();
