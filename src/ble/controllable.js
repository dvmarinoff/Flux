import { xf, isObject, equals, exists } from '../functions.js';
import { ble } from './web-ble.js';
import { uuids } from './uuids.js';
import { Device } from './device.js';
import { DeviceInformationService } from './dis/dis.js';
import { FitnessMachineService } from './ftms/ftms.js';
import { FEC } from './fec/fec.js';
import { models } from '../models/models.js';

class Controllable extends Device {
    defaultId() { return `ble:controllable`; }
    defaultFilter() { return ble.requestFilters.controllable; }
    postInit(args) {
        const self = this;

        let mode = 'erg';
        xf.sub(`db:mode`, value => mode = value);

        xf.sub('db:powerTarget', power => {
            if(self.isConnected(self.device) && (equals(mode, 'erg'))) {
                self.control.setTargetPower(power);
            }
        });
        xf.sub('db:resistanceTarget', resistance => {
            if(self.isConnected(self.device)) self.control.setTargetResistance(resistance);
        });

        xf.sub('db:slopeTarget', slope => {
            if(self.isConnected(self.device) && (equals(mode, 'slope'))) {
                if(self.isConnected(self.device)) self.control.setTargetSlope(slope);
            }
        });
    }
    async initServices(device) {
        const self = this;

        self.dis = await self.deviceInformation(device);
        self.control = await self.controlService(device, false);
    }
    async deviceInformation(device) {
        const self = this;
        const dis = new DeviceInformationService({
            ble:    ble,
            onInfo: onControllableInfo,
            ...device
        });

        if(ble.hasService(device, uuids.deviceInformation)) {
            await dis.init();
        }

        return dis;
    }
    async controlService(device) {
        const self = this;
        if(ble.hasService(device, uuids.fitnessMachine)) {
            const ftms = new FitnessMachineService({
                ble:      ble,
                onStatus: onFitnessMachineStatus,
                onData:   onIndoorBikeData.bind(self),
                ...device
            });
            await ftms.init();

            return ftms;
        }
        if(ble.hasService(device, uuids.fec)) {
            const fec = new FEC({
                ble:    ble,
                onData: onIndoorBikeData.bind(self),
                ...device});
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

export { Controllable };
