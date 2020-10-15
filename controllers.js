import { xf } from './xf.js';

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

    let reader = new FileReader();

    xf.sub('db:workoutFile', e => {
        let file = e.detail.data.workoutFile;
        reader.readAsText(file);
        reader.onload = _ => {
            let res = reader.result;
            console.log(res);
            xf.dispatch('file:workout', res);
        };
        reader.onerror = _ => {
            let err = reader.error;
            console.error(`Error reading local file: `);
            console.error(reader.error);
        };
    });
}

export { DeviceController, FileController };
