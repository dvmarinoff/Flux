import { first, equals, exists } from '../functions.js';
import { uuids } from './uuids.js';

////
// private
////
const _type = 'web-ble';

const _hrm = {
    filters: [{services: [uuids.heartRate]}],
    optionalServices: [uuids.deviceInformation]
};

const _controllable = {
    filters: [
        {services: [uuids.fitnessMachine]},
        {services: [uuids.fec]},
        {services: [uuids.wahooFitnessMachine]},
        {services: [uuids.cyclingPower]},
    ],
    optionalServices: [uuids.deviceInformation, ]
};

const _power = {
    filters: [{services: [uuids.cyclingPower]}],
    optionalServices: [uuids.deviceInformation]
};

const _speedCadence = {
    filters: [{services: [uuids.speedCadence]}],
    optionalServices: [uuids.deviceInformation]
};

const _all = {acceptAllDevices: true};

function filterIn(coll, prop, value) {
    return first(coll.filter(x => x[prop] === value));
}

function filterByValue(obj, value) {
    return Object.entries(obj).filter(kv => kv[1] === value);
}

function findByValue(obj, value) {
    return first(first(filterByValue(obj, value)));
}

function filterDevice(devices, id) {
    return filterIn(devices, id);
}

function includesDevice(devices, id) {
    return devices.map(device => device.id).includes(device => equals(device.id, id));
}


const _ = { filterDevice, includesDevice };

////
// public
////

class WebBLE {
    requestFilters = {
        hrm:          _hrm,
        controllable: _controllable,
        speedCadence: _speedCadence,
        power:        _power ,
        all:          _all
    };
    constructor(args) {}
    get type() { return _type; }
    async connect(filter) {
        const self = this;
        const device = await self.request(filter);
        const server = await self.gattConnect(device);
        const services = await self.getPrimaryServices(server);
        return {
            device,
            server,
            services
        };
    }
    async disconnect(device) {
        const self = this;
        await self.gattDisconnect(device);
        return device;
    }
    isConnected(device) {
        if(!exists(device.gatt)) return false;
        return device.gatt.connected;
    }
    async watchAdvertisements(id) {
        const devices = await navigator.bluetooth.getDevices();
        const device = first(devices.filter(d => d.id === id));

        let resolve;
        const p = new Promise(function(res, rej) {
            resolve = res;
        });

        const abortController = new AbortController();
        device.addEventListener('advertisementreceived', onAdvertisementReceived.bind(this), {once: true});

        async function onAdvertisementReceived(e) {
            abortController.abort();
            console.log(e);
            resolve(e.device);
        }

        await device.watchAdvertisements({signal: abortController.signal});

        return p;
    }
    async sub(characteristic, handler) {
        const self = this;
        await self.startNotifications(characteristic, handler);
        return characteristic;
    }
    async unsub(characteristic, handler) {
        const self = this;
        await self.stopNotifications(characteristic, handler);
        return characteristic;
    }
    async request(filter) {
        return await navigator.bluetooth.requestDevice(filter);
    }
    async getDevices() {
        const self = this;
        return await navigator.bluetooth.getDevices();
    }
    async isPaired(device) {
        const self = this;
        const devices = await self.getDevices();
        return includesDevice(devices, device.id);
    }
    async getPairedDevice(deviceId) {
        const self = this;
        const devices = await self.getDevices();
        return filterDevice(devices, deviceId);
    }
    async gattConnect(device) {
        const self = this;
        const server = await device.gatt.connect();
        return server;
    }
    async gattDisconnect(device) {
        const self = this;
        return await device.gatt.disconnect();
    }
    async getPrimaryServices(server) {
        const self = this;
        const services = await server.getPrimaryServices();
        return services;
    }
    async getService(server, uuid) {
        const self = this;
        const service = await server.getPrimaryService(uuid);
        return service;
    }
    async getCharacteristic(service, uuid) {
        const self = this;
        const characteristic = await service.getCharacteristic(uuid);
        return characteristic;
    }
    async getCharacteristics(service) {
        const self = this;
        const characteristics = await service.getCharacteristics();
        return characteristics;
    }
    async getDescriptors(characteristic) {
        const self = this;
        const descriptors = await characteristic.getDescriptors();
        return descriptors;
    }
    async getDescriptor(characteristic, uuid) {
        const self = this;
        const descriptor = await characteristic.getDescriptor(uuid);
        return descriptor;
    }
    async startNotifications(characteristic, handler) {
        const self = this;
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handler);
        console.log(`Notifications started on ${findByValue(uuids, characteristic.uuid)}: ${characteristic.uuid}.`);
        return characteristic;
    }
    async stopNotifications(characteristic, handler) {
        let self = this;
        await characteristic.stopNotifications();
        characteristic.removeEventListener('characteristicvaluechanged', handler);
        console.log(`Notifications stopped on ${findByValue(uuids, characteristic.uuid)}: ${characteristic.uuid}.`);
        return characteristic;
    }
    async writeCharacteristic(characteristic, value) {
        const self = this;
        let res = undefined;
        try{
            if(exists(characteristic.writeValueWithResponse)) {
                res = await characteristic.writeValueWithResponse(value);
            } else {
                res = await characteristic.writeValue(value);
            }
        } catch(e) {
            console.error(`characteristic.writeValue:`, e);
        }
        return res;
    }
    async readCharacteristic(characteristic) {
        const self = this;
        let value = new DataView(new Uint8Array([0]).buffer); // ????
        try{
            value = await characteristic.readValue();
        } catch(e) {
            console.error(`characteristic.readValue: ${e}`);
        }
        return value;
    }
    isSupported() {
        if(!exists(navigator)) throw new Error(`Trying to use web-bluetooth in non-browser env!`);
        return 'bluetooth' in navigator;
    }
    isSwitchedOn() {
        return navigator.bluetooth.getAvailability();
    }
}

const ble = new WebBLE();

export { ble, _ };

