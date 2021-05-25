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

function eventToValue(decoder, callback) {
    return function (e) {
        return callback(decoder(e.target.value));
    };
}

class FitnessMachineService {
    uuid = uuids.fitnessMachine;
    characteristics = {};
    constructor(args) {
        this.ble = args.ble;
        this.device = args.device;
        this.server = args.server;
        this.deviceServices = args.services;
        this.onStatus = args.onStatus || ((x) => x);
        this.onControl = args.onControl || ((x) => x);
        this.onData = args.onData || ((x) => x);
        // this.init();
    }
    async init() {
        const self = this;
        self.service = await self.ble.getService(self.server, self.uuid);
        self.characteristics = await self.getCharacteristics(self.service);

        await self.ble.sub(self.characteristics.fitnessMachineStatus,
                     eventToValue(fitnessMachineStatusDecoder, self.onStatus));

        await self.ble.sub(self.characteristics.indoorBikeData,
                     eventToValue(indoorBikeDataDecoder, self.onData));

        await self.ble.sub(self.characteristics.fitnessMachineControlPoint,
                     eventToValue(controlPointResponseDecoder, self.onControl));

        await self.requestControl();
    }
    async getCharacteristics(service) {
        const self = this;
        const fitnessMachineFeature         = await self.ble.getCharacteristic(service, uuids.fitnessMachineFeature);
        const supportedPowerRange           = await self.ble.getCharacteristic(service, uuids.supportedPowerRange);
        const supportedResistanceLevelRange = await self.ble.getCharacteristic(service, uuids.supportedResistanceLevelRange);
        const fitnessMachineStatus          = await self.ble.getCharacteristic(service, uuids.fitnessMachineStatus);
        const fitnessMachineControlPoint    = await self.ble.getCharacteristic(service, uuids.fitnessMachineControlPoint);
        const indoorBikeData                = await self.ble.getCharacteristic(service, uuids.indoorBikeData);

        return { fitnessMachineFeature,
                 supportedPowerRange,
                 supportedResistanceLevelRange,
                 fitnessMachineStatus,
                 fitnessMachineControlPoint,
                 indoorBikeData };
    }
    async requestControl() {
        const self = this;
        return await self.ble.writeCharacteristic(self.characteristics.fitnessMachineControlPoint, requestControl().buffer);
    }
    async setTargetPower(value) {
        const self = this;
        const buffer = powerTarget(value);
        const characteristic = self.characteristics.fitnessMachineControlPoint;
        self.ble.writeCharacteristic(characteristic, buffer);
    }
    async setTargetResistance(value) {
        const self = this;
        const buffer = resistanceTarget(value);
        const characteristic = self.characteristics.fitnessMachineControlPoint;
        self.ble.writeCharacteristic(characteristic, buffer);
    }
    async setTargetSlope(value) {
        const self = this;
        const buffer = slopeTarget(value);
        const characteristic = self.characteristics.fitnessMachineControlPoint;
        self.ble.writeCharacteristic(characteristic, buffer);
    }
}

export { FitnessMachineService };
