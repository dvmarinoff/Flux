import { Hrm } from '../ble/hrm.js';
import { Controllable } from '../ble/controllable.js';
import { PowerMeter } from '../ble/power-meter.js';
import { SpeedCadence } from '../ble/speed-cadence.js';
import { Controllable as FEC } from '../ant/controllable.js';
import { Hrm as AntHrm } from '../ant/hrm.js';

function start() {
    console.log(`start connection manager`);

    const controllable = new Controllable();
    const hrm = new Hrm();
    const pm = new PowerMeter();
    const speedCadence = new SpeedCadence();

    const fec = new FEC();
    const antHrm = new AntHrm();
}

start();
