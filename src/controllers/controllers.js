import { xf, exists, empty, first } from '../functions.js';
import { Hrm } from '../ble/hrm.js';
import { Controllable } from '../ble/controllable.js';
import '../gps.js';

function start() {
    console.log(`start controllers`);

    const controllable = new Controllable();
    const hrm = new Hrm();
}

start();
