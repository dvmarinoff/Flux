import 'regenerator-runtime/runtime';
import { dom } from './dom.js';
import { Device, Hrb, Controllable } from './ble/device.js';
import { avgOfArray } from './functions.js';
import { parseZwo, intervalsToGraph } from './parser.js';
import { StopWatch } from './workout.js';
import { WakeLock } from './lock.js';
import { speedFromPower } from './speed.js';
import { workouts } from './workouts/workouts.js';
import { FitFileExample } from './fit.js';
import { ControllableConnectionView,
         HrbConnectionView,
         DataScreen,
         GraphHr,
         GraphPower,
         GraphWorkout,
         ControlView,
         LoadWorkoutView,
         WorkoutsView
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
    hr: 0,
    pwr: 0,
    pwrRecords: [],
    pwrAvgBuffer: [],
    spd: 0,
    vspd: 0,
    cad: 0,
    vdis: 0,
    ftp: 256,
    targetPwr: 100,
    elapsed: 0,
    lapTime: 0,
    timestamp: new Date(),
    laps: [],
    workout: [],
    workoutFile: '',
    workouts: [],
    fitMsgs:  [],
    darkMode: true,
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
xf.reg('device:hr',  e => db.hr  = e.detail.data);
xf.reg('device:pwr', e => {
    db.pwr = e.detail.data;
    db.pwrAvgBuffer.push(e.detail.data);
});
xf.reg('watch:elapsed', e => {
    let watchTime = e.detail.data;
    let timestamp = 0;
    let pwrAvg = 0;
    let powerSmoothInterval = 3;
    let powerRecordInterval = 1;

    if(watchTime % powerRecordInterval === 0) {
        pwrAvg = parseInt(avgOfArray(db.pwrAvgBuffer));
        timestamp = new Date();
        db.pwrRecords.push({pwr: pwrAvg, timestamp: timestamp});
        db.pwrAvgBuffer = [];
    }
    if(watchTime % powerSmoothInterval === 0) {}
});
xf.reg('device:spd', e => db.spd = e.detail.data);
xf.reg('device:cad', e => db.cad = e.detail.data);
xf.reg('watch:elapsed',  e => db.elapsed = e.detail.data);
xf.reg('watch:lapTime',  e => db.lapTime = e.detail.data);
xf.reg('watch:lap',      e => db.laps.push(e.detail.data));
xf.reg('ui:target-pwr',  e => db.targetPwr = e.detail.data);
xf.reg('ui:darkMode',    e => db.darkMode ? db.darkMode = false : db.darkMode = true);
xf.reg('ui:ftp',         e => db.ftp = e.detail.data);
xf.reg('ui:workoutFile', e => db.workoutFile = e.detail.data);
xf.reg('ui:workout:set', e => db.workout = db.workouts[e.detail.data]);
xf.reg('workout:add',    e => db.workouts.push(e.detail.data));
xf.reg('watch:nextWorkoutInterval', e => {
    let targetPwr = db.workout.intervals[e.detail.data].power;
    db.targetPwr = targetPwr;
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

    DeviceController({controllable: flux, watch: watch, hrb: hrb});
    FileController();
    WorkoutController();

    Screen();
    Vibrate({vibrate: false, long: false});

    // DataMock({hr: false, pwr: true});
    FitFileExample();
};

start();
