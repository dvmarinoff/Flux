import { equals, xf, print, } from '../functions.js';
import { models } from '../models/models.js';
import Connectable from './connectable.js';
import { webBle } from './web-ble.js';
import { Device, Status, ControlMode, } from './enums.js';

function ReactiveConnectable(args = {}) {
    const deviceType = args.deviceType ?? Device.generic;
    const filter = args.filter ?? webBle.filters.generic();
    const identifier = `ble:${deviceType}`;

    const connectable = Connectable({
        filter: webBle.filters.controllable(),
        onData,
        onConnecting,
        onConnected,
        onDisconnect,
    });

    function getIdentifier() {
        return identifier;
    }

    function onConnecting() {
        xf.dispatch(`ble:${deviceType}:connecting`);
    }

    function onConnected() {
        xf.dispatch(`${getIdentifier()}:connected`);
        xf.dispatch(`${getIdentifier()}:name`, connectable.getName());
    }

    function onDisconnect() {
        xf.dispatch(`${getIdentifier()}:disconnected`);
        xf.dispatch(`${getIdentifier()}:name`, '--');
    }

    function onData(data) {
        if('power' in data && models.sources.isSource('power', identifier)) {
            xf.dispatch(`power`, data.power);
        }

        if('cadence' in data && models.sources.isSource('cadence', identifier)) {
            xf.dispatch(`cadence`, data.cadence);
        }

        if('speed' in data && models.sources.isSource('speed', identifier)) {
            // xf.dispatch(`speed`, models.speed.kmhToMps(data.speed));
            xf.dispatch(`speed`, data.speed);
        }

        if('heartRate' in data && models.sources.isSource('heartRate', identifier)) {
            xf.dispatch(`heartRate`, data.heartRate);
        }

        if('currentSaturatedHemoglobin' in data) {
            xf.dispatch(`smo2`, data.currentSaturatedHemoglobin);
        }

        if('totalHemoglobinSaturation' in data) {
            xf.dispatch(`thb`, data.totalHemoglobinSaturation);
        }
    }

    async function onSwitch() {
        if(connectable.isConnected()) {
            connectable.disconnect();
        } else {
            connectable.connect({requesting: true});
        }
    }

    let mode = ControlMode.erg;
    function onMode(x) {
        mode = x;
    }

    function onUserWeight() {
    }

    function onPowerTarget(powerTarget) {
        connectable.trainer.control.setPowerTarget({power: powerTarget});
    }

    function onResistanceTarget(resistanceTarget) {
        connectable.trainer.control.setResistanceTarget({
            resistance: resistanceTarget,
        });
    }

    function onSlopeTarget(slopeTarget) {
        connectable.trainer.control.setSimulation({grade: slopeTarget});
    }

    let abortController;
    let signal;

    function start() {
        abortController = new AbortController();
        signal = { signal: abortController.signal };

        xf.sub(`ui:${getIdentifier()}:switch`,onSwitch, signal);

        if(equals(deviceType, Device.controllable)) {
            xf.sub('db:mode',             onMode, signal);
            xf.sub('db:weight',           onUserWeight, signal);
            xf.sub('db:powerTarget',      onPowerTarget, signal);
            xf.sub('db:resistanceTarget', onResistanceTarget, signal);
            xf.sub('db:slopeTarget',      onSlopeTarget, signal);
        }
    }

    function stop() {
        abortController.abort();
    }

    start();

    return Object.freeze({
        getIdentifier,
        start,
        stop,
    });
}

export default ReactiveConnectable;

