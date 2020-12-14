import { xf } from '../xf.js';
import { stringToHex,
         hexToString,
         hex,
         dataViewToString,
         getBitField,
         toBool, } from '../functions.js';
import { services } from './services.js';

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
    async getDescriptors(characteristic) {
        let self = this;
        let descriptors = await self.characteristics[characteristic].getDescriptors(characteristic);
        return descriptors;
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

export { Device };
