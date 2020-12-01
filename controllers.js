import { xf } from './xf.js';
import { FileHandler } from './file.js';
import { workouts } from './workouts/workouts.js';
import { parseZwo, intervalsToGraph } from './parser.js';
import { RecordedData, RecordedLaps } from './test/mock.js';

function DeviceController(args) {
    let controllable = args.controllable;
    let hrb          = args.hrb;
    let watch        = args.watch;

    xf.sub('db:targetPwr', e => {
        let targetPwr = e.detail.data.targetPwr;
        controllable.setTargetPower(targetPwr);
    });
    xf.sub('db:resistanceTarget', e => {
        let resistance = e.detail.data.resistanceTarget;
        resistance *= 10;
        resistance = parseInt(resistance);
        controllable.setTargetResistanceLevel(resistance);
    });
    xf.sub('db:slopeTarget', e => {
        let slope = e.detail.data.slopeTarget;
        slope *= 100;
        slope = parseInt(slope);
        controllable.setSimulationParameters({grade: slope});
    });
    xf.sub('ui:watchStart',  e => { watch.start();  });
    xf.sub('ui:watchPause',  e => { watch.pause();  });
    xf.sub('ui:watchResume', e => { watch.resume(); });
    xf.sub('ui:watchLap',    e => { watch.lap();    });
    xf.sub('ui:watchStop',   e => { watch.stop();   });

    xf.sub('ui:controllableSwitch', e => {
        if(controllable.device.connected) {
            controllable.disconnect();
        } else {
            controllable.connect();
        }
    });

    xf.sub('ui:hrbSwitch', e => {
        if(hrb.device.connected) {
            hrb.disconnect();
        } else {
            hrb.connect();
        }
    });

    xf.sub('ui:workoutStart',  e => { watch.startWorkout();  });

}

function Vibrate(args) {
    let lapTime = 0;
    let vibrate = args.vibrate;
    let long = args.long;

    xf.reg('db:lapTime', e => {
        lapTime = e.detail.data.lapTime;

        if(vibrate) {
            if(lapTime === 3 && long) {
                window.navigator.vibrate([200, 800, 200, 800, 200, 800, 1000]);
            }
            if(lapTime === 0 && !long) {
                window.navigator.vibrate([250]);
            }
        }
    });
}

function Screen() {
    window.addEventListener('orientationchange', e => {
        xf.dispatch('screen:change', e.target);
    });
    window.addEventListener('resize', e => {
        xf.dispatch('screen:change', e.target);
    });
}

function FileController() {

    xf.sub('db:workoutFile', e => {
        let workoutFile = e.detail.data.workoutFile;
        let fileHandler = new FileHandler();
        fileHandler.readFile(workoutFile);
    });
}

function WorkoutController() {
    let ftp = 80;
    let index = 0;
    let workout = {};

    xf.reg('db:ftp', e => {
        ftp = e.detail.data.ftp;
        xf.dispatch('workouts:init', workouts);
        xf.dispatch('ui:workout:set', 0);
    });

    xf.reg('file:upload:workout', e => {
        let graph   = ``;
        let xml     = e.detail.data;
        let workout = parseZwo(xml);

        workout.intervals.forEach( interval => {
            interval.steps.forEach( step => {
                step.power = Math.round(ftp * step.power);
            });
        });

        workout.id = index;
        if(workout.name === '' || workout.name === undefined) {
            workout.name = `Custom ${index}`;
        }
        if(workout.type === '' || workout.type === undefined) {
            workout.type = 'Custom';
        }
        if(workout.description === '' || workout.description === undefined) {
            workout.description = 'Custom workout';
        }
        workout.xml   = xml;
        workout.graph = intervalsToGraph(workout.intervals, ftp);
        xf.dispatch('workout:add', workout);
        index += 1;
    });

    xf.reg('workouts:init', e => {
        let workoutFiles = e.detail.data;
        workoutFiles.forEach( w => {
            let workout = parseZwo(w.xml);
            workout.intervals.forEach( interval => {
                interval.steps.forEach( step => {
                    step.power = Math.round(ftp * step.power);
                });
            });
            let graph  = intervalsToGraph(workout.intervals, ftp);
            w.intervals = workout.intervals;
            w.id = index;
            w.graph = graph;
            xf.dispatch('workout:add', w);
            index += 1;
        });
    });

    //Set defaults and init the build in collection:
    // xf.dispatch('ui:ftp', 256);
}

export { DeviceController, FileController, WorkoutController, Screen, Vibrate };
