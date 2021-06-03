import { xf, first, empty, exists, delay } from '../functions.js';
import { Channel } from './channel.js';
import { message } from './message.js';

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
        let timeout = 100;

        await self.write(message.UnassignChannel(config).buffer);
        await delay(timeout);
        await self.write(message.SetNetworkKey(config).buffer);
        await delay(timeout);
        await self.write(message.AssignChannelExt(Object.assign(config, {extended: 0x01})).buffer);
        await delay(timeout);
        await self.write(message.ChannelId(config).buffer);
        await delay(timeout);
        await self.write(message.EnableExtRxMessages(Object.assign(config, {enable: 1})).buffer);
        await delay(timeout);
        await self.write(message.LowPrioritySearchTimeout(config).buffer);
        await self.write(message.SearchTimeout(config).buffer);
        await self.write(message.ChannelFrequency(config).buffer);
        await self.write(message.ChannelPeriod(config).buffer);
        await self.write(message.OpenChannel(config).buffer);
        self.isOpen = true;
        console.log(`:channel-${self.number} :open`);
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
    }
    async stop() {
        const self = this;
        let config = self.toMessageConfig();
        await self.write(message.EnableExtRxMessages(Object.assign(config, {enable: 0})).buffer);
        self.close();
        self.devices = [];
        xf.dispatch('ant:search:stopped');
    }
    isStarted() {
        const self = this;
        return self.isOpen;
    }
}

export { SearchChannel };
