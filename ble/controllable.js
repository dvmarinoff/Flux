import { stringToHex,
         hexToString,
         hex,
         dataViewToString,
         getBitField,
         toBool, }  from '../functions.js';

import { xf }       from '../xf.js';
import { Device }   from './device.js';
import { services } from './services.js';
import { ftms }     from './ftms.js';


class Controllable {
    constructor(args) {
        this.device = new Device({filter: services.fitnessMachine.uuid,
                                  optionalServices: [services.deviceInformation.uuid],
                                  name: args.name});
        this.fitnessMachineFeature = {};
        this.fitnessMachineStatus = {};
        this.supportedPowerRange = false;
    }
    async connect() {
        let self = this;
        await self.device.connectAndNotify(services.fitnessMachine.uuid,
                                     services.fitnessMachine.indoorBikeData.uuid,
                                     self.onIndoorBikeData);
        await self.device.notify(services.fitnessMachine.uuid,
                                 services.fitnessMachine.fitnessMachineControlPoint.uuid,
                                 self.onControlPoint);
        await self.requestControl();
        await self.device.deviceInformation();

        let fitnessMachineFeature = await self.getFitnessMachineFeature();
        let features              = await self.setFeatures(fitnessMachineFeature);

        await self.notifyFitnessMachineStatus();

        self.fitnessMachineFeature = fitnessMachineFeature;
        self.features = features;

        console.log(features);
    }
    async disconnect() {
        this.device.disconnect();
    }
    async startNotifications() {
        let self = this;
        await self.device.notify(services.fitnessMachine.uuid,
                                 services.fitnessMachine.indoorBikeData.uuid,
                                 self.onIndoorBikeData);
    }
    stopNotifications() {
        let self = this;
        self.device.stopNotifications(services.fitnessMachine.indoorBikeData.uuid);
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
    async requestControl() {
        let self = this;
        let opCode = new Uint8Array([0x00]);
        let res = await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, opCode.buffer);
        return res;
    }
    async reset() {
        let self  = this;
        let OpCode = 0x01;

        let buffer = new ArrayBuffer(1);
        let view   = new DataView(buffer);
        view.setUint8(0, OpCode, true);
        console.log(`reset`);
        let res =
            await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, buffer);

    }
    async setTargetResistanceLevel(value) {
        // TEMPORARY DISABLED
        let self  = this;
        let OpCode = 0x04;
        let resistance = value || 0; // unitless - 0.1

        let buffer = new ArrayBuffer(3);
        let view   = new DataView(buffer);
        view.setUint8(0, OpCode, true);
        // view.setUint8(1, parseInt(resistance), true); // by Spec
        view.setInt16(1, resistance, true); // works with Tacx
        console.warn(`TEMPORARY DISABLED: set target resistance: ${resistance}`);
        // console.log(buffer);
        // let res = await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, buffer);

    }
    async setTargetPower(value) {
        let self   = this;
        let OpCode = 0x05;
        let power  = value; // Watt - 1
        let buffer = new ArrayBuffer(3);
        let view   = new DataView(buffer);
        view.setUint8(0, 0x05, true);
        view.setInt16(1, value, true);
        console.log(`set target power: ${value} ${hex(value)}`);
        let res =
            await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, buffer);

    }
    async setSimulationParameters(args) {
        let self  = this;
        let OpCode = 0x11;
        let wind  = args.wind  || 0; // mps      - 0.001
        let grade = args.grade || 0; // %        - 0.01
        let crr   = args.crr   || 0; // unitless - 0.0001
        let drag  = args.drag  || 0; // kg/m     - 0.01

        let buffer = new ArrayBuffer(7);
        let view   = new DataView(buffer);
        view.setUint8(0, 0x11, true);
        view.setInt16(1, hex(wind),  true);
        view.setInt16(3, hex(grade), true);
        view.setUint8(5, hex(crr),   true);
        view.setUint8(6, hex(drag),  true);
        console.log(`set simulation: ${wind} ${grade} ${crr} ${drag}`);
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
    onIndoorBikeData (e) {
        let dataview = e.target.value;
        let data     = ftms.dataviewToIndoorBikeData(dataview);
        // console.log(`onIndoorBikeData: ${data.pwr}`);
        // console.log(data);
        xf.dispatch('device:pwr', data.pwr);
        xf.dispatch('device:spd', data.spd);
        xf.dispatch('device:cad', data.cad);
    }
    onControlPoint (e) {
        let dataview = e.target.value;
        let res = ftms.dataviewToControlPointResponse(dataview);

        console.log(`on control point: ${res.responseCode} ${res.requestCode} ${res.resultCode} | ${res.response} : ${res.operation} : ${res.result}`);
    }
}

export { Controllable };
