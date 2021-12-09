import { uuids } from '../uuids.js';
import { indoorBikeData } from './indoor-bike-data.js';
import { control } from './control-point.js';
import { status } from './fitness-machine-status.js';

import { feature } from './fitness-machine-feature.js';

import { supported } from './supported-ranges.js';

import { equals, exists, existance, first } from '../../functions.js';

function eventToValue(decoder, callback) {
    return function (e) {
        return callback(decoder(e.target.value));
    };
}

function findCharacteristic(list, uuid) {
    return first(list.filter(x => equals(x.uuid, uuid)));
}

class FitnessMachineService {
    uuid = uuids.fitnessMachine;

    constructor(args = {}) {
        this.ble       = existance(args.ble);
        this.device    = existance(args.device);
        this.server    = existance(args.server);
        this.onData    = existance(args.onData,    ((x) => x));
        this.onStatus  = existance(args.onStatus,  this.defaultOnStatus);
        this.onControl = existance(args.onControl, this.defaultOnControlPoint);

        this.characteristics = {
            fitnessMachineFeature: {
                uuid: uuids.fitnessMachineFeature,
                supported: false,
                characteristic: undefined,
            },
            supportedPowerRange: {
                uuid: uuids.supportedPowerRange,
                supported: false,
                characteristic: undefined,
            },
            supportedResistanceLevelRange: {
                uuid: uuids.supportedResistanceLevelRange,
                supported: false,
                characteristic: undefined,
            },
            fitnessMachineStatus: {
                uuid: uuids.fitnessMachineStatus,
                supported: false,
                characteristic: undefined,
            },
            fitnessMachineControlPoint: {
                uuid: uuids.fitnessMachineControlPoint,
                supported: false,
                characteristic: undefined,
            },
            indoorBikeData: {
                uuid: uuids.indoorBikeData,
                supported: false,
                characteristic: undefined,
            },
        };
    }

    async init() {
        const self = this;
        self.service = await self.ble.getService(self.server, self.uuid);

        await self.getCharacteristics(self.service);
        self.features = await self.getFeatures();

        if(self.supported('fitnessMachineStatus')) {
            self.sub('fitnessMachineStatus', status.decode, self.onStatus);
        }

        if(self.supported('indoorBikeData')) {
            self.sub('indoorBikeData', indoorBikeData.decode, self.onData);
        }

        if(self.supported('fitnessMachineControlPoint')) {
            await self.sub('fitnessMachineControlPoint', control.response.decode, self.onControl);
        }

        await self.requestControl();
    }
    characteristic(key) {
        const self = this;
        if(exists(self.characteristics[key])) {
            return self.characteristics[key].characteristic;
        }
        return undefined;
    }
    supported(key) {
        const self = this;
        if(exists(self.characteristics[key])) {
            return self.characteristics[key].supported;
        }
        return false;
    }
    async getFeatures(service) {
        const self = this;
        const characteristic = self.characteristic('fitnessMachineFeature');
        const { value }      = await self.ble.readCharacteristic(characteristic);
        const features       = feature.decode(value);

        console.log(':rx :feature ', JSON.stringify(features));

        return features;
    }
    async getCharacteristics(service) {
        const self = this;
        const list = await self.ble.getCharacteristics(service);

        Object.keys(self.characteristics).forEach((key) => {
            const characteristic = findCharacteristic(list, self.characteristics[key].uuid);

            if(exists(characteristic)) {
                self.characteristics[key].characteristic = characteristic;
                self.characteristics[key].supported = true;
            }

            return;
        });

        // console.log(':rx :characteristics ', self.characteristics);

        return;
    }
    async sub(prop, decoder, callback) {
        const self = this;
        const characteristic = self.characteristic(prop);

        if(exists(characteristic)) {
            await self.ble.sub(characteristic, eventToValue(decoder, callback));
            return true;
        } else {
            return false;
        }
    }
    async write(characteristic, buffer) {
        const self = this;

        if(exists(characteristic)) {
            const res = await self.ble.writeCharacteristic(characteristic, buffer);
            return res;
        } else {
            return false;
        }
    }
    async requestControl() {
        const self = this;
        const buffer = control.requestControl.encode();
        const characteristic = self.characteristic('fitnessMachineControlPoint');

        return await self.write(characteristic, buffer);
    }
    async reset() {
        const self = this;
        const buffer = control.reset.encode();
        const characteristic = self.characteristic('fitnessMachineControlPoint');

        return await self.write(characteristic, buffer);
    }
    async setTargetPower(value) {
        const self = this;
        const buffer = control.powerTarget.encode({power: value});
        const characteristic = self.characteristic('fitnessMachineControlPoint');

        return await self.write(characteristic, buffer);
    }
    async setTargetResistance(value) {
        const self = this;
        const buffer = control.resistanceTarget.encode({resistance: value});
        const characteristic = self.characteristic('fitnessMachineControlPoint');

        return await self.write(characteristic, buffer);
    }
    async setTargetSlope(value) {
        const self = this;
        const buffer = control.simulationParameters.encode({grade: value});;
        const characteristic = self.characteristic('fitnessMachineControlPoint');

        return await self.write(characteristic, buffer);
    }
    async setWheelCircumference(value) {
        const self = this;
        const buffer = control.wheelCircumference.encode({circumference: value});;
        const characteristic = self.characteristic('fitnessMachineControlPoint');

        return await self.write(characteristic, buffer);
    }
    defaultOnControlPoint(decoded) {
        control.response.toString(decoded);
    }
    defaultOnStatus(decoded) {
        status.toString(decoded);
    }

}

export { FitnessMachineService };
