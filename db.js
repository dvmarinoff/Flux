import { xf           } from './xf.js';
import { Encode       } from './fit.js';
import { FileHandler  } from './file.js';
import { IDB, Storage } from './storage.js';
import { Session      } from './session.js';

import { avgOfArray, maxOfArray, sum,
         first, last, round, mps, kph,
         timeDiff, fixInRange } from './functions.js';

let db = {
    pwr: 0,
    hr: 0,
    cad: 0,
    spd: 0,
    distance: 0,
    elapsed: 0,
    lapTime: 0,

    intervalIndex: 0,
    stepIndex: 0,
    intervalDuration: 0,
    stepDuration: 0,
    watchState: 'stopped',
    workoutState: 'stopped',

    mode: 'erg',
    powerTarget: 0,
    powerTargetManual: 0,
    powerMin: 0,
    powerMax: 800,
    powerInc: 10,
    resistanceTarget: 0,
    resistanceMin: 0,
    resistanceMax: 100,
    resistanceInc: 10,
    slopeTarget: 0,
    slopeMin: 0,
    slopeMax: 30,
    slopeInc: 0.5,

    records: [],
    lap: [],
    laps: [],
    lapStartTime: Date.now(),
    timestamp: Date.now(),
    inProgress: false,

    ftp: 0,
    weight: 0,

    workout: [],
    workoutFile: '',
    workouts: [],

    points: [],

    vibrate: true,
    vibrateBtn: 10,
    controllableFeatures: {},
};

xf.initDB(db);



// Register DB Events
xf.reg('device:hr',   (x, db) => db.hr       = x);
xf.reg('device:pwr',  (x, db) => db.pwr      = x);
xf.reg('device:spd',  (x, db) => db.spd      = x);
xf.reg('device:cad',  (x, db) => db.cad      = x);
xf.reg('device:dist', (x, db) => db.distance = x);

xf.reg('ui:ftp',      (x, db) => db.ftp    = x);
xf.reg('ui:weight',   (x, db) => db.weight = x);
xf.reg('storage:ftp', (x, db) => db.ftp    = x);
xf.reg('storage:weight', (x, db) => db.weight = x);

xf.reg('ui:workoutFile', (x, db) => db.workoutFile = x);
xf.reg('ui:workout:set', (x, db) => db.workout = db.workouts[x]);
xf.reg('workout:add',    (x, db) => db.workouts.push(x));

// Watch
// >> watch.js
// watch end

xf.reg('ui:activity:save', (x, db) => {
    let activity   = Encode({data: db.records, laps: db.laps});
    let fileHandler = new FileHandler();
    fileHandler.downloadActivity(activity);
});


// Control Modes
xf.reg('device:features', (features, db) => {

    db.controllableFeatures = features;

    db.powerMin = features.power.params.min;
    db.powerMax = features.power.params.max;
    db.powerInc = 10;

    db.resistanceMin = features.resistance.params.min;
    db.resistanceMax = features.resistance.params.max;
    db.resistanceInc = 100;

    db.slopeMin = 0;
    db.slopeMax = 30;
    db.slopeInc = 0.5;
});

function validatePowerTarget(target, min, max) {
    return fixInRange(target, min, max);
}
function validateResistanceTarget(target, min, max) {
    return fixInRange(target, min, max);
}
function validateSlopeTarget(target, min, max) {
    return fixInRange(target, min, max);
}

xf.reg('ui:power-target-set', (target, db) => {
    db.powerTarget = validatePowerTarget(target, db.powerMin, db.powerMax);
});
xf.reg('ui:power-target-inc', (_, db) => {
    let target = db.powerTarget + db.powerInc;
    db.powerTarget = validatePowerTarget(target, db.powerMin, db.powerMax);
});
xf.reg('ui:power-target-dec', (_, db) => {
    let target = db.powerTarget - db.powerInc;
    db.powerTarget = validatePowerTarget(target, db.powerMin, db.powerMax);
});

xf.reg('ui:power-target-manual-set', (target, db) => {
    let power = validatePowerTarget(target, db.powerMin, db.powerMax);
    db.powerTargetManual = power;
    db.powerTarget       = power;
});
xf.reg('ui:power-target-manual-inc', (_, db) => {
    let target = db.powerTargetManual + db.powerInc;
    let power  = validatePowerTarget(target, db.powerMin, db.powerMax);
    db.powerTargetManual = power;
    db.powerTarget       = power;
});
xf.reg('ui:power-target-manual-dec', (_, db) => {
    let target = db.powerTargetManual - db.powerInc;
    let power  = validatePowerTarget(target, db.powerMin, db.powerMax);
    db.powerTargetManual = power;
    db.powerTarget       = power;
});

xf.reg('ui:resistance-target-set', (target, db) => {
    db.resistanceTarget = validateResistanceTarget(target, db.resistanceMin, db.resistanceMax);
});
xf.reg('ui:resistance-target-inc', (_, db) => {
    let target = db.resistanceTarget + db.resistanceInc;
    db.resistanceTarget = validateResistanceTarget(target, db.resistanceMin, db.resistanceMax);
});
xf.reg('ui:resistance-target-dec', (_, db) => {
    let target = db.resistanceTarget - db.resistanceInc;
    db.resistanceTarget = validateResistanceTarget(target, db.resistanceMin, db.resistanceMax);
});

xf.reg('ui:slope-target-set', (target, db) => {
    db.slopeTarget = validateSlopeTarget(target, db.slopeMin, db.slopeMax);
});
xf.reg('ui:slope-target-inc', (_, db) => {
    let target = db.slopeTarget + db.slopeInc;
    db.slopeTarget = validateSlopeTarget(target, db.slopeMin, db.slopeMax);
});
xf.reg('ui:slope-target-dec', (_, db) => {
    let target = db.slopeTarget - db.slopeInc;
    db.slopeTarget = validateSlopeTarget(target, db.slopeMin, db.slopeMax);
});

xf.reg('ui:erg-mode', (e, db) => {
    db.mode = 'erg';
    xf.dispatch('ui:power-target-manual-set', db.powerTargetManual);
});
xf.reg('ui:resistance-mode', (e, db) => {
    db.mode = 'resistance';
    xf.dispatch('ui:resistance-target-set', db.resistanceTarget);
});
xf.reg('ui:slope-mode', (e, db) => {
    db.mode = 'slope';
    xf.dispatch('ui:slope-target-set', db.slopeTarget);
});
// Control Modes end



// Session
let idb     = new IDB();
let session = {};

function dbToSession(db) {
    let session = {
        elapsed:       db.elapsed,
        lapTime:       db.lapTime,
        stepTime:      db.stepTime,
        targetPwr:     db.targetPwr,
        stepIndex:     db.stepIndex,
        intervalIndex: db.intervalIndex,

        watchState:    db.watchState,
        workoutState:  db.workoutState,
        workout:       db.workout,

        records:       db.records,
    };
    return session;
}

xf.reg('app:start', async function (x, db) {
    await idb.open('store', 1, 'session');
    session = new Session({idb: idb});
    await session.restore();

});

xf.reg('lock:beforeunload', (e, db) => {
    session.backup(idb, dbToSession(db));
});
xf.reg('lock:release', (e, db) => {
    session.backup(idb, dbToSession(db));
});
xf.reg(`session:restore`, (session, db) => {

    // Restore DB state
    for(let prop in session) {
        if (session.hasOwnProperty(prop)) {
            db[prop] = session[prop];
        }
    }

    // Start Workout with restored db state
    xf.dispatch('workout:restore');
    // Restore BLE Devices
    // db.controllable = session.controllable;
    // db.hrm          = session.hrm;
    // console.log(session);
});

xf.reg('file:download:activity', (e, db) => {
    // reset db session:
    db.records     = [];
    db.resistanceTarget = 0;
    db.slopeTarget = 0;
    db.targetPwr    = 0;
});
// Session end

export { db };
