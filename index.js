import { dom } from './dom.js';
import { Device, Hrb, Controllable } from './ble/device.js';
import { parseZwo } from './parser.js';
import { StopWatch } from './workout.js';
import { WakeLock } from './lock.js';
import { speedFromPower } from './speed.js';
import { workouts } from './workouts/workouts.js';
import { ControllableConnectionView,
         HrbConnectionView,
         DataScreen,
         GraphHr,
         GraphPower,
         ControlView,
         LoadWorkoutView,
         WorkoutsView
       } from './views.js';
import { DeviceController,
         FileController,
         Vibrate } from './controllers.js';
import { DataMock } from './test/mock.js';
import { xf, DB } from './xf.js';



'use strict';


let db = DB({
    hr: [],
    pwr: [],
    spd: [],
    cad: [],
    vspd: [],
    vdis: 0,
    ftp: 256,
    targetPwr: 100,
    elapsed: 0,
    lapTime: 0,
    timestamp: new Date(),
    laps: [],
    workout: [],
    workoutFile: '',
    workouts: {},
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
    let newTimestamp = new Date();
    let oldTimestamp = db.timestamp;
    let time = (newTimestamp.getTime() - oldTimestamp.getTime()) / 1000;
    db.timestamp = newTimestamp;
    db.pwr = e.detail.data;
    db.vspd = speedFromPower(e.detail.data, db.env);
    db.vdis += parseInt((db.vspd / 3.6) * time);
    console.log(time);
});
xf.reg('device:spd', e => db.spd = e.detail.data);
xf.reg('device:cad', e => db.cad = e.detail.data);
xf.reg('ui:target-pwr',  e => db.targetPwr = e.detail.data);
xf.reg('ui:darkMode',    e => db.darkMode ? db.darkMode = false : db.darkMode = true);
xf.reg('ui:workoutFile', e => db.workoutFile = e.detail.data);
xf.reg('watch:elapsed',  e => db.elapsed = e.detail.data);
xf.reg('watch:lapTime',  e => db.lapTime = e.detail.data);
xf.reg('watch:lap',      e => db.laps.push(e.detail.data));
xf.reg('file:workout',   e => {
    let workout = e.detail.data;
    let ftp = db.ftp;
    workout = parseZwo(workout); // move parsing out
    workout.forEach( x => x.power = Math.round(ftp * x.power));
    console.log(workout);
    db.workout = workout;
});

xf.reg('watch:nextWorkoutInterval', e => {
    let targetPwr = db.workout[e.detail.data].power;
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
    // GraphHr({dom: dom.graphHr});

    ControlView({dom: dom.controlscreen});
    LoadWorkoutView({dom: dom.file});
    WorkoutsView({dom: dom.workouts, workouts: workouts});

    DeviceController({controllable: flux, watch: watch, hrb: hrb});
    FileController();

    Vibrate({vibrate: false, long: false});

    // DataMock({hr: false, pwr: true});

    // Default Workout:
    xf.dispatch('file:workout', workouts[0].xml);
};

start();
