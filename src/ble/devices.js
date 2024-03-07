import { xf, print, } from '../functions.js';
import FTMS from './ftms/ftms.js';
import FEC from './fec/fec.js';
import WCPS from './wcps/wcps.js';
import CPS from './cps/cps.js';
import CSCS from './cscs/cscs.js';
import HRS from './hrs/hrs.js';
import Connectable from './connectable.js';
import { webBle, uuids } from './web-ble.js';
import { Device, Status, } from './enums.js';

// const controllabe = Connectable({
//     filter: webBle.filters.controllable(),
//     onData,
// });

const heartRateMonitor = Connectable({
    filter: webBle.filters.hrm(),
    onData,
});

const powerMeter = Connectable({
    filter: webBle.filters.powerMeter(),
    onData,
});

const speedCadenceSensor = Connectable({
    filter: webBle.filters.speedCadenceSensor(),
    onData,
});

function Controllable() {
    const deviceType = Device.controllable;

    const connectable = Connectable({
        filter: webBle.filters.controllable(),
        onData,
        onConnecting,
        onConnected,
        onDisconnect,
    });

    xf.sub(`ui:ble:${deviceType}:switch`, async () => {
        if(connectable.isConnected()) {
            connectable.disconnect();
        } else {
            connectable.connect({requesting: true});
        }
    });

    function onConnecting() {
        xf.dispatch(`ble:${deviceType}:connecting`);
    }

    function onConnected() {
        xf.dispatch(`ble:${deviceType}:connected`);
        xf.dispatch(`ble:${deviceType}:name`, connectable.getName());
    }

    function onDisconnect() {
        xf.dispatch(`ble:${deviceType}:disconnected`);
        xf.dispatch(`ble:${deviceType}:name`, '--');
    }
}

const controllable = Controllable();


let t0 = performance.now();
let t1;

function onData(data) {
    if('power' in data) {

        t1 = performance.now();
        print.log(`diff: ${t1 - t0} power ${data.power} cadence: ${data.cadence}`);
        t0 = t1;
        xf.dispatch(`power`, data.power);
    }

    if('cadence' in data) {
        xf.dispatch(`cadence`, data.cadence);
    }

    if('speed' in data) {
        // xf.dispatch(`speed`, models.speed.kmhToMps(data.speed));
        xf.dispatch(`speed`, data.speed);
    }

    if('heartRate' in data) {
        xf.dispatch(`heartRate`, data.heartRate);
    }

    if(('currentSaturatedHemoglobin' in data)) {
        xf.dispatch(`smo2`, data.currentSaturatedHemoglobin);
    }

    if(('totalHemoglobinSaturation' in data)) {
        xf.dispatch(`thb`, data.totalHemoglobinSaturation);
    }
}

// export {
//     controllabe,
//     heartRateMonitor,
//     powerMeter,
//     speedCadenceSensor,
// };

