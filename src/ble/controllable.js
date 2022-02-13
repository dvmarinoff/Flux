import { xf, isObject, equals, exists, existance, debounce } from '../functions.js';
import { ble } from './web-ble.js';
import { uuids } from './uuids.js';
import { Device } from './device.js';
import { DeviceInformationService } from './dis/dis.js';
import { FitnessMachineService } from './ftms/ftms.js';
import { WahooCyclingPower } from './wcps/wcps.js';
import { FEC } from './fec/fec.js';
import { models } from '../models/models.js';

class Controllable extends Device {
    defaultId() {
        return `ble:controllable`;
    }
    defaultFilter() {
        return ble.requestFilters.controllable;
    }
    async start(device) {
        const self = this;
        self.mode       = models.mode.state;
        self.userWeight = models.weight.state;

        // services
        self.control = await self.controlService(device);
        self.user    = await self.userService(device);

        // events
        const wait = existance(self.control.wait, 500);
        const options = self.signal;;

        self.debounced = {
            onPowerTarget: debounce(
                self.onPowerTarget.bind(self), wait, {trailing: true, leading: true}
            ),
            onResistanceTarget: debounce(
                self.onResistanceTarget.bind(self), wait, {trailing: true, leading: true}
            ),
            onSlopeTarget: debounce(
                self.onSlopeTarget.bind(self), wait, {trailing: true, leading: true}
            ),
        };

        xf.sub('db:mode',             self.onMode.bind(self), options);
        xf.sub('db:weight',           self.onUserWeight.bind(self), options);
        xf.sub('db:powerTarget',      self.debounced.onPowerTarget.bind(self), options);
        xf.sub('db:resistanceTarget', self.debounced.onResistanceTarget.bind(self), options);
        xf.sub('db:slopeTarget',      self.debounced.onSlopeTarget.bind(self), options);
    }
    stop() {
        const self = this;
        self.control = {};
        self.user    = {};
        self.abortController.abort();
    }
    onMode(mode) {
        const self = this;
        self.mode = mode;
    }
    onUserWeight(weight) {
        const self = this;
        self.userWeight = weight;

        if(exists(self.user.setUserWeight)) {
            self.user.setUserWeight(self.userWeight);
        }
    }
    async onPowerTarget(power) {
        const self = this;
        if(self.isConnected(self.device) && (equals(self.mode, 'erg'))) {
            self.control.setTargetPower(power);
        }
    }
    onResistanceTarget(resistance) {
        const self = this;
        if(self.isConnected(self.device)) {
            self.control.setTargetResistance(resistance);
        }
    }
    onSlopeTarget(slope) {
        const self = this;
        if(self.isConnected(self.device) && (equals(self.mode, 'slope'))) {
            self.control.setTargetSlope(slope);
        }
    }
    async controlService() {
        const self = this;

        if(self.hasService(self.services, uuids.fitnessMachine)) {
            const service = await self.getService(uuids.fitnessMachine);
            const ftms = new FitnessMachineService({
                onStatus: onFitnessMachineStatus,
                onData:   onIndoorBikeData.bind(self),
                service,
                ble,
            });
            await ftms.start();

            return ftms;
        }
        if(self.hasService(self.services, uuids.fec)) {
            const service = await self.getService(uuids.fec);
            const fec = new FEC({
                controllable: self,
                onData: onIndoorBikeData.bind(self),
                service,
                ble,
            });
            await fec.start();

            return fec;
        }
        if(self.hasService(self.services, uuids.cyclingPower)) {
            const service = await self.getService(uuids.cyclingPower);
            const wcps = new WahooCyclingPower({
                controllable: self,
                onData: onIndoorBikeData.bind(self),
                service,
                ble,
            });
            await wcps.start();

            return wcps;
        }

        console.warn(`:controlService 'no FTMS, FE-C over BLE, or Wahoo CPS found on device ${self.device.name}'`);

        return {
            setTargetPower:      ((x) => x),
            setTargetResistance: ((x) => x),
            setTargetSlope:      ((x) => x)
        };
    }
    async userService() {
        const self = this;

        if(equals(self.control.protocol, 'ftms')) {
            // only 1 control service allowed else they conflict
        }
        if(equals(self.control.protocol, 'fec')) {
            // use fec
            return self.control;
        }
        if(equals(self.control.protocol, 'wcps')) {
            // use wcps
            return self.control;
        }

        console.warn(`:userService 'no compatible service found on device ${self.device.name}'`);

        return {
            setUserWeight: ((x) => x),
        };
    }
}

function onIndoorBikeData(value) {
    const self = this;

    if(exists(value.power) && models.sources.isSource('power', self.id)) {
        xf.dispatch(`power`, value.power);
    };
    if(exists(value.cadence) && models.sources.isSource('cadence', self.id)) {
        xf.dispatch(`cadence`, value.cadence);
    };
    if(exists(value.speed) && models.sources.isSource('speed', self.id)) {
        xf.dispatch(`speed`, value.speed);
    };
    if(exists(value.heartRate) && models.sources.isSource('heartRate', self.id)
       && !equals(value.heartRate, 255)) {
        xf.dispatch(`heartRate`, value.heartRate);
    };
    if(exists(value.status) && models.sources.isSource('power', self.id)) {
        xf.dispatch(`${self.id}:fec:calibration`, value.status);
    }
}

function onControllableInfo(value) {
    console.log(`Fitness Machine Information: `, value);
}

function onFitnessMachineStatus(value) {
    return value;
}

function onFitnessMachineControlPoint(value) {
    return value;
}

export { Controllable };

