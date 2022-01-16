import { xf, isObject, equals, exists } from '../functions.js';
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
    postInit(args) {
        const self = this;
        self.mode = 'erg';

        xf.sub('db:mode',             self.onMode.bind(self));
        xf.sub('db:powerTarget',      self.onPowerTarget.bind(self));
        xf.sub('db:resistanceTarget', self.onResistanceTarget.bind(self));
        xf.sub('db:slopeTarget',      self.onSlopeTarget.bind(self));
    }
    async start(device) {
        const self = this;
        self.control = await self.controlService(device);
    }
    stop() {
        const self = this;
        self.control = {};
    }
    onMode(mode) {
        const self = this;
        self.mode = mode;
    }
    onPowerTarget(power) {
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
                onData: onIndoorBikeData.bind(self),
                service,
                ble,
            });
            await wcps.start();

            return wcps;
        }

        console.warn(`no FTMS, FE-C over BLE, or Wahoo CPS found on device ${self.device.name}`, self.device);

        return {
            setTargetPower:      ((x) => x),
            setTargetResistance: ((x) => x),
            setTargetSlope:      ((x) => x)
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

