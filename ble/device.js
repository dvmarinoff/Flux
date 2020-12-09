import { xf } from '../xf.js';
import { stringToHex,
         hexToString,
         hex,
         dataViewToString,
         getBitField,
         toBool, } from '../functions.js';

const services = {
    fitnessMachine: {
        uuid: 0x1826,
        indoorBikeData: {uuid: 0x2AD2},
        fitnessMachineControlPoint: {uuid: 0x2AD9},
        fitnessMachineFeature: {uuid: 0x2ACC},
        supportedResistanceLevelRange: {uuid: 0x2AD6},
        supportedPowerRange: {uuid: 0x2AD8},
        fitnessMachineStatus: {uuid: 0x2AD9}
    },
    cyclingPower: {
        uuid: 0x1818
    },
    heartRate: {
        uuid: 0x180D,
        heartRateMeasurement: {uuid: 0x2A37}
    },
    batteryService: {
        uuid: 0x180F,
        batteryLevel: {uuid: 0x2A19}
    },
    deviceInformation: {
        uuid: 0x180A,
        manufacturerNameString: {uuid: 0x2A29},
        modelNumberString: {uuid: 0x2A24},
        firmwareRevisionString: {uuid: 0x2A26}
    }
};

const controlPointResults = {
    '0x01': {definition: 'success',          msg: 'success'},
    '0x02': {definition: 'notSupported',     msg: 'not supported'},
    '0x03': {definition: 'invalidParameter', msg: 'invalid parameter'},
    '0x04': {definition: 'operationFail',    msg: 'operation fail'},
    '0x05': {definition: 'notPermitted',     msg: 'not permitted'},
};

const controlPointOperations = {
    '0x00': {param: false,
             definition: 'requestControl',
             msg: 'request control'},
    '0x01': {param: false,
             definition: 'reset',
             msg: 'reset'},
    '0x04': {param: {resistance: 'Uint8'},
             definition: 'setTargetResistanceLevel',
             msg: 'set target resistance'},
    '0x05': {param: {power: 'Int16'},
             definition: 'setTargetPower',
             msg: 'set target power'},
    '0x11': {param: {wind: 'Int16', grade: 'Int16', crr: 'Uint8', cw: 'Uint8'},
             definition: 'setIndoorBikeSimulationParameters',
             msg: 'set indoor bike simulation'},
    '0x13': {param: {speedLow: 'Uint16', speedHigh: 'Uint16'},
             definition: 'spinDownControl',
             msg: 'Spin Down Control'},
};

const fitnessMachineStatusCodes = {
    '0x00': {param: false, msg: 'Reserved for Future Use'},
    '0x01': {param: false, msg: 'Reset'},
    '0x02': {param: false, msg: 'Fitness Machine Stopped or Paused by the User'},
    '0x07': {param: {resistance: 'Uint8'},
             msg: 'Target Resistance Level Changed'},
    '0x08': {param: {power: 'Int16'},
             msg: 'Target Power Changed'},
    '0x12': {param: {wind: 'Int16', grade: 'Int16', crr: 'Uint8', cw: 'Uint8'},
             msg: 'Indoor Bike Simulation Parameters Changed'},
    '0x14': {param: '', msg: 'Spin Down Status'},
    '0xFF': {param: '', msg: 'Control Permission Lost'},
};

let targetSettingFeatures =
[
    {key: 'Speed',                          flagBit:  0, supported: false, msg: 'Speed'},
    {key: 'Inclination',                    flagBit:  1, supported: false, msg: 'Inclination'},
    {key: 'Resistance',                     flagBit:  2, supported: false, msg: 'Resistance'},
    {key: 'Power',                          flagBit:  3, supported: false, msg: 'Power'},
    {key: 'HeartRate',                      flagBit:  4, supported: false, msg: 'Heart Rate'},
    {key: 'ExpendedEnergy',                 flagBit:  5, supported: false, msg: 'Expended Energy'},
    {key: 'StepNumber',                     flagBit:  6, supported: false, msg: 'Step Number'},
    {key: 'StrideNumber',                   flagBit:  7, supported: false, msg: 'Stride Number'},
    {key: 'Distance',                       flagBit:  8, supported: false, msg: 'Distance'},
    {key: 'TrainingTime',                   flagBit:  9, supported: false, msg: 'Training Time'},
    {key: 'TimeInTwoHeartRateZones',        flagBit: 10, supported: false, msg: 'Time In Two Heart Rate Zones'},
    {key: 'TimeInThreeHeartRateZones',      flagBit: 11, supported: false, msg: 'Time In Three Heart Rate Zones'},
    {key: 'TimeInFiveHeartRateZones',       flagBit: 12, supported: false, msg: 'Time In Five Heart Rate Zones'},
    {key: 'IndoorBikeSimulationParameters', flagBit: 13, supported: false, msg: 'Indoor Bike Simulation Parameters'},
    {key: 'WheelCircumference',             flagBit: 14, supported: false, msg: 'Wheel Circumference'},
    {key: 'SpinDownControl',                flagBit: 15, supported: false, msg: 'Spin Down Control'},
    {key: 'Cadence',                        flagBit: 16, supported: false, msg: 'Cadence'},
    // bit 17-31 reserved for future use
];

let fitnessMachineFeatures =
[
    {key: 'AverageSpeed',              flagBit:  0, supported: false, msg: 'Average Speed'},
    {key: 'Cadence',                   flagBit:  1, supported: false, msg: 'Cadence'},
    {key: 'TotalDistance',             flagBit:  2, supported: false, msg: 'Total Distance'},
    {key: 'Inclination',               flagBit:  3, supported: false, msg: 'Inclination'},
    {key: 'ElevationGain',             flagBit:  4, supported: false, msg: 'Elevation Gain'},
    {key: 'Pace',                      flagBit:  5, supported: false, msg: 'Pace'},
    {key: 'StepCount',                 flagBit:  6, supported: false, msg: 'Step Count'},
    {key: 'ResistanceLevel',           flagBit:  7, supported: false, msg: 'Resistance Level'},
    {key: 'StrideCount',               flagBit:  8, supported: false, msg: 'Stride Count'},
    {key: 'ExpendedEnergy',            flagBit:  9, supported: false, msg: 'Expended Energy'},
    {key: 'HeartRateMeasurement',      flagBit: 10, supported: false, msg: 'Heart Rate Measurement'},
    {key: 'MetabolicEquivalent',       flagBit: 11, supported: false, msg: 'Metabolic Equivalent'},
    {key: 'ElapsedTime',               flagBit: 12, supported: false, msg: 'Elapsed Time'},
    {key: 'RemainingTime',             flagBit: 13, supported: false, msg: 'Remaining Time'},
    {key: 'PowerMeasurement',          flagBit: 14, supported: false, msg: 'Power Measurement'},
    {key: 'ForceOnBeltAndPowerOutput', flagBit: 15, supported: false, msg: 'Force On Belt And Power Output'},
    {key: 'UserDataRetention',         flagBit: 16, supported: false, msg: 'User DataRetention'},
    // bit 17-31 reserved for future use
];

function setSupportFeatures(dataview) {
    let featureFlags       = dataview.getUint32(0, true); // 0-31 flags
    let targetSettingFlags = dataview.getUint32(4, true); // 0-31 flags
    let read = (xs, i) => toBool(getBitField(xs, i));

    fitnessMachineFeatures.forEach(feature => {
        feature.supported = read(featureFlags, feature.flagBit);
    });

    targetSettingFeatures.forEach(feature => {
        feature.supported = read(targetSettingFlags, feature.flagBit);
    });

    return {fitnessMachineFeatures: fitnessMachineFeatures,
            targetSettingFeatures:  targetSettingFeatures};
}

function getSupportedFeatures(dataview) {
    let featureFlags       = dataview.getUint32(0, true); // 0-31 flags
    let targetSettingFlags = dataview.getUint32(4, true); // 0-31 flags
    let read = (xs, i) => toBool(getBitField(xs, i));

    fitnessMachineFeatures.forEach(feature => {
        feature.supported = read(featureFlags, feature.flagBit);
    });

    targetSettingFeatures.forEach(feature => {
        feature.supported = read(targetSettingFlags, feature.flagBit);
    });

    let readings  = features.fitnessMachineFeatures;
    let targets   = features.targetSettingFeatures;
    let supported = {readings: [], targets: []};

    supported.readings = readings.filter(feature => feature.supported);
    supported.targets  = targets.filter(feature => feature.supported);

    console.log(supported);
    return supported;
}

function getSupportedResistanceLevel(dataview) {
    let min = dataview.getUint16(0, dataview, true);
    let max = dataview.getUint16(2, dataview, true);
    let inc = dataview.getUint16(4, dataview, true);

    return {min: min, max: max, increment: inc};
}

function getSupportedPowerRange(dataview) {
    let min = dataview.getUint16(0, dataview, true);
    let max = dataview.getUint16(2, dataview, true);
    let inc = dataview.getUint16(4, dataview, true);

    return {min: min, max: max, increment: inc};
}

function getFitnessMachineStatus() {}

let hr             = dataview => dataview.getUint8(1, true);
let flags          = dataview => dataview.getUint8(0, true);
let instSpeed      = dataview => (dataview.getUint16(2, true) / 100);
let instCadence    = dataview => (dataview.getUint16(4, true) / 2);
let instPower      = dataview => dataview.getUint16(6, true);
let requestControl = _        => new Uint8Array([0x00]);
let setTargetPower = value    => new Uint8Array([0x05,0xe6]);

function indoorBikeDataFlags(dataview) {
    let f = dataview.getUint16(0, true);
    return [
        {MoreData:             (!!(f >>> 0 & 1))},  // 0 present,
        {AverageSpeed:         (!!(f >>> 1 & 1))},  // 1 present,
        {InstantaneousCadence: (!!(f >>> 2 & 1))},  // 0 present,
        {AverageCandence:      (!!(f >>> 3 & 1))},  // 1 present,
        {TotalDistance:        (!!(f >>> 4 & 1))},  // 1 present,
        {ResistanceLevel:      (!!(f >>> 5 & 1))},  // 1 present,
        {InstantaneousPower:   (!!(f >>> 6 & 1))},  // 1 present,
        {AveragePower:         (!!(f >>> 7 & 1))},  // 1 present,
        {ExpendedEnergy:       (!!(f >>> 8 & 1))},  // 1 present,
        {HeartRate:            (!!(f >>> 9 & 1))},  // 1 present,
        {MetabolicEquivalent:  (!!(f >>> 10 & 1))}, // 1 present,
        {ElapsedTime:          (!!(f >>> 11 & 1))}, // 1 present,
        {RemainingTime:        (!!(f >>> 12 & 1))}  // 1 present,
    ];
}

class Device {
    constructor(args) {
        this.device = {};
        this.server = {};
        this.services = {};
        this.characteristics = {};
        this.name = args.name || 'device';
        this.control = false;
        this.connected = false;
        this.filter = args.filter; // service uuid -> services.fitnessMachine.uuid
        this.optionalServices = args.optionalServices || [];
    }
    async isBleAvailable() {
        let self = this;
        return await navigator.bluetooth.getAvailability();
    }
    async query() {
        let self = this;
        let deviceId = window.sessionStorage.getItem(self.name);
        let devices  = await navigator.bluetooth.getDevices();
        let device   = devices.filter( device => device.id === deviceId)[0];
        return device;
    }
    async request() {
        let self = this;
        return await navigator.bluetooth.requestDevice({filters: [{services: [self.filter]}],
                                                        optionalServices: self.optionalServices});
    }
    async connect() {
        let self = this;
        if(self.isBleAvailable()) {

            self.device = await self.request();
            window.sessionStorage.setItem(self.name, self.device.id);
            self.server = await self.device.gatt.connect();

            self.connected = true;
            xf.dispatch(`${self.name}:connected`);
            console.log(`Connected ${self.device.name} ${self.name}.`);
            self.device.addEventListener('gattserverdisconnected', self.onDisconnect.bind(self));
        } else {
            console.warn('BLE is not available! You need to turn it on.');
        }
    }
    async disconnect() {
        let self = this;
        self.device.gatt.disconnect();
        self.onDisconnect();
    }
    onDisconnect() {
        let self = this;
        self.connected = false;
        xf.dispatch(`${self.name}:disconnected`);
        self.device.removeEventListener('gattserverdisconnected', e => e);
        console.log(`Disconnected ${self.device.name}.`);
    }
    async getService(service) {
        let self = this;
        self.services[service] =
            await self.server.getPrimaryService(service);
    }
    async getCharacteristic(service, characteristic) {
        let self = this;
        self.characteristics[characteristic] =
            await self.services[service].getCharacteristic(characteristic);
    }
    async getDescriptor(service, characteristic, descriptor) {
        let self = this;
        self.descriptors[descriptor] =
            await self.services[service].getCharacteristic(characteristic);
    }
    async startNotifications(characteristic, handler) {
        let self = this;
        await self.characteristics[characteristic].startNotifications();
        self.characteristics[characteristic].addEventListener('characteristicvaluechanged', handler);
        console.log(`Notifications started on ${self.characteristics[characteristic].uuid}.`);
    }
    async stopNotifications(characteristic) {
        let self = this;
        let c = self.characteristics[characteristic];
        await c.stopNotifications();
        c.removeEventListener('characteristicvaluechanged', function(e) {
            console.log(`Notifications stopped on: ${c.uuid}`);
        });
    }
    async notify(service, characteristic, handler) {
        let self = this;
        await self.getService(service);
        await self.getCharacteristic(service, characteristic);
        await self.startNotifications(characteristic, handler);
    }
    async connectAndNotify(service, characteristic, handler) {
        let self = this;
        await self.connect();
        await self.getService(service);
        await self.getCharacteristic(service, characteristic);
        await self.startNotifications(characteristic, handler);
    }
    async writeCharacteristic(characteristic, value, response = false) {
        let self = this;
        let res = undefined;
        try{
            res = await self.characteristics[characteristic].writeValue(value);
        } catch(e) {
            console.log(`ERROR: device.writeCharacteristic: ${e}`);
        }
        return res;
    }
    async readCharacteristic(characteristic) {
        let self = this;
        let res  = new DataView(new Uint8Array([0]).buffer);
        try{
            res = await self.characteristics[characteristic].readValue();
        } catch(e) {
            console.log(`ERROR: device.readCharacteristic: ${e}`);
        }
        return res;
    }
    async deviceInformation() {
        let self = this;
        await self.getService(services.deviceInformation.uuid);
        await self.getCharacteristic(services.deviceInformation.uuid,
                                            services.deviceInformation.manufacturerNameString.uuid);
        await self.getCharacteristic(services.deviceInformation.uuid,
                                            services.deviceInformation.modelNumberString.uuid);
        await self.getCharacteristic(services.deviceInformation.uuid,
                                     services.deviceInformation.firmwareRevisionString.uuid);

        let manufacturerNameString =
            await self.readCharacteristic(services.deviceInformation.manufacturerNameString.uuid);

        let modelNumberString =
            await self.readCharacteristic(services.deviceInformation.modelNumberString.uuid);

        let firmwareRevisionString =
            await self.readCharacteristic(services.deviceInformation.firmwareRevisionString.uuid);

        manufacturerNameString = dataViewToString(manufacturerNameString) || 'Unknown';
        modelNumberString      = dataViewToString(modelNumberString)      || '';
        firmwareRevisionString = dataViewToString(firmwareRevisionString) || '';

        self.info = {manufacturerNameString: manufacturerNameString,
                     modelNumberString:      modelNumberString,
                     firmwareRevisionString: firmwareRevisionString,
                     name:                   self.device.name};

        xf.dispatch(`${self.name}:info`, self.info);
        return self.info;
    }
    async batteryService() {
        let self = this;

        await self.getService(services.batteryService.uuid);
        await self.getCharacteristic(services.batteryService.uuid,
                                            services.batteryService.batteryLevel.uuid);
        let batteryLevel =
            await self.readCharacteristic(services.batteryService.batteryLevel.uuid);

        batteryLevel = batteryLevel.getUint8(0, true);
        self.battery = batteryLevel;

        console.log(batteryLevel);

        xf.dispatch(`${self.name}:battery`, self.battery);
        return self.battery;
    }
};

class Hrb {
    constructor(args) {
        this.device = new Device({filter: services.heartRate.uuid,
                                  optionalServices: [services.deviceInformation.uuid,
                                                     services.batteryService.uuid],
                                  name: args.name});
        this.name = args.name;
    }
    async connect() {
        let self = this;
        await self.device.connectAndNotify(services.heartRate.uuid,
                                     services.heartRate.heartRateMeasurement.uuid,
                                     self.onHeartRateMeasurement);
        await self.device.deviceInformation();
        await self.device.batteryService();
    }
    async disconnect() {
        this.device.disconnect();
    }
    async startNotifications() {
        let self = this;
        self.device.notify(services.heartRate.uuid,
                           services.heartRate.heartRateMeasurement.uuid,
                           self.onHeartRateMeasurement);
    }
    stopNotifications() {
        let self = this;
        self.device.stopNotifications(services.heartRate.heartRateMeasurement.uuid);
    }
    onHeartRateMeasurement (e) {
        let dataview = e.target.value;
        let data = {
            flags: dataview.getUint8(0, true),
            hr:    dataview.getUint8(1, true)};
        xf.dispatch('device:hr', data.hr);
    }
}

class Controllable {
    constructor(args) {
        this.device = new Device({filter: services.fitnessMachine.uuid,
                                  optionalServices: [services.deviceInformation.uuid,
                                                     services.batteryService.uuid],
                                  name: args.name});
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


        await self.device.getCharacteristic(services.fitnessMachine.uuid,
                                            services.fitnessMachine.fitnessMachineFeature.uuid);

        let fitnessMachineFeature =
            await self.device.readCharacteristic(services.fitnessMachine.fitnessMachineFeature.uuid);

        console.log(fitnessMachineFeature);
        // self.device.getCharacteristic(services.fitnessMachine.uuid,
        //                               services.fitnessMachine.supportedResistanceLevelRange.uuid);
        // self.device.getCharacteristic(services.fitnessMachine.uuid,
        //                               services.fitnessMachine.supportedPowerRange.uuid);
        // self.device.getCharacteristic(services.fitnessMachine.uuid,
        //                               services.fitnessMachine.fitnessMachineStatus.uuid);
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
        let self  = this;
        let OpCode = 0x04;
        let resistance = value || 0; // unitless - 0.1

        let buffer = new ArrayBuffer(3);
        let view   = new DataView(buffer);
        view.setUint8(0, OpCode, true);
        // view.setUint8(1, parseInt(resistance), true); // by Spec
        view.setInt16(1, resistance, true); // works with Tacx
        console.log(`set target resistance: ${resistance}`);
        console.log(buffer);
        let res =
            await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, buffer);

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
        console.log(buffer);
        let res =
            await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, buffer);

    }
    async spinDownControl() {
        let self   = this;
        let OpCode = 0x01;

        let buffer = new ArrayBuffer(1);
        let view   = new DataView(buffer);
        view.setUint8(0, OpCode, true);
        console.log(`reset`);
        let res =
            await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, buffer);

    }
    onIndoorBikeData (e) {
        let dataview = e.target.value;
        let data = {
            flags: dataview.getUint16(0, true),
            pwr:   instPower(dataview),
            spd:   instSpeed(dataview),
            cad:   instCadence(dataview),
        };
        xf.dispatch('device:pwr', data.pwr);
        xf.dispatch('device:spd', data.spd);
        xf.dispatch('device:cad', data.cad);
    }
    onControlPoint (e) {
        let dataview = e.target.value;
        let res = {
            responseCode: dataview.getUint8(0, true),
            requestCode: dataview.getUint8(1, true),
            resultCode: dataview.getUint8(2, true)
        };

        // 00 - reserved for future use
        // 01 - success
        // 02 - not supported
        // 03 - invalid parameter
        // 04 - operation fail
        // 05 - control not permitted
        // 06 - reserved for future use

        // 0xFF on fitness machine status - control permission lost
        // 128 - 0b10000000, 8 bit is 1

        // 0x80 - operation code - status code
        // 128-0-1
        // 128-5-3
        // 128-5-1
        let response  = hex(res.responseCode);
        let operation = controlPointOperations[hex(res.requestCode)].msg;
        let result    = controlPointResults[hex(res.resultCode)].msg;

        console.log(`on control point: ${res.responseCode} ${res.requestCode} ${res.resultCode}`);
        console.log(`on procedure complete: ${response} ${operation} ${result}`);
    }
}

export { Device, Hrb, Controllable };
