import { xf, exists } from '../functions.js';
import { Channel, keys } from './channel.js';
import { message } from './message.js';
import { ant } from './ant.js';

class Device {
    constructor(args) {
        if(!exists(args)) args = {};
        this.name      = args.name     || this.defaultName();
        this.filters   = args.filters  || this.defaultFilters();
        this.deviceId  = args.deviceId || this.defaultDeviceId();
        this.id        = args.id       || this.defaultId();
        this.ant       = args.ant;
        this.connected = false;
        this.channelClass = args.channelClass || this.defaultChannelClass();
        this.init();
        this.postInit();
    }
    defaultName() { return 'ANT+ Device'; }
    defaultId() { return 'ant:device'; }
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
        self.channel = new self.channelClass({
            write: ant.write.bind(ant),
            dispatchBroadcast: self.onData.bind(self)
        }); // -> this.ant.write
        ant.addChannel(self.channel.number, self.channel);

        xf.sub(`ui:${self.id}:switch`, async () => {
            if(self.connected) {
                self.disconnect();
            } else {
                self.connect();
            }
        });
    }
    postInit() { return; }
    async request(args) {
        const deviceId = await ant.requestDevice(args);
        return deviceId;
    }
    async connect() {
        const self = this;
        xf.dispatch(`${self.id}:connecting`);

        try {
            self.deviceId = await self.request({filters: self.filters});
            self.channel.setChannelId(self.deviceId);
            await self.channel.connect();
            self.connected = true;
            xf.dispatch(`${self.id}:connected`);
            let name = exists(self.deviceId.deviceNumber) ? self.deviceId.deviceNumber : 'Unknown';
            xf.dispatch(`${self.id}:name`, name);
        } catch(err) {
            xf.dispatch(`${self.id}:disconnected`);
            console.error(`:ant 'Could not request ${self.id}'`, err);
        }
    }
    disconnect() {
        const self = this;
        self.channel.disconnect();
        self.connected = false;
        xf.dispatch(`${self.id}:disconnected`);
    }
    onData(data) {
        const self = this;
        console.log(`${self.id} :data`, data);
    }
}

export { Device };
