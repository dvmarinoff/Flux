import { xf, first, empty, xor, exists, delay } from '../functions.js';
import { message } from './message.js';

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

class Channel {
    constructor(args) {
        this._number       = args.number       || this.defaultNumber();
        this._type         = args.type         || this.defaultType();
        this._deviceType   = args.deviceType   || this.defaultDeviceType();
        this._deviceNumber = args.deviceNumber || this.defaultDeviceNumber();
        this._transType    = args.transType    || this.defaultTransType();
        this._period       = args.period       || this.defaultPeriod();
        this._frequency    = args.frequency    || this.defaultFrequency();
        this._timeout      = args.timeout      || this.defaultTimeout();
        this._timeoutLow   = args.timeoutLow   || this.defaultTimeoutLow();
        this._key          = args.key          || this.defaultKey();
        this.write         = args.write        || ((x) => x);
        this._status       = '';
        this.isOpen        = false;
        this.resq          = {};
        this.postInit(args);
    }
    postInit()            { return null; }
    get number()          { return this._number; }
    set number(x)         { return this._number = x; }
    get type()            { return this._type; }
    set type(x)           { return this._type = x; }
    get deviceType()      { return this._deviceType; }
    set deviceType(x)     { return this._deviceType = x; }
    get deviceNumber()    { return this._deviceNumber; }
    set deviceNumber(x)   { return this._deviceNumber = x; }
    get transType()       { return this._transType; }
    set transType(x)      { return this._transType = x; }
    get period()          { return this._period; }
    set period(x)         { return this._period = x; }
    get frequency()       { return this._frequency; }
    set frequency(x)      { return this._frequency = x; }
    get timeout()         { return this._timeout; }
    set timeout(x)        { return this._timeout = x; }
    get timeoutLow()      { return this._timeoutLow; }
    set timeoutLow(x)     { return this._timeoutLow = x; }
    get key()             { return this._key; }
    set key(x)            { return this._key = x; }
    get status()          { return this._status; }
    set status(x)         { return this._status = x; }
    setChannelId(id) {
        const self = this;
        self.deviceType   = id.deviceType   || self.defaultDeviceType();
        self.deviceNumber = id.deviceNumber || self.defaultDeviceNumber();
        self.transType    = id.transType    || self.defaultTransType();
    }
    defaultNumber()       { return 0; }
    defaultType()         { return 0; }
    defaultDeviceType()   { return 0; }
    defaultDeviceNumber() { return 0; }
    defaultTransType()    { return 0; }
    defaultPeriod()       { return 8192; }
    defaultFrequency()    { return 66; }
    defaultTimeout()      { return 12; }
    defaultTimeoutLow()   { return 2; }
    defaultKey()          { return keys.public; }
    async writeWithResponse(msg, id = 0, timeout = 3000) {
        const self = this;

        let timeoutId;
        let timeoutReject   = {};
        let timeoutResolve  = {};
        let responseReject  = {};
        let responseResolve = {};

        let timeoutPromise = new Promise((resolve, reject) => {
            timeoutReject  = resolve;
            timeoutResolve = reject;
            timeoutId = setTimeout(() => {
                timeoutReject(false);
                responseReject();
            }, timeout);
        });

        let responsePromise = new Promise((res, rej) => {
            responseReject  = rej;
            responseResolve = res;
            self.resq[id] = (x) => {
                responseResolve(x);
                clearTimeout(timeoutId);
                timeoutResolve();
            };
        });
        await self.write(msg);
        const res = await Promise.race([responsePromise, timeoutPromise])
                                 .catch((err) => { console.log(err); });
        return res;
    }
    async request(id) {
        const self = this;
        return await self.writeWithResponse(message.Request({channelNumber: self.number, request: id}).buffer, id);
    }
    async requestStatus() {
        const self = this;
        return await self.request(message.ids.channelStatus);
    }
    async open() {
        const self = this;
        let config = self.toMessageConfig();

        await self.writeWithResponse(message.UnassignChannel(config).buffer,
                                     message.ids.unassignChannel);
        await self.writeWithResponse(message.SetNetworkKey(config).buffer,
                                     message.ids.setNetworkKey);
        await self.writeWithResponse(message.AssignChannel(config).buffer,
                                     message.ids.assignChannel);
        await self.writeWithResponse(message.ChannelId(config).buffer,
                                     message.ids.setChannelId);
        await self.writeWithResponse(message.ChannelFrequency(config).buffer,
                                     message.ids.channelFrequency);
        await self.writeWithResponse(message.ChannelPeriod(config).buffer,
                                     message.ids.channelPeriod);
        await self.writeWithResponse(message.OpenChannel(config).buffer,
                                     message.ids.openChannel);
        await self.requestStatus();

        self.isOpen = true;
        console.log(`:channel ${self.number} :open`);
    }
    async close() {
        const self = this;
        let config = self.toMessageConfig();

        await self.writeWithResponse(message.CloseChannel(config).buffer, message.ids.closeChannel);
        await self.requestStatus();

        self.isOpen = false;
        return;
    }
    connect()    { this.open(); }
    disconnect() { this.close(); }
    onData(data) {
        const self = this;
        if(message.isBroadcast(data))         { self.onBroadcast(data); }
        if(message.isAcknowledged(data))      { self.onBroadcast(data); }
        if(message.isBurst(data))             { self.onBroadcast(data); }
        if(message.isResponse(data))          { self.onResponse(data); }
        if(message.isRequestedResponse(data)) { self.onRequestedResponse(data); }
        if(message.isEvent(data))             { self.onEvent(data); }
        if(message.isSerialError(data))       { self.onSerialError(data); }
        if(message.isBroadcastExt(data))      { self.onBroadcast(data); }
        if(message.isBurstAdv(data))          { self.onBroadcast(data); }
    }
    onBroadcast(data) {
        const self = this;
        return data;
    }
    onResponse(data) {
        const self = this;
        const { channel, id, toId, code } = message.readResponse(data);
        const idStr   = message.idToString(id);
        const toIdStr = message.idToString(toId);
        const codeStr = message.eventCodeToString(code);
        console.log(`:channel ${channel} :${toIdStr}: '${codeStr}' ${data}`);

        if(exists(self.resq[toId])) {
            self.resq[toId](codeStr);
        }
    }
    onRequestedResponse(data) {
        const self = this;
        let res;
        if(message.isChannelId(data)) {
            res = message.readChannelId(data);
            self.resq[message.ids.channelId](res);
        }
        if(message.isChannelStatus(data)) {
            res = message.readChannelStatus(data);
            console.log(`:channel ${self.number} :status :${res} ${data}`);
            self.resq[message.ids.channelStatus](res);
        }
        if(message.isANTVersion(data)) {
            res = message.readANTVersion(data);
            self.resq[message.ids.ANTVersion](res);
        }
        if(message.isCapabilities(data)){
            res = message.readCapabilities(data);
            self.resq[message.ids.capabilities](res);
        }
        if(message.isSerialNumber(data)){
            res = message.readSerialNumber(data);
            self.resq[message.ids.serialNumber](res);
        }
    }
    onEvent(data) {
        const self = this;
        const { channel, code } = message.readEvent(data);

        if(code === message.events.event_channel_closed) {
            self.resq[message.ids.closeChannel]();
        }
        console.log(`:channel ${channel} :event '${message.eventCodeToString(code)}' ${data}`);
    }
    onSerialError(error) {
        const self = this;
        console.error(`:serial :error`, error);
    }
    toMessageConfig() {
        const self = this;
        return {
            channelNumber: self.number,
            channelType:   self.type,
            deviceType:    self.deviceType,
            deviceNumber:  self.deviceNumber,
            transType:     self.transType,
            channelPeriod: self.period,
            rfFrequency:   self.frequency,
            timeout:       self.timeout,
            timeoutLow:    self.timeoutLow,
            key:           self.key,
        };
    }
}

export { Channel, ChannelTypes, keys };
