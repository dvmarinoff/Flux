import { xf } from '../xf.js';

var services =
	  {fitnessMachine:
     {uuid: 0x1826,
      indoorBikeData: {uuid: 0x2AD2},
      fitnessMachineControlPoint: {uuid: 0x2AD9}
     },
     cyclingPower:
     {uuid: 0x1818},
     heartRate: {
         uuid: 0x180D,
         heartRateMeasurement: {uuid: 0x2A37}
     }
	  };

let hr             = dataview => dataview.getUint8(1, true);
let flags          = dataview => dataview.getUint8(0, true);
let instSpeed      = dataview => (dataview.getUint16(2, true) / 100);
let instCadence    = dataview => (dataview.getUint16(4, true) / 2);
let instPower      = dataview => dataview.getUint16(6, true);
let requestControl = _        => new Uint8Array([0x00]);
let setTargetPower = value    => new Uint8Array([0x05,0xe6]);
let hex            = n        => '0x' + parseInt(n).toString(16).toUpperCase();

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
    }
    async connect() {
        let self = this;
        self.device = await navigator.bluetooth.requestDevice({ filters: [{ services: [self.filter] }] });
        self.server = await self.device.gatt.connect();
        self.connected = true;
        xf.dispatch(`${self.name}:connected`);
        console.log(`Connected ${self.device.name} ${self.name}.`);
        self.device.addEventListener('gattserverdisconnected', self.onDisconnect.bind(self));
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
    async getDescriptor(characteristic, descriptor) {
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
};

class Hrb {
    constructor(args) {
        this.device = new Device({filter: services.heartRate.uuid, name: args.name});
    }
    async connect() {
        let self = this;
        self.device.connectAndNotify(services.heartRate.uuid,
                                     services.heartRate.heartRateMeasurement.uuid,
                                     self.onHeartRateMeasurement);
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
        this.device = new Device({filter: services.fitnessMachine.uuid, name: args.name});
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
    async setTargetPower(value) {
        let self   = this;
        let OpCode = 0x05;
        let buffer = new ArrayBuffer(3);
        let view   = new DataView(buffer);
        view.setUint8(0, 0x05, true);
        view.setInt16(1, hex(value), true);
        // view.setUint8(3, 0x00, true);
        console.log(`set target power: ${value} ${hex(value)}`);
        let res =
            await self.device.writeCharacteristic(services.fitnessMachine.fitnessMachineControlPoint.uuid, buffer);

    }
    async setSimulationParameters(args) {
        let self  = this;
        let OpCode = 0x11;
        let wind  = args.wind  || 0; // mps  - 0.001
        let grade = args.grade || 0; // %    - 0.01
        let crr   = args.crr   || 0; // null - 0.001
        let drag  = args.drag  || 0; // kg/m - 0.01

        let buffer = new ArrayBuffer(6);
        let view   = new DataView(buffer);
        view.setInt16(0, hex(wind),  true);
        view.setInt16(2, hex(grade), true);
        view.setUint8(4, hex(crr),   true);
        view.setUint8(5, hex(drag),  true);
        console.log(`set simulation: ${wind} ${grade} ${crr} ${drag}`);
        console.log(buffer);
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
        // 04 - operationa fail
        // 05 - control not permitted
        // 06 - reserved for future use

        // 128-0-1
        // 128-5-3
        // 128-5-1

        console.log(`on control point: ${res.responseCode} ${res.requestCode} ${res.resultCode}`);
    }
}

export { Device, Hrb, Controllable };
