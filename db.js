import { avgOfArray, maxOfArray, sum,
         first, last, round,
         mps, kph, timeDiff } from './functions.js';
import { Encode } from './fit.js';
import { FileHandler } from './file.js';
import { xf, DB } from './xf.js';

let db = DB({
    pwr: 0,
    hr:  0,
    cad: 0,
    spd: 0,
    distance: 0,
    elapsed: 0,
    lapTime: 0,

    targetPwr: 0,
    resistanceTarget: 0,
    slopeTarget: 0,

    records: [],
    lap:     [],
    laps:    [],
    lapStartTime: Date.now(),
    workoutIntervalIndex: 0,
    timestamp: Date.now(),
    inProgress: false,

    ftp: 0,
    weight: 0,

    workout:  [],
    workoutFile: '',
    workouts: [],

    points: [],

    controllableFeatures: {},
});
xf.reg('device:hr',      x => db.hr  = x);
xf.reg('device:pwr',     x => db.pwr = x);
xf.reg('device:spd',     x => db.spd = x);
xf.reg('device:cad',     x => db.cad = x);
xf.reg('device:dist',    x => db.distance = x);
xf.reg('watch:started',  x => db.lapStartTime = Date.now());
xf.reg('watch:elapsed',  x => db.elapsed = x);
xf.reg('watch:lapTime',  x => db.lapTime = x);
xf.reg('ui:target-pwr',  x => db.targetPwr = x);
xf.reg('ui:ftp',         x => db.ftp = x);
xf.reg('storage:ftp',    x => db.ftp = x);
xf.reg('ui:weight',      x => db.weight = x);
xf.reg('storage:weight', x => db.weight = x);
xf.reg('ui:workoutFile', x => db.workoutFile = x);
xf.reg('ui:workout:set', x => db.workout = db.workouts[x]);
xf.reg('workout:add',    x => db.workouts.push(x));
xf.reg('watch:elapsed',  watchTime => {
    db.distance  += 1 * mps(db.spd);
    let record = { timestamp: Date.now(),
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
xf.reg('watch:nextWorkoutInterval', index => {
    db.workoutIntervalIndex = index;
});
xf.reg('watch:nextWorkoutStep', step => {
    let interval  = db.workoutIntervalIndex;
    let targetPwr = db.workout.intervals[interval].steps[step].power;
    db.workoutStepIndex = step;
    db.targetPwr  = targetPwr;
});
xf.sub('ui:activity:save', x => {
    let activity   = Encode({data: db.records, laps: db.laps});
    let fileHandler = new FileHandler();
    fileHandler.downloadActivity(activity);
});
xf.reg('ui:resistance-target', x => db.resistanceTarget = x);
xf.reg('ui:slope-target',      x => db.slopeTarget = x);
xf.reg('ui:tab', i => db.tab = i );
xf.reg('device:features', x => {
    console.log('controllable:features');
    db.controllableFeatures = x;
});

export { db };
