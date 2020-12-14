import 'regenerator-runtime/runtime';

import { db } from './db.js';
import { dom } from './dom.js';
import { xf, DB } from './xf.js';
import { Hrb } from './ble/hrb.js';
import { Controllable } from './ble/controllable.js';
import { FileHandler } from './file.js';
import { StopWatch } from './workout.js';
import { WakeLock } from './lock.js';
import { workouts } from './workouts/workouts.js';
import { Storage } from './storage.js';
import { ControllableConnectionView,
         HrbConnectionView,
         ControllableSettingsView,
         HrbSettingsView,
         DataScreen,
         GraphHr,
         GraphPower,
         GraphWorkout,
         ControlView,
         WatchView,
         LoadWorkoutView,
         WorkoutsView,
         ActivityView,
         NavigationWidget,
         SettingsView,
       } from './views.js';
import { DeviceController,
         FileController,
         WorkoutController,
         Screen,
         Vibrate } from './controllers.js';
import { DataMock } from './test/mock.js';


'use strict';

function start() {
    let hrb   = new Hrb({name: 'hrb'});
    let flux  = new Controllable({name: 'controllable'});
    let watch = new StopWatch();
    let lock  = new WakeLock();

    ControllableConnectionView({dom: dom.controllableConnectionScreen});
    HrbConnectionView({dom: dom.hrbConnectionScreen});

    ControllableConnectionView({dom: dom.controllableSettings});
    HrbConnectionView({dom: dom.hrbSettings});

    ControllableSettingsView({dom: dom.controllableSettings, name: 'controllable'});
    HrbSettingsView({dom: dom.hrbSettings, name: 'hrb'});

    DataScreen({dom: dom.datascreen});
    GraphPower({dom: dom.graphPower});
    GraphWorkout({dom: dom.graphWorkout});

    WatchView({dom: dom.watch});
    ControlView({dom: dom.controls});
    LoadWorkoutView({dom: dom.file});
    WorkoutsView({dom: dom.workouts, workouts: workouts});
    ActivityView({dom: dom.activity});
    NavigationWidget({dom: dom.navigation});
    SettingsView({dom: dom.settings});

    DeviceController({controllable: flux, watch: watch, hrb: hrb});
    FileController();
    WorkoutController();

    Screen();
    // Session();
    let storage = new Storage();

    xf.dispatch('app:start');

    // Vibrate({vibrate: true, long: false});
    // DataMock({hr: true, pwr: true});
};

start();
