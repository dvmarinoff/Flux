import { stringToHex,
         hexToString,
         hex,
         kph,
         dataViewToString,
         getBitField,
         nthBitToBool,
         toBool, }  from '../functions.js';

import { xf }       from '../xf.js';
import { Device }   from './device.js';
import { services } from './services.js';
import { ftms }     from './ftms.js';
import { ant } from './fec-over-ble.js';

class Controllable {
    constructor(args) {
        this.device = new Device({filters: [{services: [services.fitnessMachine.uuid]},
                                            {services: [services.fecOverBle.uuid]}],
                                  optionalServices: [services.deviceInformation.uuid],
                                  name: args.name});
        this.protocol = {};
    }
    async connect() {
        let self = this;

        await self.device.connect();

        if(self.device.hasService(services.fitnessMachine.uuid)) {
            self.protocol = new FTMSProtocol({device: self.device});

        } else if(self.device.hasService(services.fecOverBle.uuid)) {
            console.log('Controllable: falling back to FE-C over BLE.');
            self.protocol = new FECBLEProtocol({device: self.device});

        } else {
            console.error('Controllable: no FTMS or BLE over FE-C.');
        }
    }
    async disconnect() {
        let self = this;
        this.device.disconnect();
    }
    async setPowerTarget(power) {
        const self = this;
        self.protocol.setPowerTarget(power);
        console.log(`set power target: ${power}`);
    }
    async setResistanceTarget(level) {
        const self   = this;
        self.protocol.setResistanceTarget(level);
    }
    async setSlopeTarget(args) {
        const self   = this;
        self.protocol.setSlopeTarget(args);
    }
    onData(e) {
        const self     = this;
        const dataview = e.target.value;
    }
}

class FTMSProtocol {
    constructor(args) {
        this.device = args.device;
        this.fitnessMachineFeature = {};
        this.fitnessMachineStatus = {};
        this.supportedPowerRange = false;
    }

    async connect() {
        const self   = this;
        await self.device.notify(services.fitnessMachine.uuid,
                                 services.fitnessMachine.indoorBikeData.uuid,
                                 self.onData);
        await self.device.notify(services.fitnessMachine.uuid,
                                 services.fitnessMachine.fitnessMachineControlPoint.uuid,
                                 self.onControlPoint);
        await self.requestControl();
        await self.device.deviceInformation();
    }
    async setPowerTarget(power) {
        const self   = this;
        const msg    = ftms.powerTargetMsg(power);
        const buffer = msg.buffer;
        let res      =
            await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, buffer);
    }
    async setResistanceTarget(level) {
        const self   = this;
        const msg    = ftms.resistanceTargetMsg(level);
        const buffer = msg.buffer;
        let res      =
            await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, buffer);
    }
    async setSlopeTarget(args) {
        const self   = this;
        const msg    = ftms.slopeTargetMsg(args);
        const buffer = msg.buffer;
        let res      =
            await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, buffer);
    }
    onData(e) {
        let dataview = e.target.value;
        let data     = ftms.dataviewToIndoorBikeData(dataview);

        xf.dispatch('device:pwr', data.pwr);
        xf.dispatch('device:spd', data.spd);
        xf.dispatch('device:cad', data.cad);
        return data;
    }
    async config() {
        const self   = this;

        let fitnessMachineFeature = await self.getFitnessMachineFeature();
        let features              = await self.setFeatures(fitnessMachineFeature);

        await self.notifyFitnessMachineStatus();

        self.fitnessMachineFeature = fitnessMachineFeature;
        self.features = features;
        console.log(features);
    }

    async requestControl() {
        let self = this;
        let opCode = new Uint8Array([0x00]);
        let res = await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, opCode.buffer);
        return res;
    }
    onControlPoint (e) {
        let dataview = e.target.value;
        let res = ftms.dataviewToControlPointResponse(dataview);

        console.log(`on control point: ${res.responseCode} ${res.requestCode} ${res.resultCode} | ${res.response} : ${res.operation} : ${res.result}`);
    }
    async setFeatures(fitnessMachineFeature) {
        let self     = this;
        let targets  = fitnessMachineFeature.targets;
        let readings = fitnessMachineFeature.readings;

        console.log(`setFeatures: `);
        console.log(fitnessMachineFeature);

        let includes = (xs, key) => xs.filter(x => x.key === key).length > 0;

        let res = {power:      {supported: false, params: false},
                   resistance: {supported: false, params: false},
                   simulation: {supported: false, params: false},
                   spindown:   {supported: false, params: false}};


        if(includes(targets, 'Power')) {
            let supportedPowerRange = await self.getSupportedPowerRange();
            res.power.supported     = true;
            res.power.params        = supportedPowerRange;
        };
        if(includes(targets, 'Resistance')) {
            let supportedResistanceLevelRange = await self.getSupportedResistanceLevelRange();
            res.resistance.supported          = true;
            res.resistance.params             = supportedResistanceLevelRange;
        }
        if(includes(targets, 'IndoorBikeSimulationParameters')) {
            res.simulation.supported = true;
        }
        if(includes(targets, 'SpinDownControl')) {
            res.spindown.supported = true;
        }

        xf.dispatch('device:features', res);
        return res;
    }
    async getFitnessMachineFeature() {
        let self = this;
        await self.device.getCharacteristic(services.fitnessMachine.uuid,
                                            services.fitnessMachine.fitnessMachineFeature.uuid);
        let dataview = await self.device.readCharacteristic(services.fitnessMachine.fitnessMachineFeature.uuid);
        let fitnessMachineFeature = ftms.dataviewToFitnessMachineFeature(dataview);

        return fitnessMachineFeature;
    }
    async getSupportedPowerRange() {
        let self = this;
        await self.device.getCharacteristic(services.fitnessMachine.uuid,
                                            services.fitnessMachine.supportedPowerRange.uuid);
        let dataview = await self.device.readCharacteristic(services.fitnessMachine.supportedPowerRange.uuid);
        let supportedPowerRange = ftms.dataviewToSupportedPowerRange(dataview);

        return supportedPowerRange;
    }

    async getSupportedResistanceLevelRange() {
        let self = this;
        await self.device.getCharacteristic(services.fitnessMachine.uuid,
                                            services.fitnessMachine.supportedResistanceLevelRange.uuid);
        let dataview = await self.device.readCharacteristic(services.fitnessMachine.supportedResistanceLevelRange.uuid);
        let supportedResistanceLevelRange = ftms.dataviewToSupportedResistanceLevelRange(dataview);

        return supportedResistanceLevelRange;
    }
    async notifyFitnessMachineStatus() {
        let self = this;
        await self.device.notify(services.fitnessMachine.uuid,
                                 services.fitnessMachine.fitnessMachineStatus.uuid,
                                 self.onFitnessMachineStatus);
    }
    async onFitnessMachineStatus(e) {
        let self = this;
        let dataview = e.target.value;
        let fitnessMachineStatus = ftms.dataviewToFitnessMachineStatus(dataview);
        console.log(fitnessMachineStatus);
        return fitnessMachineStatus;
    }
    async reset() {
        let self  = this;
        let OpCode = 0x01;
        let buffer = new ArrayBuffer(1);
        let view   = new DataView(buffer);
        view.setUint8(0, OpCode, true);
        let res =
            await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, buffer);
    }
    async spinDownControl() {
        let self   = this;
        let OpCode = 0x01;
        let buffer = new ArrayBuffer(1);
        let view   = new DataView(buffer);
        view.setUint8(0, OpCode, true);
        let res =
            await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, buffer);
    }
}

class FECBLEProtocol {
    constructor(args) {
        this.device = args.device;
    }

    async connect() {
        const self   = this;
        await self.device.notify(services.fecOverBle.uuid,
                                 services.fecOverBle.fec2.uuid,
                                 self.onData.bind(self));
    }
    async setPowerTarget(value) {
        const self   = this;
        const msg    = ant.powerTargetMsg(value);
        const buffer = msg.buffer;
        let res      =
            await self.device.writeCharacteristic(services.fec1.fec3.uuid, buffer);
    }
    async setResistanceTarget(value) {
        const self   = this;
        const msg    = ant.resistanceTargetMsg(value);
        const buffer = msg.buffer;
        let res      =
            await self.device.writeCharacteristic(services.fec1.fec3.uuid, buffer);
    }
    async setSlopeTarget(args) {
        const self   = this;
        const msg    = ant.slopeTargetMsg(args.grade);
        const buffer = msg.buffer;
        let res      =
            await self.device.writeCharacteristic(services.fec1.fec3.uuid, buffer);
    }
    onData(e) {
        const self     = this;
        const dataview = e.target.value;
        const data     = ant.dataMsg(dataview);
        if(data.page === 25) {
            xf.dispatch('device:pwr', data.power);
            xf.dispatch('device:cad', data.cadence);
        }
        if(data.page === 16) {
            xf.dispatch('device:spd', (data.speed * 0.001 * 3.6));
        }
        return data;
    }
}



export { Controllable };
