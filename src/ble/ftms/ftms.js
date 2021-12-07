import { uuids } from '../uuids.js';
import { indoorBikeDataDecoder } from './indoor-bike-data.js';

import { powerTarget,
         resistanceTarget,
         slopeTarget,
         simulationParameters,
         requestControl,
         controlPointResponseDecoder } from './control-point.js';

import { fitnessMachineStatusDecoder } from './fitness-machine-status.js';

import { fitnessMachineFeatureDecoder } from './fitness-machine-feature.js';

import { supportedPowerRange,
         supportedResistanceLevelRange } from './supported.js';

import { equals, exists, first } from '../../functions.js';

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

    constructor(args) {
        this.ble = args.ble;
        this.device = args.device;
        this.server = args.server;
        this.deviceServices = args.services;
        this.onStatus = args.onStatus || ((x) => x);
        this.onControl = args.onControl || ((x) => x);
        this.onData = args.onData || ((x) => x);

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

        if(self.supported('fitnessMachineStatus')) {
            await self.sub('fitnessMachineStatus', fitnessMachineStatusDecoder, self.onStatus);
        }

        if(self.supported('indoorBikeData')) {
            await self.sub('indoorBikeData', indoorBikeDataDecoder, self.onData);
        }

        if(self.supported('fitnessMachineControlPoint')) {
            await self.sub('fitnessMachineControlPoint', controlPointResponseDecoder, self.onControl);
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

        console.log(list);
        console.log(self.characteristics);

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
        const buffer = requestControl();
        const characteristic = self.characteristic('fitnessMachineControlPoint');

        return await self.write(characteristic, buffer);
    }
    async setTargetPower(value) {
        const self = this;
        const buffer = powerTarget(value);
        const characteristic = self.characteristic('fitnessMachineControlPoint');

        return await self.write(characteristic, buffer);
    }
    async setTargetResistance(value) {
        const self = this;
        const buffer = resistanceTarget(value);
        const characteristic = self.characteristic('fitnessMachineControlPoint');

        return await self.write(characteristic, buffer);
    }
    async setTargetSlope(value) {
        const self = this;
        const buffer = slopeTarget(value);
        const characteristic = self.characteristic('fitnessMachineControlPoint');

        return await self.write(characteristic, buffer);
    }
}

export { FitnessMachineService };
