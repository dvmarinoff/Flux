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
        this.filters = args.filters; // service uuid -> services.fitnessMachine.uuid
        this.optionalServices = args.optionalServices || [];
        this.retry = 0;
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
        return await navigator.bluetooth.requestDevice({filters: self.filters,
                                                        optionalServices: self.optionalServices});
    }
    async connect() {
        let self = this;
        if(self.isBleAvailable()) {
            xf.dispatch(`${self.name}:connecting`);
            try {
                self.device = await self.request();
                self.server = await self.device.gatt.connect();
                await self.getPrimaryServices();
                window.sessionStorage.setItem(self.name, self.device.id);
            } catch(error) {
                console.error(error);
                xf.dispatch(`${self.name}:disconnected`);
            } finally {

                if('connected' in self.server) {
                    if(self.server.connected) {
                        self.connected = true;
                        self.device.addEventListener('gattserverdisconnected', self.onDisconnect.bind(self));

                        xf.dispatch(`${self.name}:connected`, self.device);
                        console.log(`Connected ${self.device.name} ${self.name}.`);
                    }
                }
            }
        } else {
            xf.dispatch(`device:ble:unavalilable`);
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
    async getPrimaryServices() {
        let self = this;
        let services = await self.server.getPrimaryServices();
        services.forEach( service => {
            self.services[service.uuid] = service;
        });
        // console.log(self.services);
        return self.services;
    }
    hasService(uuid) {
        let self = this;
        return !(self.services[uuid] === undefined);
    }
    async getService(service) {
        let self = this;
        if(self.hasService(service)) {
            return self.services[service];
        } else {
            self.services[service] =
                await self.server.getPrimaryService(service);
            return self.services[service];
        }
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

        if(self.connected) {
            await self.getService(service);
            await self.getCharacteristic(service, characteristic);
            await self.startNotifications(characteristic, handler);
        }
    }
    async connectAndNotify(service, characteristic, handler) {
        let self = this;

        await self.connect();

        if(self.connected) {
            await self.getService(service);
            await self.getCharacteristic(service, characteristic);
            await self.startNotifications(characteristic, handler);
        }
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
