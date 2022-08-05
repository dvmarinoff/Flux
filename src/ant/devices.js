import { xf, equals, exists, existance, empty, last, dataviewToArray, delay } from '../functions.js';
import { time } from '../utils.js';
import { ids, events, keys } from './constants.js';
import { message } from './message.js';
import { fec } from './fec.js';
import { hr } from './hr.js';
import { Q } from './q.js';

function profileToDeviceType(profile) {
    if(equals(profile, 'hrm')) return 120;
    if(equals(profile, 'fec')) return 17;
    return undefined;
}

function Device(args = {}) {
    const defaults = {
        profile: 'generic',
        name:    'ant:device',
        onData:  ((x) => x),
    };

    const name          = existance(args.name, defaults.name);

    const onData        = existance(args.onData, defaults.onData);
    const profile       = existance(args.profile, defaults.profile);
    const channelNumber = existance(args.channelNumber, defaults.channelNumber);
    const q             = Q();
    const deviceType    = profileToDeviceType(profile);

    let deviceNumber     = 0;
    let transmissionType = 0;
    let _connected   = false;

    function start() {
        const self = this;
        console.log(`:ant :${profile} :start`);
        xf.sub(`ui:${name}:switch`, onSwitch.bind(self));
        xf.sub(`ant:search:pair`, onPair.bind(self));
        xf.sub(`ant:driver:${channelNumber}:rx`, onRx.bind(self));
    }

    function stop() {
        const self = this;
        console.log(`:ant :${profile} :stop`);
        xf.unsub(`ui:${name}:switch`, onSwitch.bind(self));
        xf.unsub(`ant:driver:${channelNumber}:rx`, onRx.bind(self));
    }

    function onSwitch() {
        if(isConnected()) {
            disconnect();
        } else {
            connect();
        }
    }

    function onPair(channelId) {
        if(equals(channelId.deviceType, deviceType)) {
            pair(channelId);
        }
    }

    function pair(channelId) {
        deviceNumber     = channelId.deviceNumber;
        transmissionType = channelId.transmissionType;
        track();
    }

    async function search() {
        const config = channelConfig.get({
            profile, channelNumber, status: 'searching'
        });

        xf.dispatch('ant:search:start');
        xf.dispatch(`${name}:connecting`);
        console.log(`:channel :${channelNumber} :search `, config);

        write(message.unassignChannel.encode(config)); // 65
        await write(message.setNetworkKey.encode(config)); // 70
        await write(message.assignChannel.encode(config)); // 66
        await write(message.setChannelId.encode(config));  // 81
        await write(message.enableExtRxMessages.encode(config)); // 102
        await write(message.lowPrioritySearchTimeout.encode(config)); // 99
        await write(message.searchTimeout.encode(config)); // 68
        await write(message.setChannelFrequency.encode(config)); // 69
        await write(message.setChannelPeriod.encode(config)); // 67
        await write(message.openChannel.encode(config)); // 75
        // write(message.requestChannelStatus.encode(config)); // 77
    }

    async function track() {
        const config = channelConfig.get({
            profile,
            channelNumber,
            deviceNumber,
            transmissionType,
            status: 'tracking'
        });

        console.log(`:channel :${channelNumber} :track `, config);

        await write(message.enableExtRxMessages.encode(config)); // 102
        await write(message.closeChannel.encode(config)); // 76
        await delay(2000); // ?? here should wait for something maybe channel event 7
        await write(message.unassignChannel.encode(config)); // 65
        await write(message.setNetworkKey.encode(config)); // 70
        await write(message.assignChannel.encode(config)); // 66
        await write(message.setChannelId.encode(config)); //81
        await write(message.setChannelFrequency.encode(config)); // 69
        await write(message.setChannelPeriod.encode(config)); // 67
        await write(message.openChannel.encode(config)); //75
        xf.dispatch(`${name}:connected`);
    }

    async function close() {
        await write(message.closeChannel.encode({channelNumber}));
        xf.dispatch(`${name}:disconnected`);
    }

    function isConnected() {
        return _connected;
    }

    function connect() {
        search();
        _connected = true;
    }

    function disconnect() {
        close();
        _connected = false;
    }

    function onRx(dataview) {
        let decoded;

        if(message.isResponse(dataview)) {
            decoded = message.channelResponse.decode(dataview);
            onResponse(decoded);
        }
        if(message.isEvent(dataview)) {
            decoded = message.channelEvent.decode(dataview);
            onEvent(decoded);
        }
        if(message.isBroadcast(dataview)) {
            decoded = message.broadcastData.decode(dataview);

            if(exists(decoded.channelId)) {
                xf.dispatch('ant:search:found', decoded.channelId);
            }
            onData(decoded.payload);
        }
    }
    function onResponse(decoded) {
        q.pull(decoded);
    }
    function onEvent(decoded) {
        if(equals(decoded.eventCode, events.event_channel_closed)) {
        }
    }

    async function write(dataview) {

        console.log(`[${time()}] :ant :tx ${dataviewToArray(dataview)}`);

        xf.dispatch('ant:driver:tx', dataview);
        await q.push(dataview);
    }

    return {
        q,
        start,
        stop,
        search,
        isConnected,
        connect,
        disconnect,
        write,
    };
}

function ChannelConfig() {
    const profiles = {
        hrm: {
            deviceType:    120,
            channelPeriod: 8070,
            rfFrequency:   57,
            networkKey:    keys.antPlus,
        },
        fec: {
            deviceType:    17,
            channelPeriod: 8192,
            rfFrequency:   57,
            networkKey:    keys.antPlus,
        },
    };

    const states = {
        searching: {
            enable:           1,
            extended:         0x01,
            searchTimeout:    0,
            lowSearchTimeout: 255,
        },
        tracking: {
            enable:           0,
            extended:         undefined,
            searchTimeout:    255, // 30,
            lowSearchTimeout: 2,
        },
    };

    function getProfile(value) {
        return profiles[value];
    }

    function getStatus(value) {
        return states[value];
    }

    function get(args = {}) {
        const status  = getStatus(args.status);
        const profile = getProfile(args.profile);
        return {
            channelNumber:    args.channelNumber,
            deviceNumber:     args.deviceNumber,
            channelType:      args.channelType || 0,
            transmissionType: args.transmissionType || 0,
            ...profile,
            ...status,
        };
    }

    return Object.freeze({
        get,
    });
}

const channelConfig = ChannelConfig();

function Controllable() {
    const name          = 'ant:controllable';
    const channelNumber = 1;
    const device        = Device({name, channelNumber, onData, profile: 'fec',});

    let _mode = 'erg';

    function start() {
        const self = this;
        device.start();
        console.log(':ant :controllable :start');
        xf.sub(`db:mode`, onMode.bind(self));
        xf.sub('db:powerTarget', onPowerTarget.bind(self));
        xf.sub('db:resistanceTarget', onResistanceTarget.bind(self));
        xf.sub('db:slopeTarget', onSlopeTarget.bind(self));
    }

    function stop() {
        const self = this;
        device.stop();
        xf.unsub(`db:mode`, onMode.bind(self));
        xf.unsub('db:powerTarget', onPowerTarget.bind(self));
        xf.unsub('db:resistanceTarget', onResistanceTarget.bind(self));
        xf.unsub('db:slopeTarget', onSlopeTarget.bind(self));
    }

    function onMode(value) {
        _mode = value;
    }

    function onPowerTarget(power) {
        console.log(power);
        if(device.isConnected() && (equals(_mode, 'erg'))) {
            setPowerTarget(power);
        }
    }

    function onResistanceTarget(resistance) {
        if(device.isConnected()) setResistanceTarget(resistance);
    }

    function onSlopeTarget(power) {
        if(device.isConnected()) setSlopeTarget(power);
    }

    function control(dataPage) {
        const view = message.acknowledgedData.encode({channelNumber, payload: dataPage});
        device.write(view);
    }

    function setPowerTarget(power) {
        return control(fec.dataPage49.encode({power}));
    }

    function setResistanceTarget(resistance) {
        return control(fec.dataPage48.encode({resistance}));
    }

    function setSlopeTarget(grade) {
        return control(fec.dataPage51.encode({grade}));
    }

    function onData(payload) {
        const data = existance(fec.decode(payload), {});

        if(exists(data.power)) {
            xf.dispatch('power', data.power);
        }

        if(exists(data.cadence)) {
            xf.dispatch('cadence', data.cadence);
        }

        if(exists(data.speed)) {
            xf.dispatch('speed', data.speed);
        }
    }

    return Object.freeze({
        isConnected: device.isConnected,
        connect:     device.connect,
        disconnect:  device.disconnect,
        start,
        stop,
        setPowerTarget,
        setResistanceTarget,
        setSlopeTarget,
        onData,
    });
}

function Hrm() {
    // {deviceNumber: 49647, deviceType: 120, transmissionType: 161}

    const name          = 'ant:hrm';
    const channelNumber = 2;
    const device        = Device({name, channelNumber, onData, profile: 'hrm',});

    function start() {
        device.start();
    }

    function stop() {
        device.stop();
    }

    function onData(payload) {
        const data = existance(hr.decode(payload), {});

        if(exists(data.heartRate)) {
            xf.dispatch('heartRate', data.heartRate);
        };
    }

    return Object.freeze({
        isConnected: device.isConnected,
        connect:     device.connect,
        disconnect:  device.disconnect,
        start,
        stop,
        onData,
    });
}

// function Devices() {
//     let hrm;
//     let controllable;

//     xf.sub('ant:driver:ready', function() {
//         hrm = HRM();
//         controllable = Controllable();

//         hrm.start();
//         controllable.start();
//     });
// }

export { Device, Controllable, Hrm };
