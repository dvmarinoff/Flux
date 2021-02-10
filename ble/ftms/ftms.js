import { xf } from '../../xf.js';

import { services } from '../services.js';

import { dataviewToIndoorBikeData } from './indoor-bike-data.js';

import { powerTarget,
         resistanceTarget,
         slopeTarget,
         simulationParameters,
         dataviewToControlPointResponse } from './control-point.js';

import { dataviewToFitnessMachineStatus } from './fitness-machine-status.js';

import { setSupportFeatures,
         dataviewToFitnessMachineFeature } from './fitness-machine-feature.js';

import { dataviewToSupportedPowerRange,
         dataviewToSupportedResistanceLevelRange } from './supported.js';

class FTMS {
    constructor(args) {
        this.device    = args.device;
        this.info      = {};
        this.features  = {};
        this.status    = {};
        this.onPower   = args.onPower;
        this.onSpeed   = args.onSpeed;
        this.onCadence = args.onCadence;
        this.onConfig  = args.onConfig;
    }

    async connect() {
        const self   = this;
        await self.config();
        await self.device.notify(services.fitnessMachine.uuid,
                                 services.fitnessMachine.indoorBikeData.uuid,
                                 self.onData.bind(self));
        await self.device.notify(services.fitnessMachine.uuid,
                                 services.fitnessMachine.fitnessMachineControlPoint.uuid,
                                 self.onControlPoint.bind(self));
        await self.requestControl();
    }
    async config() {
        const self    = this;
        const info    = await self.device.deviceInformation();
        let features  = await self.getFitnessMachineFeature();
        features      = await self.getTargetParams(features);
        self.features = features;
        self.info     = info;

        self.onConfig({ features });

        await self.subFitnessMachineStatus();
    }
    async setPowerTarget(power) {
        const self   = this;
        const msg    = powerTarget(power);
        const buffer = msg.buffer;
        const uuid   = services.fitnessMachine.fitnessMachineControlPoint.uuid;

        await self.device.writeCharacteristic(uuid, buffer);
    }
    async setResistanceTarget(level) {
        const self   = this;
        const msg    = resistanceTarget(level);
        const buffer = msg.buffer;
        const uuid   = services.fitnessMachine.fitnessMachineControlPoint.uuid;

        await self.device.writeCharacteristic(uuid, buffer);
    }
    async setSlopeTarget(args) {
        const self   = this;
        const msg    = slopeTarget(args);
        const buffer = msg.buffer;
        const uuid   = services.fitnessMachine.fitnessMachineControlPoint.uuid;

        await self.device.writeCharacteristic(uuid, buffer);
    }
    onData(e) {
        const self   = this;
        let dataview = e.target.value;
        let data     = dataviewToIndoorBikeData(dataview);

        self.onPower(data.power);
        self.onSpeed(data.speed);
        self.onCadence(data.cadence);

        return data;
    }
    async requestControl() {
        const self   = this;
        const opCode = new Uint8Array([0x00]);
        const uuid   = services.fitnessMachine.fitnessMachineControlPoint.uuid;

        return await self.device.writeCharacteristic(uuid, opCode.buffer);
    }
    onControlPoint (e) {
        const dataview = e.target.value;
        const res      = dataviewToControlPointResponse(dataview);
        // console.log(`on control point: ${res.responseCode} ${res.requestCode} ${res.resultCode} | ${res.response} : ${res.operation} : ${res.result}`);
    }
    async getTargetParams(feature) {
        const self = this;
        feature['params'] = {};

        if(feature.targets.includes('Power')) {
            const range = await self.getSupportedPowerRange();
            feature.params['power'] = range;
        };
        if(feature.targets.includes('Resistance')) {
            const range = await self.getSupportedResistanceLevelRange();
            feature.params['resistance'] = range;
        }

        return feature;
    }
    async getFitnessMachineFeature() {
        const self           = this;
        const service        = services.fitnessMachine.uuid;
        const characteristic = services.fitnessMachine.fitnessMachineFeature.uuid;

        await self.device.getCharacteristic(service, characteristic);

        const dataview = await self.device.readCharacteristic(characteristic);
        return dataviewToFitnessMachineFeature(dataview);
    }
    async getSupportedPowerRange() {
        const self           = this;
        const service        = services.fitnessMachine.uuid;
        const characteristic = services.fitnessMachine.supportedPowerRange.uuid;

        await self.device.getCharacteristic(service, characteristic);

        const dataview = await self.device.readCharacteristic(characteristic);
        return dataviewToSupportedPowerRange(dataview);
    }

    async getSupportedResistanceLevelRange() {
        const self           = this;
        const service        = services.fitnessMachine.uuid;
        const characteristic = services.fitnessMachine.supportedResistanceLevelRange.uuid;

        await self.device.getCharacteristic(service, characteristic);

        const dataview = await self.device.readCharacteristic(characteristic);
        return dataviewToSupportedResistanceLevelRange(dataview);
    }
    async subFitnessMachineStatus() {
        const self = this;
        await self.device.notify(services.fitnessMachine.uuid,
                                 services.fitnessMachine.fitnessMachineStatus.uuid,
                                 self.onFitnessMachineStatus);
    }
    async onFitnessMachineStatus(e) {
        const self     = this;
        const dataview = e.target.value;
        const status   = dataviewToFitnessMachineStatus(dataview);
        self.status    = status;
        return status;
    }
    async reset() {
        const self   = this;
        const OpCode = 0x01;
        let buffer   = new ArrayBuffer(1);
        let view     = new DataView(buffer);
        view.setUint8(0, OpCode, true);

        const uuid = services.fitnessMachine.fitnessMachineControlPoint.uuid;
        await self.device.writeCharacteristic(uuid, buffer);
    }
    async spinDownControl() {
        const self   = this;
        const OpCode = 0x01;
        let buffer   = new ArrayBuffer(1);
        let view     = new DataView(buffer);
        view.setUint8(0, OpCode, true);

        const uuid = services.fitnessMachine.fitnessMachineControlPoint.uuid;
        await self.device.writeCharacteristic(uuid, buffer);
    }
}

export { FTMS };
