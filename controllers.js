import { xf } from './xf.js';
import { File } from './file.js';

function DeviceController(args) {
    let controllable = args.controllable;
    let hrb          = args.hrb;
    let watch        = args.watch;

    xf.sub('db:targetPwr', e => {
        let targetPwr = e.detail.data.targetPwr;
        controllable.setTargetPower(targetPwr);
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

function FileController() {

    xf.sub('db:workoutFile', e => {
        let workoutFile = e.detail.data.workoutFile;
        let fileHandler = new File();
        fileHandler.readFile(workoutFile);
    });
}

function WorkoutController() {
}

export { DeviceController, FileController };
