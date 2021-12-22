import { xf, isObject, equals, exists } from '../functions.js';
import { ble } from './web-ble.js';
import { uuids } from './uuids.js';
import { Device } from './device.js';
import { DeviceInformationService } from './dis/dis.js';
import { FitnessMachineService } from './ftms/ftms.js';
import { FEC } from './fec/fec.js';
import { models } from '../models/models.js';

class Controllable extends Device {
    defaultId()     { return `ble:controllable`; }
    defaultFilter() { return ble.requestFilters.controllable; }
    postInit(args) {
        const self = this;
        self.mode = 'erg';
    }
    async start(device) {
        const self = this;

        self.control = await self.controlService(device);
        // self.deviceInformation = await self.deviceInformation(device);

        xf.sub(`db:mode`,             self.onMode.bind(self));
        xf.sub('db:powerTarget',      self.onPowerTarget.bind(self));
        xf.sub('db:resistanceTarget', self.onResistanceTarget.bind(self));
        xf.sub('db:slopeTarget',      self.onSlopeTarget.bind(self));
    }
    onMode(mode) {
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
            if(self.isConnected(self.device)) self.control.setTargetSlope(slope);
        }
    }
    async controlService() {
        const self = this;

        if(ble.hasService(self.services, uuids.fitnessMachine)) {
            const ftms = new FitnessMachineService({
                onStatus: onFitnessMachineStatus,
                onData:   onIndoorBikeData.bind(self),
                services: self.services,
                server:   self.server,
                ble,
            });
            await ftms.start();

            return ftms;
        }
        if(ble.hasService(self.services, uuids.fec)) {
            const fec = new FEC({
                onData:   onIndoorBikeData.bind(self),
                services: self.services,
                server:   self.server,
                ble,
            });
            await fec.init();

            return fec;
        }

        console.warn(`no FTMS or FE-C over BLE found on device ${device.device.name}`, device);

        return {
            setTargetPower:      ((x) => x),
            setTargetResistance: ((x) => x),
            setTargetSlope:      ((x) => x)
        };
    }
    async deviceInformation(device) {
        const self = this;
        const dis = new DeviceInformationService({
            ble:    ble,
            onInfo: onControllableInfo,
            ...device
        });

        if(ble.hasService(device, uuids.deviceInformation)) {
            await dis.start();
        }

        return dis;
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
    if(exists(value.heartRate) && models.sources.isSource('heartRate', self.id)) {
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
}

function onFitnessMachineControlPoint(value) {
}

export {
    Controllable
};

