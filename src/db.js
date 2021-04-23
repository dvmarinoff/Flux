import { xf, exists, equals, prn } from '../functions.js';
import { models } from './models/models.js';

let db = {
    power: models.power.default,
    heartRate: models.heartRate.default,
    cadence: models.cadence.default,
    speed: models.speed.default,

    powerTarget: models.powerTarget.default,
    resistanceTarget: models.resistanceTarget.default,
    slopeTarget: models.slopeTarget.default,

    mode: models.mode.default,
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


// Modes
xf.reg('ui:mode-set', (mode, db) => {
    db.mode = models.mode.set(mode);
    console.log(mode);
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
    db.resistanceTarget = db.resistanceTarget;
});
xf.reg('ui:resistance-target-inc', (_, db) => {
    db.resistanceTarget = models.resistanceTarget.inc(db.resistanceTarget);
});
xf.reg(`ui:resistance-target-dec`, (_, db) => {
    db.resistanceTarget = models.resistanceTarget.dec(db.resistanceTarget);
});

xf.reg('ui:slope-target-set', (slopeTarget, db) => {
    db.slopeTarget = db.slopeTarget;
});
xf.reg('ui:slope-target-inc', (_, db) => {
    db.slopeTarget = models.slopeTarget.inc(db.slopeTarget);
});
xf.reg(`ui:slope-target-dec`, (_, db) => {
    db.slopeTarget = models.slopeTarget.dec(db.slopeTarget);
});



//
xf.sub('app:start', _ => {
    for(let model of models) {
        model.restore();
    }
});

export { db };
