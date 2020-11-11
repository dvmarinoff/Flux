import 'regenerator-runtime/runtime';

import { dom } from './dom.js';
import { Device, Hrb, Controllable } from './ble/device.js';
import { parseZwo, intervalsToGraph } from './parser.js';
import { Encode } from './fit.js';
import { FileHandler } from './file.js';
import { StopWatch } from './workout.js';
import { WakeLock } from './lock.js';
import { speedFromPower } from './speed.js';
import { workouts } from './workouts/workouts.js';
import { avgOfArray,
         maxOfArray,
         sum,
         mps,
         kph,
         first,
         last,
         round,
         timeDiff } from './functions.js';
import { ControllableConnectionView,
         HrbConnectionView,
         DataScreen,
         GraphHr,
         GraphPower,
         GraphWorkout,
         ControlView,
         LoadWorkoutView,
         WorkoutsView,
         ActivityView,
         NavigationWidget
       } from './views.js';
import { DeviceController,
         FileController,
         WorkoutController,
         Screen,
         Vibrate } from './controllers.js';
import { DataMock } from './test/mock.js';
import { xf, DB } from './xf.js';



'use strict';


let db = DB({
    hr:  0,
    pwr: 0,
    cad: 0,
    spd: 0,
    distance: 0,
    records: [],
    lap:     [],
    laps:    [],
    lapStartTime: Date.now(),
    workoutIntervalIndex: 0,
    elapsed: 0,
    lapTime: 0,
    targetPwr: 100,
    ftp: 256,
    timestamp: Date.now(),
    workout:  [],
    workoutFile: '',
    workouts: [],
    darkMode: true,
    vspd: 0,
    vdis: 0,
    env: {
        riderWeight: 73,
        bikeWeight: 7.7,
        totalWeight: 80.7,
        cda: 0.3451,
        loss: 0,
        crr: 0.005,
        wind: 0,
        grade: 0,
        g: 9.8067,
        rho: 1.2251781195947158,
        temperature: 20,
        elevation: 100,
        airPressure: 1018,
        dewPoint: 7.5,
    }
});
xf.reg('device:hr',      e => db.hr  = e.detail.data);
xf.reg('device:pwr',     e => db.pwr = e.detail.data);
xf.reg('device:spd',     e => db.spd = e.detail.data);
xf.reg('device:cad',     e => db.cad = e.detail.data);
xf.reg('device:dist',    e => db.distance = e.detail.data);
xf.reg('watch:started',  e => db.lapStartTime = Date.now());
xf.reg('watch:elapsed',  e => db.elapsed = e.detail.data);
xf.reg('watch:lapTime',  e => db.lapTime = e.detail.data);
xf.reg('ui:target-pwr',  e => db.targetPwr = e.detail.data);
xf.reg('ui:darkMode',    e => db.darkMode ? db.darkMode = false : db.darkMode = true);
xf.reg('ui:ftp',         e => db.ftp = e.detail.data);
xf.reg('ui:workoutFile', e => db.workoutFile = e.detail.data);
xf.reg('ui:workout:set', e => db.workout = db.workouts[e.detail.data]);
xf.reg('workout:add',    e => db.workouts.push(e.detail.data));
xf.reg('watch:elapsed',  e => {
    let watchTime = e.detail.data;
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
xf.reg('watch:lap', e => {
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
xf.reg('watch:nextWorkoutInterval', e => {
    let index = e.detail.data;
    // let targetPwr = db.workout.intervals[index].power;
    db.workoutIntervalIndex = index;
    // db.targetPwr = targetPwr;
});
xf.reg('watch:nextWorkoutStep', e => {
    let step      = e.detail.data;
    let interval  = db.workoutIntervalIndex;
    let targetPwr = db.workout.intervals[interval].steps[step].power;
    db.workoutStepIndex = step;
    db.targetPwr  = targetPwr;
});
xf.sub('ui:activity:save', e => {
    let activity   = Encode({data: db.records, laps: db.laps});
    let fileHndler = new FileHandler();
    fileHndler.downloadActivity(activity);
});
xf.sub('ui:tab', e => {
    let i = e.detail.data;
    db.tab = i;
});


function start() {
    let hrb   = new Hrb({name: 'hrb'});
    let flux  = new Controllable({name: 'controllable'});
    let watch = new StopWatch();
    let lock  = new WakeLock();

    ControllableConnectionView({dom: dom.controllableConnectionScreen});
    HrbConnectionView({dom: dom.hrbConnectionScreen});

    DataScreen({dom: dom.datascreen});
    GraphPower({dom: dom.graphPower});
    GraphWorkout({dom: dom.graphWorkout});

    ControlView({dom: dom.controlscreen});
    LoadWorkoutView({dom: dom.file});
    WorkoutsView({dom: dom.workouts, workouts: workouts});
    ActivityView({dom: dom.activity});
    NavigationWidget({dom: dom.navigation});

    DeviceController({controllable: flux, watch: watch, hrb: hrb});
    FileController();
    WorkoutController();

    Screen();
    // Vibrate({vibrate: true, long: false});

    // DataMock({hr: true, pwr: true});
};

start();
