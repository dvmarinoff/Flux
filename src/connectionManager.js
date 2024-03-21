import { Hrm } from './ble/hrm.js';
import { Controllable } from './ble/controllable.js';
import { PowerMeter } from './ble/power-meter.js';
import { SpeedCadence } from './ble/speed-cadence.js';
import { MoxyMonitor } from './ble/moxy-monitor.js';
import { Hrm as AntHrm } from './ant/devices.js';
import { Controllable as AntControllable } from './ant/devices.js';
import { xf } from './functions.js';
import { driver as antDriver } from './ant/driver.js';

function start() {
    console.log(`start stable version`);

    const controllable = new Controllable();
    const hrm = new Hrm();
    const pm = new PowerMeter();
    const speedCadence = new SpeedCadence();
    const moxyMonitor  = new MoxyMonitor();

    antDriver.init();

    let antHrm;
    let antControllable;

    xf.sub('ant:driver:ready', function() {
        antHrm = AntHrm();
        antControllable = AntControllable();

        antHrm.start();
        antControllable.start();
    });
}

start();
