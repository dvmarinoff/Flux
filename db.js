import { avgOfArray, maxOfArray, sum,
         first, last, round, mps, kph,
         timeDiff     } from './functions.js';
import { Encode       } from './fit.js';
import { FileHandler  } from './file.js';
import { IDB, Storage } from './storage.js';
import { Session      } from './session.js';
import { xf, DB       } from './xf.js';

let initDB = {
    pwr:      0,
    hr:       0,
    cad:      0,
    spd:      0,
    distance: 0,
    elapsed:  0,
    lapTime:  0,

    intervalIndex:    0,
    stepIndex:        0,
    intervalDuration: 0,
    stepDuration:     0,
    watchState:       'stopped',
    workoutState:     'stopped',

    mode:             'erg',
    powerTarget:      0,
    powerMin:         0,
    powerMax:         800,
    powerInc:         10,
    resistanceTarget: 0,
    resistanceMin:    0,
    resistanceMax:    100,
    resistanceInc:    5,
    slopeTarget:      0,
    slopeMin:         0,
    slopeMax:         30,
    slopeInc:         0.5,

    records: [],
    lap:     [],
    laps:    [],
    lapStartTime: Date.now(),
    timestamp:    Date.now(),
    inProgress:   false,

    ftp:    0,
    weight: 0,

    workout:     [],
    workoutFile: '',
    workouts:    [],

    points: [],

    controllableFeatures: {},
};

let db = DB(initDB);

xf.reg('device:hr',      x => db.hr       = x);
xf.reg('device:pwr',     x => db.pwr      = x);
xf.reg('device:spd',     x => db.spd      = x);
xf.reg('device:cad',     x => db.cad      = x);
xf.reg('device:dist',    x => db.distance = x);

xf.reg('ui:ftp',         x => db.ftp    = x);
xf.reg('ui:weight',      x => db.weight = x);
xf.reg('storage:weight', x => db.weight = x);
xf.reg('storage:ftp',    x => db.ftp    = x);

xf.reg('ui:workoutFile', x => db.workoutFile = x);
xf.reg('ui:workout:set', x => db.workout     = db.workouts[x]);
xf.reg('workout:add',    x => db.workouts.push(x));

xf.reg('ui:power-target',      x => db.powerTarget      = x);
xf.reg('ui:resistance-target', x => db.resistanceTarget = x);
xf.reg('ui:slope-target',      x => db.slopeTarget      = x);

xf.reg('watch:lapDuration',    time => db.intervalDuration = time);
xf.reg('watch:stepDuration',   time => db.stepDuration     = time);
xf.reg('watch:lapTime',        time => db.lapTime          = time);
xf.reg('watch:stepTime',       time => db.stepTime         = time);
xf.reg('watch:intervalIndex', index => db.intervalIndex    = index);
xf.reg('watch:stepIndex',     index => {
    db.stepIndex      = index;
    let intervalIndex = db.intervalIndex;
    let targetPwr     = db.workout.intervals[intervalIndex].steps[index].power;
    db.targetPwr      = targetPwr;
});
xf.reg('workout:started', x => db.workoutState = 'started');
xf.reg('workout:stopped', x => db.workoutState = 'stopped');
xf.reg('workout:done',    x => db.workoutState = 'done');
xf.reg('watch:started',   x => {
    db.watchState = 'started';
    db.lapStartTime = Date.now(); // ??
});
xf.reg('watch:paused',  x => db.watchState = 'paused');
xf.reg('watch:stopped', x => db.watchState = 'stopped');
xf.reg('watch:elapsed', x => {
    db.elapsed = x;
    db.distance  += 1 * mps(db.spd);
    let record = {timestamp: Date.now(),
                  power:     db.pwr,
                  cadence:   db.cad,
                  speed:     db.spd,
                  hr:        db.hr,
                  distance:  db.distance};
    db.records.push(record);
    db.lap.push(record);
});
xf.reg('watch:lap', x => {
    let timeEnd   = Date.now();
    let timeStart = db.lapStartTime;
    let elapsed   = timeDiff(timeStart, timeEnd);

    if(elapsed > 0) {
        db.laps.push({timestamp:        timeEnd,
                      startTime:        timeStart,
                      totalElapsedTime: elapsed,
                      avgPower:         round(avgOfArray(db.lap, 'power')),
                      maxPower:         maxOfArray(db.lap, 'power')});
    }

    db.lap = [];
    db.lapStartTime = timeEnd + 0;
});
xf.reg('device:features', features => {

    db.controllableFeatures = features;

    db.powerMin = features.power.params.min;
    db.powerMax = features.power.params.max;
    db.powerInc = 10;

    db.resistanceMin = features.resistance.params.min;
    db.resistanceMax = features.resistance.params.max;
    db.resistanceInc = features.resistance.params.inc * 10;

    db.slopeMin = 0;
    db.slopeMax = 30;
    db.slopeInc = 0.1;
});
xf.sub('ui:activity:save', x => {
    let activity   = Encode({data: db.records, laps: db.laps});
    let fileHandler = new FileHandler();
    fileHandler.downloadActivity(activity);
});

xf.reg('ui:erg-mode', e => {
    db.mode = 'erg';
    xf.dispatch('ui:power-target', db.powerTarget);
});
xf.reg('ui:resistance-mode', e => {
    db.mode = 'resistance';
    xf.dispatch('ui:resistance-target', db.resistanceTarget);
});
xf.reg('ui:slope-mode', e => {
    db.mode = 'slope';
    xf.dispatch('ui:slope-target', db.slopeTarget);
});

xf.reg('key:up', e => {
    if(db.mode === 'slope') {
        db.slopeTarget += db.slopeInc;
    }
    if(db.mode === 'resistance') {
        db.resistanceTarget += db.resistanceInc;
    }
    if(db.mode === 'erg') {
        db.powerTarget += db.powerInc;
    }
});
xf.reg('key:down', e => {
    if(db.mode === 'slope') {
        db.slopeTarget -= db.slopeInc;
    }
    if(db.mode === 'resistance') {
        db.resistanceTarget -= db.resistanceInc;
    }
    if(db.mode === 'erg') {
        db.powerTarget -= db.powerInc;
    }
});


xf.sub('keydown', e => {
    let keyCode = e.keyCode;
    let code = e.code;

    if (e.isComposing || keyCode === 229 || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
    }

    const isKeyUp    = (code) => code === 'ArrowUp';
    const isKeyDown  = (code) => code === 'ArrowDown';
    const isKeyE     = (code) => code === 'KeyE';
    const isKeyR     = (code) => code === 'KeyR';
    const isKeyS     = (code) => code === 'KeyS';
    const isKeySpace = (code) => code === 'Space';

    if(isKeyUp(code)) {
        e.preventDefault();
        xf.dispatch('key:up');
    }
    if(isKeyDown(code)) {
        e.preventDefault();
        xf.dispatch('key:down');
    }
    if(isKeyS(code)) {
        xf.dispatch('key:s');
    }
    if(isKeyR(code)) {
        xf.dispatch('key:r');
    }
    if(isKeyE(code)) {
        xf.dispatch('key:e');
    }
    if(isKeySpace(code)) {
        e.preventDefault();
        xf.dispatch('key:space');
    }
}, window);


// let storage = new Storage();
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

xf.reg('app:start', async function (x) {
    await idb.open('store', 1, 'session');
    session = new Session({idb: idb});
    await session.restore();

});

xf.reg('lock:beforeunload', e => {
    session.backup(idb, dbToSession(db));
});
xf.reg('lock:release', e => {
    session.backup(idb, dbToSession(db));
});
xf.reg(`session:restore`, session => {

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
xf.reg('file:download:activity', e => {
    // reset db session:
    db.records     = [];
    db.resistanceTarget = 0;
    db.slopeTarget = 0;
    db.targetPwr    = 0;
});


export { db };
