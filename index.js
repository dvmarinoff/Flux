import { xf } from './xf.js';
import { db } from './db.js';
import { Controllable } from './ble/controllable.js';
import { PowerMeter } from './ble/power-meter.js';
import { Hrb } from './ble/hrb.js';
import { Watch } from './watch.js';
import { WakeLock } from './lock.js';
import { Views } from './views.js';
import { ant, AntHrm, AntFec } from './ant/ant.js';
import { DeviceController,
         FileController,
         WorkoutController } from './controllers.js';
import { FileHandler } from './file.js';
import { Vibrate } from './vibrate.js';

'use strict';

function startServiceWroker() {
    if('serviceWorker' in navigator) {
        try {
            const reg = navigator.serviceWorker.register('./sw.js');
            console.log(`SW: register success.`);
            console.log('Cache Version: Flux-v001');
        } catch(err) {
            console.log(`SW: register error: `, err);
        }
    };
}

async function start() {
    const hrb    = new Hrb({name: 'hrb'});
    const flux   = new Controllable({name: 'controllable'});
    const pm     = new PowerMeter({name: 'pm'});

    const antHrm = new AntHrm({});
    const antFec = new AntFec({});

    let watch    = new Watch();
    let lock     = new WakeLock();

    Views();

    FileController();
    WorkoutController();
    DeviceController({controllable: flux,
                      powerMeter: pm,
                      watch: watch,
                      hrb: hrb,
                      antHrm: antHrm,
                      antFec: antFec,
                     });

    xf.dispatch('app:start');

    Vibrate({turnOn: true});
};

startServiceWroker();

start();
