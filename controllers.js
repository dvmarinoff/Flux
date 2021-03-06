import { xf } from './xf.js';
import { FileHandler } from './file.js';
import { workouts } from './workouts/workouts.js';
import { zwo, intervalsToGraph } from './workouts/parser.js';
import { RecordedData, RecordedLaps } from './test/mock.js';

function DeviceController(args) {
    let controllable = args.controllable;
    let hrb          = args.hrb;
    let powerMeter   = args.powerMeter;
    let watch        = args.watch;
    let mode         = 'erg';

    xf.sub('db:mode', m => { mode = m; });

    xf.sub('db:powerTarget', power => {
        if(mode === 'erg') {
            controllable.setPowerTarget(power);
        }
    });
    xf.sub('db:resistanceTarget', target => {
        let resistance = target;
        resistance = parseInt(resistance);
        controllable.setResistanceTarget(resistance);
    });
    xf.sub('db:slopeTarget', target => {
        let slope = target;
        slope *= 100;
        slope = parseInt(slope);
        controllable.setSlopeTarget({grade: slope});
    });
    xf.sub('ui:workoutStart', e => { watch.startWorkout();   });
    xf.sub('ui:watchStart',   e => { watch.start();          });
    xf.sub('workout:restore', e => { watch.restoreWorkout(); });
    xf.sub('ui:watchPause',   e => { watch.pause();          });
    xf.sub('ui:watchResume',  e => { watch.resume();         });
    xf.sub('ui:watchLap',     e => { watch.lap();            });
    xf.sub('ui:watchStop',    e => {
        const stop = confirm('Confirm Stop?');
        if(stop) {
            watch.stop();
        }
    });

    xf.sub('ui:controllable:switch', e => {
        if(controllable.device.connected) {
            controllable.disconnect();
        } else {
            controllable.connect();
        }
    });

    xf.sub('ui:hrb:switch', e => {
        if(hrb.device.connected) {
            hrb.disconnect();
        } else {
            hrb.connect();
        }
    });

    xf.sub('ui:pm:switch', e => {
        if(powerMeter.isConnected()) {
            powerMeter.disconnect();
        } else {
            powerMeter.connect();
        }
    });
}

function FileController() {

    xf.sub('db:workoutFile', workoutFile => {
        let fileHandler = new FileHandler();
        fileHandler.readFile(workoutFile);
    });
}

function WorkoutController() {
    let ftp = 80;
    let index = 0;
    let workout = {};

    xf.reg('db:ftp', e => {
        ftp = e.ftp;
        xf.dispatch('workouts:init', workouts); // ??
        xf.dispatch('ui:workout:set', 0);       // ??
    });

    xf.reg('file:upload:workout', e => {
        let graph   = ``;
        let xml     = e;
        let workout = zwo.parse(xml);

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
        let workoutFiles = e;
        workoutFiles.forEach( w => {
            let workout = zwo.parse(w.xml);
            workout.intervals.forEach( interval => {
                interval.steps.forEach( step => {
                    if(step.power >= 10) {
                        step.power = step.power; // abs power
                    } else {
                        step.power = Math.round(ftp * step.power); // % FTP power
                    }
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
}

export { DeviceController, FileController, WorkoutController };
