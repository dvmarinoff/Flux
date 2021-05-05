import { xf, exists, equals, rand } from '../functions.js';
import { models } from './models/models.js';

let db = {
    // Data Screen
    power: models.power.default,
    heartRate: models.heartRate.default,
    cadence: models.cadence.default,
    speed: models.speed.default,
    distance: 0,

    // Targets
    powerTarget: models.powerTarget.default,
    resistanceTarget: models.resistanceTarget.default,
    slopeTarget: models.slopeTarget.default,

    mode: models.mode.default,
    page: models.page.default,

    // Profile
    ftp: models.ftp.default,
    weight: models.weight.default,
    theme: models.theme.default,
    measurement: models.measurement.default,

    // Workouts
    workouts: [],
    workout: models.workout.default,

    // Recording
    records: [],
    lap: [],
    laps: [],
    lapStartTime: Date.now(),
    timestamp: Date.now(),
    inProgress: false,

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
};

xf.create(db);

// Data Screen
xf.reg(models.heartRate.prop, (heartRate, db) => {
    db.heartRate = heartRate;
});

xf.reg(models.power.prop, (power, db) => {
    db.power = power;
});

xf.reg(models.cadence.prop, (cadence, db) => {
    db.cadence = cadence;
});

xf.reg(models.speed.prop, (speed, db) => {
    db.speed = speed;
});

// Pages
xf.reg('ui:page-set', (page, db) => {
    db.page = models.page.set(page);
});

// Modes
xf.reg('ui:mode-set', (mode, db) => {
    db.mode = models.mode.set(mode);
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

// Wake Lock
xf.reg('lock:beforeunload', (e, db) => {
    // backup session
});
xf.reg('lock:release', (e, db) => {
    // backup session
});

// Workouts
xf.reg('workout', (workout, db) => {
    db.workout = models.workout.set(workout);
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


//
xf.reg('app:start', (_, db) => {

    db.ftp = models.ftp.restore();
    db.weight = models.weight.restore();
    db.theme = models.theme.restore();
    db.measurement = models.measurement.restore();

    db.workout = models.workout.restore();
});


class TrainerMock {
    constructor() {
        this.powerTarget = 180;
        this.init();
    }
    init() {
        const self = this;

        xf.sub('db:powerTarget', self.onPowerTarget.bind(self));
        xf.sub('ui:workoutStart', self.run.bind(self));
        xf.sub('ui:watchPause', self.stop.bind(self));

        console.warn('Trainer Mock Data is ON!');
    }
    run() {
        const self = this;
        self.interval = self.broadcast(self.indoorBikeData.bind(self));
    }
    stop() {
        const self = this;
        clearInterval(self.interval);
    }
    broadcast(handler) {
        const interval = setInterval(handler, 1000);
        return interval;
    }
    indoorBikeData() {
        const self = this;
        xf.dispatch('power', self.power(self.powerTarget));
        xf.dispatch('speed', self.speed(20));
        xf.dispatch('cadence', self.cadence(80));
    }
    onPowerTarget(powerTarget) {
        this.powerTarget = powerTarget;
    }
    power(prev) {
        return prev + rand(-4, 4);
    }
    cadence(prev) {
        return prev + rand(-3, 3);
    }
    speed(prev) {
        return prev + rand(-0.1, 0.1);
    }
}

const tm = new TrainerMock();

export { db };
