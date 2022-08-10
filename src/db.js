import { xf, exists, equals } from '../functions.js';
import { models } from './models/models.js';
import { Sound } from './sound.js';
// import { trainerMock } from './simulation-scripts.js';

let db = {
    // Data Screen
    power: models.power.default,
    heartRate: models.heartRate.default,
    cadence: models.cadence.default,
    speed: models.speed.default,
    sources: models.sources.default,

    speedVirtual: models.virtualState.speed,
    altitude: models.virtualState.altitude,
    distance: models.virtualState.distance,
    ascent: models.virtualState.ascent,

    power1s: models.power1s.default,
    powerLap: models.powerLap.default,
    powerAvg: models.powerAvg.default,
    powerInZone: models.powerInZone.default,

    cadenceLap: models.cadenceLap.default,
    heartRateLap: models.heartRateLap.default,

    // Targets
    powerTarget: models.powerTarget.default,
    resistanceTarget: models.resistanceTarget.default,
    slopeTarget: models.slopeTarget.default,
    cadenceTarget: models.cadenceTarget.default,

    mode: models.mode.default,
    page: models.page.default,

    // Profile
    ftp: models.ftp.default,
    weight: models.weight.default,
    theme: models.theme.default,
    measurement: models.measurement.default,
    volume: models.volume.default,

    // UI options
    powerSmoothing: 0,
    dataTileSwitch: models.dataTileSwitch.default,
    librarySwitch: 0,

    // Workouts
    workouts: [],
    workout: models.workout.default,

    // Recording
    records: [],
    lap: [],
    laps: [],
    lapStartTime: false,

    // Watch
    elapsed: 0,
    lapTime: 0,
    stepTime: 0,
    intervalIndex: 0,
    stepIndex: 0,
    intervalDuration: 0,
    stepDuration: 0,
    watchStatus: 'stopped',
    workoutStatus: 'stopped',

    // Course
    courseIndex: 0,

    // Request ANT+ Device
    antSearchList: [],
    antDeviceId: {},
};

xf.create(db);

// Data Screen
xf.reg(models.heartRate.prop, (heartRate, db) => {
    db.heartRate = heartRate;
    db.heartRateLap = models.heartRateLap.setState(heartRate);
});

xf.reg(models.power.prop, (power, db) => {
    db.power = power;
});

xf.reg(models.cadence.prop, (cadence, db) => {
    db.cadence = cadence;
    db.cadenceLap = models.cadenceLap.setState(cadence);
});

xf.reg(models.speed.prop, (speed, db) => {
    db.speed = speed;
});

xf.reg(models.sources.prop, (sources, db) => {
    db.sources = models.sources.set(db.sources, sources);
    models.sources.backup(db.sources);
    console.log(db.sources);
});

xf.reg('power1s', (power, db) => {
    db.power1s = power;
    db.powerLap = models.powerLap.setState(power);
    db.powerAvg = models.powerAvg.setState(power);
});

xf.reg('powerInZone', (powerInZone, db) => {
    db.powerInZone = powerInZone;
});

xf.reg('speedVirtual', (speedVirtual, db) => {
    db.speedVirtual = speedVirtual;
});

xf.reg('altitude', (altitude, db) => {
    db.altitude = altitude;
});

xf.reg('ascent', (ascent, db) => {
    db.ascent = ascent;
});

xf.reg('distance', (distance, db) => {
    if(equals(db.watchStatus, 'started')) {
        db.distance = distance;
    };
});

// Pages
xf.reg('ui:page-set', (page, db) => {
    db.page = models.page.set(page);
});

// Modes
xf.reg('ui:mode-set', (mode, db) => {
    db.mode = models.mode.set(mode);

    if(equals(mode, 'erg')) {
        xf.dispatch(`ui:power-target-set`, db.powerTarget);
    }
    if(equals(mode, 'resistance')) {
        xf.dispatch(`ui:resistance-target-set`, db.resistanceTarget);
    }
    if(equals(mode, 'slope')) {
        xf.dispatch(`ui:slope-target-set`, db.slopeTarget);
    }
});

// UI options
xf.reg('ui:data-tile-switch-set', (index, db) => {
    db.dataTileSwitch = index;
    models.dataTileSwitch.backup(db.dataTileSwitch);
});

xf.reg('ui:library-switch-set', (index, db) => {
    db.librarySwitch = index;
});

// Targets
xf.reg('ui:power-target-set', (powerTarget, db) => {
    db.powerTarget = models.powerTarget.set(powerTarget);
});
xf.reg('ui:power-target-inc', (_, db) => {
    db.powerTarget = models.powerTarget.inc(db.powerTarget);
});
xf.reg(`ui:power-target-dec`, (_, db) => {
    db.powerTarget = models.powerTarget.dec(db.powerTarget);
});
xf.reg('ui:cadence-target-set', (cadenceTarget, db) => {
    db.cadenceTarget = models.cadenceTarget.set(cadenceTarget);
});

xf.reg('ui:resistance-target-set', (resistanceTarget, db) => {
    db.resistanceTarget = models.resistanceTarget.set(resistanceTarget);
});
xf.reg('ui:resistance-target-inc', (_, db) => {
    db.resistanceTarget = models.resistanceTarget.inc(db.resistanceTarget);
});
xf.reg(`ui:resistance-target-dec`, (_, db) => {
    db.resistanceTarget = models.resistanceTarget.dec(db.resistanceTarget);
});

xf.reg('ui:slope-target-set', (slopeTarget, db) => {
    db.slopeTarget = models.slopeTarget.set(slopeTarget);
});
xf.reg('ui:slope-target-inc', (_, db) => {
    db.slopeTarget = models.slopeTarget.inc(db.slopeTarget);
});
xf.reg(`ui:slope-target-dec`, (_, db) => {
    db.slopeTarget = models.slopeTarget.dec(db.slopeTarget);
});

// Profile
xf.reg('ui:ftp-set', (ftp, db) => {
    db.ftp = models.ftp.set(ftp);
    models.ftp.backup(db.ftp);
});
xf.reg('ui:weight-set', (weight, db) => {
    db.weight = models.weight.set(weight);
    models.weight.backup(db.weight);
});
xf.reg('ui:theme-switch', (_, db) => {
    db.theme = models.theme.switch(db.theme);
    models.theme.backup(db.theme);
});
xf.reg('ui:measurement-switch', (_, db) => {
    db.measurement = models.measurement.switch(db.measurement);
    models.measurement.backup(db.measurement);
});

xf.reg('ui:volume-mute', (_, db) => {
    db.volume = models.volume.mute();
    models.volume.backup(db.volume);
});
xf.reg('ui:volume-down', (_, db) => {
    db.volume = models.volume.dec(db.volume);
    models.volume.backup(db.volume);
});
xf.reg(`ui:volume-up`, (_, db) => {
    db.volume = models.volume.inc(db.volume);
    models.volume.backup(db.volume);
});

// Workouts
xf.reg('workout', (workout, db) => {
    db.workout = models.workout.set(workout);
});
xf.reg('ui:workout:select', (id, db) => {
    db.workout = models.workouts.get(db.workouts, id);
});
xf.reg('ui:workout:upload', async function(file, db) {
    const { result, name } = await models.workout.readFromFile(file);
    const workout = models.workout.parse(result, name);
    models.workouts.add(db.workouts, workout);
    xf.dispatch('db:workouts', db);
});
xf.reg('ui:activity:save', (_, db) => {
    try {
        models.workout.save(db);
        xf.dispatch('activity:save:success');
    } catch (err) {
        console.error(`Error on activity save: `, err);
        xf.dispatch('activity:save:fail');
    }
});
xf.reg('activity:save:success', (e, db) => {
    // file:download:activity
    // reset db session:
    db.records = [];
    db.resistanceTarget = 0;
    db.slopeTarget = 0;
    db.powerTarget = 0;
});

xf.reg('course:index', (index, db) => {
    db.courseIndex = index;
});

// Wake Lock
xf.reg('lock:beforeunload', (e, db) => {
    // backup session
    models.session.backup(db);
});
xf.reg('lock:release', (e, db) => {
    // backup session
    models.session.backup(db);
});

// Request ANT+ Device
xf.reg('ui:ant:request:selected', (x, db) => {
    db.antDeviceId = db.antSearchList.filter(d => {
        return d.deviceNumber === parseInt(x);
    })[0];
});
function includesDevice(devices, id) {
    return devices.filter(d => d.deviceNumber === id.deviceNumber).length > 0;
}
xf.reg(`ant:search:device-found`, (x, db) => {
    if(includesDevice(db.antSearchList, x)) return;
    db.antSearchList.push(x);
    db.antSearchList = db.antSearchList;
});
xf.reg(`ant:search:stopped`, (x, db) => {
    db.antSearchList = [];
});

//
xf.reg('app:start', async function(_, db) {

    db.ftp = models.ftp.set(models.ftp.restore());
    db.weight = models.weight.set(models.weight.restore());
    db.theme = models.theme.set(models.theme.restore());
    db.measurement = models.measurement.set(models.measurement.restore());
    db.volume = models.volume.set(models.volume.restore());
    db.dataTileSwitch = models.dataTileSwitch.set(models.dataTileSwitch.restore()),

    db.sources = models.sources.set(models.sources.restore());

    db.workouts = models.workouts.restore();
    db.workout = models.workout.restore(db);


    await models.session.start();
    await models.session.restore(db);
    xf.dispatch('workout:restore');

    const sound = Sound({volume: db.volume});
    sound.start();

    // TRAINER MOCK
    // trainerMock.init();
});

function start () {
    console.log('start db');
    xf.dispatch('db:start');
}

start();

export { db };
