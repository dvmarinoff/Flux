import { message } from './message.js';
import { xf } from '../xf.js';
import { first, empty, conj, xor, exists, delay } from '../functions.js';
import { USB } from './usb.js';
import { Channel } from './channel.js';

const ChannelTypes = {
    slave: {
        bidirectional:       0x00,
        sharedBidirectional: 0x20,
        receiveOnly:         0x40,
    },
    master: {
        bidirectional:       0x10,
        sharedBidirectional: 0x30,
    }
};

const keys = {
    antPlus: [0xB9, 0xA5, 0x21, 0xFB, 0xBD, 0x72, 0xC3, 0x45],
    public:  [0xE8, 0xE4, 0x21, 0x3B, 0x55, 0x7A, 0x67, 0xC1],
};

const hrmFilter = {
    deviceType: 120,
    period: (32280 / 4),
    frequency: 57,
    key: keys.antPlus,
};

const fecFilter = {
    deviceType: 17,
    period: (32768 / 4),
    frequency: 57,
    key: keys.antPlus,
};

class FecChannel extends Channel {
    postInit(args) {}
    defaultNumber()     { return 2; }
    defaultType()       { return 0; }
    defaultDeviceType() { return 17; }
    defaultPeriod()     { return (32768 / 4); } // 8192
    defaultFrequency()  { return 57; }
    defaultKey()        { return keys.antPlus; }
    onBroadcast(data) {
        const page = message.FECPage(data);
        if(('power' in page) && !isNaN(page.power))   {
            xf.dispatch('ant:fec:power', page.power);
            xf.dispatch('device:pwr', page.power);
        };
        if(('cadence' in page) && !isNaN(page.cadence)) {
            xf.dispatch('ant:fec:cadence', page.cadence);
            xf.dispatch('device:cad', page.cadence);
        };
        if(('speed' in page) && !isNaN(page.speed)) {
            xf.dispatch('ant:fec:speed', page.speed);
            xf.dispatch('device:spd', page.speed);
        };
    }
    connect() {
        const self = this;
        console.log(self.toMessageConfig());
        self.open();
        xf.dispatch('ant:fec:connected');
    }
    disconnect() {
        const self = this;
        self.close();
        xf.dispatch('ant:fec:disconnected');
    }

}

class HrmChannel extends Channel {
    postInit(args) {}
    defaultNumber()     { return 1; }
    defaultType()       { return 0; }
    defaultDeviceType() { return 120; }
    defaultPeriod()     { return (32280 / 4); }
    defaultFrequency()  { return 57; }
    defaultKey()        { return keys.antPlus; }
    onBroadcast(data) {
        const page = message.HRPage(data);
        if(!isNaN(page.hr)) {
            xf.dispatch('ant:hr', page.hr);
            xf.dispatch('device:hr', page.hr);
        }
        if('model' in page) {
            console.log(`model: ${page.model}`);
        }
        if('level' in page) {
            console.log(`level: ${page.level}`);
        }
    }
    async connect() {
        const self = this;
        console.log(self.toMessageConfig());
        await self.open();
        xf.dispatch('ant:hrm:connected');
    }
    disconnect() {
        const self = this;
        self.close();
        xf.dispatch('ant:hrm:disconnected');
    }
    isConnected() {
        const self = this;
        return self.isOpen;
    }
}

function isValidDeviceId(id) {
    if(id.deviceNumber === undefined || isNaN(id.deviceNumber)) return false;
    if(id.deviceType   === undefined || isNaN(id.deviceType)) return false;
    if(id.transType    === undefined || isNaN(id.transType)) return false;
    return true;
}
function includesDevice(devices, id) {
    return devices.filter(d => d.deviceNumber === id.deviceNumber).length > 0;
}

class SearchChannel extends Channel {
    postInit(args) {
        this.devices = [];
    }
    defaultNumber()     { return 0; }
    defaultType()       { return 0; }
    defaultDeviceType() { return 0; }
    defaultTimeoutLow() { return 255; }
    defaultTimeout()    { return 0; }
    async open() {
        const self = this;
        let config = self.toMessageConfig();
        console.log(self.toMessageConfig());

        await self.write(message.UnassignChannel(config).buffer);

        await self.write(message.SetNetworkKey(config).buffer);
        await self.write(message.AssignChannelExt(conj(config, {extended: 0x01})).buffer);
        await self.write(message.ChannelId(config).buffer);
        await self.write(message.EnableExtRxMessages(conj(config, {enable: 1})).buffer);
        await self.write(message.LowPrioritySearchTimeout(config).buffer);
        await self.write(message.SearchTimeout(config).buffer);
        await self.write(message.ChannelFrequency(config).buffer);
        await self.write(message.ChannelPeriod(config).buffer);
        await self.write(message.OpenChannel(config).buffer);
        self.isOpen = true;
        console.log(`channel:open ${self.number}`);
    }
    onBroadcast(data) {
        const self = this;
        const { deviceNumber, deviceType, transType } = message.readExtendedData(data);
        const device = { deviceNumber, deviceType, transType };
        if(isValidDeviceId(device)) {
            if(!includesDevice(self.devices, device)) {
                self.devices.push(device);
                console.log(`Search found: ${deviceNumber} ${deviceType} ${transType}`);
                xf.dispatch(`ant:search:device-found`, device);
            }
        }
    }
    async start(filters) {
        const self = this;

        self.deviceType = filters.deviceType || self.defaultDeviceType;
        self.period     = filters.period     || self.defaultPeriod;
        self.frequency  = filters.frequency  || self.defaultFrequency;
        self.key        = filters.key        || self.defaultKey;

        self.devices = [];
        await self.open();
        xf.dispatch('ant:search:started');
        let status = await self.requestStatus();
        console.log(status);
    }
    async stop() {
        const self = this;
        let config = self.toMessageConfig();
        await self.write(message.EnableExtRxMessages(conj(config, {enable: 0})).buffer);
        self.close();
        xf.dispatch('ant:search:stopped');
    }
    isStarted() {
        const self = this;
        return self.isOpen;
    }
}

class AntDevice {
    constructor(args) {
        this.name      = args.name     || this.defaultName();
        this.filters   = args.filters  || this.defaultFilters();
        this.deviceId  = args.deviceId || this.defaultDeviceId();
        this.ant       = args.ant;
        this.connected = false;
        this.channelClass = args.channelClass || this.defaultChannelClass();
        this.init();
        this.postInit();
    }
    defaultName() { return 'antDevice'; }
    defaultDeviceId() {
        return { deviceNumber: 0, deviceType: 0, transType: 0 };
    }
    defaultFilters() {
        return {
            deviceType: 0,
            period: (32280 / 4),
            frequency: 57,
            key: keys.antPlus,
        };
    }
    defaultChannelClass() { return Channel; }
    async init() {
        const self = this;
        self.channel = new self.channelClass({write: ant.write.bind(ant)}); // -> this.ant.write
        ant.addChannel(self.channel.number, self.channel);
    }
    postInit() { return; }
    async request() {
        const self = this;
        return await ant.requestDevice({filters: self.filters});
    }
    async connect() {
        const self = this;
        xf.dispatch(`${self.name}:connecting`);

        try {
            self.deviceId = await self.request();
            self.channel.setChannelId(self.deviceId);
            await self.channel.connect();
            self.connected = true;
            xf.dispatch(`${self.name}:connected`);
        } catch(err) {
            xf.dispatch(`${self.name}:disconnected`);
            console.log(`Ant Device request was canceled or failed.`);
            console.log(err);
        }
    }
    disconnect() {
        const self = this;
        self.channel.disconnect();
        self.connected = false;
        xf.dispatch(`${self.name}:disconnected`);
    }
}

class AntHrm extends AntDevice {
    async postInit() {
        const self = this;
    }
    defaultName() { return 'antHrm'; }
    defaultChannelClass() { return HrmChannel; }
    defaultDeviceId() {
        return {deviceNumber: 0, deviceType: 120, transType: 0};
    }
    defaultFilters() {
        return {
            deviceType: 120,
            period: (32280 / 4),
            frequency: 57,
            key: keys.antPlus,
        };
    }
}

class AntFec extends AntDevice {
    async postInit() {
        const self = this;
    }
    defaultName() { return 'antFec'; }
    defaultChannelClass() { return FecChannel; }
    defaultDeviceId() {
        return {deviceNumber: 0, deviceType: 17, transType: 0};
    }
    defaultFilters() {
        return {
            deviceType: 17,
            period: (32768 / 4),
            frequency: 57,
            key: keys.antPlus,
        };
    }
    async setPowerTarget(power) {
        const self   = this;
        const buffer = message.powerTarget(power, self.channel.number).buffer;
        self.channel.write(buffer);
    }
    async setResistanceTarget(level) {
        const self = this;
        const buffer = message.resistanceTarget(level, self.channel.number).buffer;
        self.channel.write(buffer);
    }
    async setSlopeTarget(args) {
        const self = this;
        const buffer = message.slopeTarget(args.grade, self.channel.number).buffer;
        self.channel.write(buffer);
    }
}

class Ant {
    constructor(args) {
        this.driver   = {};
        this.channels = {};
        this.ready    = false;
        this.init();
    }
    async init() {
        const self = this;
        self.search = new SearchChannel({write: self.write.bind(self)});
        self.addChannel(0, self.search);

        xf.sub(`db:antDeviceId`, deviceId => {
            self.deviceId = deviceId;
        });

        xf.sub(`ui:ant:device:pair`,   e => {
            self.onPair(self.deviceId);
            self.search.stop();
        });
        xf.sub(`ui:ant:device:cancel`, e => {
            self.search.stop();
            self.onCancel();
        });

        // USB
        xf.sub('ant:disconnected', _ => {
            self.search.disconnect();
            this.ready = false;
        });

        xf.sub('usb:ready', _ => {
            console.log('usb:ready');
            self.ready = true;

            // restore state on page reload
            Object.values(self.channels).forEach(channel => channel.disconnect());
        });

        self.driver = new USB({onData: self.onData.bind(self)});
        await self.driver.init();
    }
    isAvailable() {
        const self = this;
        return self.driver.isAvailable();
    }
    async requestDevice(args) {
        const self = this;
        const filters = args.filters;
        await self.search.start(filters);
        xf.dispatch(`ant:device:request`);

        return new Promise((resolve, reject) => {
            self.onPair   = resolve;
            self.onCancel = reject;
        });
    }
    addChannel(number, channel) {
        const self = this;
        self.channels[number] = channel;
    }
    onData(data) {
        const self = this;
        if(message.isValid(data)) {
            let number = message.readChannel(data);
            if(self.channels[number] !== undefined) {
                self.channels[number].onData(data);
            }
        }
    }
    write(buffer) {
        const self = this;
        self.driver.write(buffer);
    }
}

const ant = new Ant();

export { ant, AntHrm, AntFec };
