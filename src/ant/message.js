import { equals, exists, existance, isUndefined,
         dataviewToArray, nthBitToBool, xor } from '../functions.js';
import { ids, events, channelTypes, values, keys } from './constants.js';

function Message(args = {}) {
    const sync        = values.sync;
    const id          = ids[existance(args.id)];
    const fixedLength = 4;
    let _contentLength;
    let _totalLength;

    setLengths(existance(args.contentLength, 0));

    function getLength() {
        return _totalLength;
    }
    function setLength(length) {
        _totalLength = length;
        return _totalLength;
    }

    function getContentLength() {
        return _contentLength;
    }
    function setContentLength(length) {
        _contentLength = length;
        return _contentLength;
    }

    function calcLength(contentLength) {
        return fixedLength + contentLength;
    }

    function setLengths(contentLength) {
        const length = calcLength(contentLength);
        setContentLength(contentLength);
        setLength(length);
        return { length, contentLength };
    }

    function validate(dataview, check) {
        return equals(xor(dataview, 0, -1), check);
    }

    return {
        sync,
        id,
        fixedLength,

        getContentLength,
        setContentLength,
        getLength,
        calcLength,
        setLengths,
        validate,
        xor: xor,
    };
}

// Config messages
function AssignChannel() {
    const extendedAssignment = {
        backgroundScanningEnable:       0x01,
        frequencyAgilityEnable:         0x04,
        fastChannelInitiationEnable:    0x10,
        asynchronousTransmissionEnable: 0x20
    };

    const defaults = {
        channelNumber: 0,
        channelType:   channelTypes.slave.bidirectional,
        networkNumber: 0,
        extended:      extendedAssignment.backgroundScanningEnable
    };

    const msg = Message({
        id: 'assignChannel', // 66, 0x42
    });

    function contentLength(isExtended) {
        if(isExtended) return 4;
        return 3;
    }

    function encode(args = {}) {
        const { length } = msg.setLengths(contentLength(exists(args.extended)));
        const xorIndex   = length - 1;

        const channelNumber = existance(args.channelNumber, defaults.channelNumber);
        const channelType   = existance(args.channelType, defaults.channelType);
        const networkNumber = existance(args.networkNumber, defaults.networkNumber);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, channelType, true);
        view.setUint8(5, networkNumber, true);

        if(exists(args.extended)) {
            view.setUint8(6, args.extended, true);
        }

        view.setUint8(xorIndex, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const contentLength = dataview.getUint8(1, true);
        const id            = dataview.getUint8(2, true);
        const channelNumber = dataview.getUint8(3, true);
        const channeType    = dataview.getUint8(4, true);
        const networkNumber = dataview.getUint8(5, true);
        const xorIndex      = dataview.byteLength - 1;
        const check         = dataview.getUint8(xorIndex, true);
        const valid         = msg.validate(dataview, check);

        const res = {
            id,
            channelNumber,
            channeType,
            networkNumber,
            valid,
        };

        let extended;
        if(equals(contentLength, 4)) {
            extended = dataview.getUint8(6, true);
            res.extended = extended;
        }

        return res;
    }

    return Object.freeze({
        extendedAssignment,
        contentLength,
        encode,
        decode,
    });
}

function UnassignChannel() {
    const defaults = {
        channelNumber: 0,
    };

    const msg = Message({
        contentLength: 1,
        id: 'unassignChannel', // 65, 0x41
    });
    const length = msg.getLength();

    function encode(args = {}) {
        const channelNumber = existance(args.channelNumber, defaults.channelNumber);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id            = dataview.getUint8(2, true);
        const channelNumber = dataview.getUint8(3, true);
        const check         = dataview.getUint8(4, true);
        const valid         = msg.validate(dataview, check);

        return {
            id,
            channelNumber,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function SetChannelId() {
    const defaults = {
        channelNumber:    0,
        deviceNumber:     0,
        deviceType:       0,
        transmissionType: 0
    };

    const msg = Message({
        contentLength: 5,
        id: 'setChannelId',
    });
    const length = msg.getLength();

    function encode(args = {}) {
        const channelNumber    = existance(args.channelNumber, defaults.channelNumber);
        const deviceNumber     = existance(args.deviceNumber, defaults.deviceNumber);
        const deviceType       = existance(args.deviceType, defaults.deviceType);
        const transmissionType = existance(args.transmissionType, defaults.transmissionType);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8( 0, msg.sync, true);
        view.setUint8( 1, msg.getContentLength(), true);
        view.setUint8( 2, msg.id, true);
        view.setUint8( 3, channelNumber, true);
        view.setUint16(4, deviceNumber, true);
        view.setUint8( 6, deviceType, true);
        view.setUint8( 7, transmissionType, true);
        view.setUint8( 8, msg.xor(view),  true);

        return view;
    }

    function decode(dataview) {
        const id               = dataview.getUint8( 2, true);
        const channelNumber    = dataview.getUint8( 3, true);
        const deviceNumber     = dataview.getUint16(4, true);
        const deviceType       = dataview.getUint8( 6, true);
        const transmissionType = dataview.getUint8( 7, true);
        const check            = dataview.getUint8( 8, true);
        const valid            = msg.validate(dataview, check);

        return {
            id,
            channelNumber,
            deviceNumber,
            deviceType,
            transmissionType,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function SetChannelPeriod() {
    const defaults = {
        channelNumber: 0,
        channelPeriod: 8192, // (4Hz)
    };

    const msg = Message({
        contentLength: 3,
        id: 'channelPeriod', // 67, 0x43
    });
    const length = msg.getLength();

    // The channel messaging period in seconds * 32768.
    // Maximum messaging period is ~2 seconds.

    function encode(args = {}) {
        const channelNumber = existance(args.channelNumber, defaults.channelNumber);
        const channelPeriod = existance(args.channelPeriod, defaults.channelPeriod);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8( 0, msg.sync, true);
        view.setUint8( 1, msg.getContentLength(), true);
        view.setUint8( 2, msg.id, true);
        view.setUint8( 3, channelNumber, true);
        view.setUint16(4, channelPeriod, true);
        view.setUint8( 6, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id            = dataview.getUint8( 2, true);
        const channelNumber = dataview.getUint8( 3, true);
        const channelPeriod = dataview.getUint16(4, true);
        const check         = dataview.getUint8( 6, true);
        const valid         = msg.validate(dataview, check);

        return {
            id,
            channelNumber,
            channelPeriod,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function SetChannelFrequency() {
    const defaults = {
        channelNumber: 0,
        rfFrequency:   66,
    };

    const msg = Message({
        contentLength: 2,
        id: 'channelFrequency', // 69, 0x45
    });
    const length = msg.getLength();

    // ChannelFrequency = 2400 MHz + ChannelRFFrequencyNumber * 1.0 MHz
    // most ANT devices ara between 2450 MHz and 2457 MHz

    function encode(args = {}) {
        const channelNumber = existance(args.channelNumber, defaults.channelNumber);
        const rfFrequency   = existance(args.rfFrequency, defaults.rfFrequency);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, rfFrequency, true);
        view.setUint8(5, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id            = dataview.getUint8(2, true);
        const channelNumber = dataview.getUint8(3, true);
        const rfFrequency   = dataview.getUint8(4, true);
        const check         = dataview.getUint8(5, true);
        const valid         = msg.validate(dataview, check);

        return {
            id,
            channelNumber,
            rfFrequency,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function SetNetworkKey() {
    const defaults = {
        networkKey:    keys.public,
        networkNumber: 0,
    };

    const networkKeyIndex    = 4;
    const networkKeyLength   = 8;
    const networkKeyIndexEnd = networkKeyIndex + networkKeyLength;
    const xorIndex           = 12;

    const msg = Message({
        contentLength: 9,
        id: 'setNetworkKey', // 70, 0x46
    });
    const length = msg.getLength();

    function encode(args = {}) {
        const networkKey    = existance(args.networkKey, defaults.networkKey);
        const networkNumber = existance(args.networkNumber, defaults.networkNumber);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        const uint8  = new Uint8Array(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, networkNumber, true);

        uint8.set(new Uint8Array(networkKey), networkKeyIndex);

        view.setUint8(xorIndex, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id            = dataview.getUint8(2, true);
        const networkNumber = dataview.getUint8(3, true);
        const array         = dataviewToArray(dataview);
        const networkKey    = array.slice(networkKeyIndex, networkKeyIndexEnd);
        const check         = dataview.getUint8(xorIndex, true);
        const valid         = msg.validate(dataview, check);

        return {
            id,
            networkNumber,
            networkKey,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

// Control Messages
function ResetSystem() {
    const msg = Message({
        contentLength: 1,
        id: 'resetSystem',  // 74, 0x4A
    });
    const length = msg.getLength();

    function encode(args = {}) {
        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, 0, true);
        view.setUint8(4, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id    = dataview.getUint8(2, true);
        const check = dataview.getUint8(4, true);
        const valid = msg.validate(dataview, check);

        return {
            id,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function OpenChannel() {
    const defaults = {
        channelNumber: 0,
    };

    const msg = Message({
        contentLength: 1,
        id: 'openChannel', // 75, 0x4B
    });
    const length = msg.getLength();

    function encode(args = {}) {
        const channelNumber = existance(args.channelNumber, defaults.channelNumber);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id            = dataview.getUint8(2, true);
        const channelNumber = dataview.getUint8(3, true);
        const check         = dataview.getUint8(4, true);
        const valid         = msg.validate(dataview, check);

        return {
            id,
            channelNumber,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function CloseChannel() {
    const defaults = {
        channelNumber: 0,
    };

    const msg = Message({
        contentLength: 1,
        id: 'closeChannel', // 76, 0x4C
    });
    const length = msg.getLength();

    function encode(args = {}) {
        const channelNumber = existance(args.channelNumber, defaults.channelNumber);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id            = dataview.getUint8(2, true);
        const channelNumber = dataview.getUint8(3, true);
        const check         = dataview.getUint8(4, true);
        const valid         = msg.validate(dataview, check);

        return {
            id,
            channelNumber,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function RequestMessage(args = {}) {
    const defaults = {
        channelNumber:      0,
        subMessageId:       false,
        requestedMessageId: existance(args.requestedMessageId, ids.channelStatus),
    };

    const msg = Message({
        contentLength: 2,
        id: 'requestMessage', // 77, 0x4D
    });
    const length = msg.getLength();

    function encode(args = {subMessageId: false}) {
        const channelNumber      = existance(args.channelNumber, defaults.channelNumber);
        const subMessageId       = existance(args.subMessageId, defaults.subMessageId);
        const requestedMessageId = existance(args.requestedMessageId, defaults.requestedMessageId);

        // it sends channelNumber or subMessageId if command is applicable for the whole system,
        // Example:
        // if requesting Advanced Burst Capabilities/Configuration,
        // instead of channel number, set to:
        // 0x00 – Request Advanced Burst Capabilities
        // 0x01 – Request Advanced Burst Current Configuration

        const param = channelNumber;
        if(subMessageId) param = subMessageId;

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, param, true);
        view.setUint8(4, requestedMessageId, true);
        view.setUint8(5, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id                 = dataview.getUint8(2, true);
        const param              = dataview.getUint8(3, true);
        const requestedMessageId = dataview.getUint8(4, true);
        const check              = dataview.getUint8(5, true);
        const valid              = msg.validate(dataview, check);

        const res = {
            id,
            param,
            requestedMessageId,
            valid,
        };

        return res;
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function OpenRxScanMode() {
    const msg = Message({
        id: 'openRxScanMode', // 91, 0x5B
    });

    function contentLength(args) {
        if(exists(args.syncPackets)) return  2;
        return 1;
    }

    // syncPackets:
    // 0 – Default configuration.
    // 1 – Allow synchronous channel packets only.

    function encode(args = {}) {
        const syncPackets = args.syncPackets;
        const { length }  = msg.setLengths(contentLength(args));
        const xorIndex    = length - 1;

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, 0, true);

        if(exists(syncPackets)) {
            view.setUint8(4, syncPackets, true);
        }

        view.setUint8(xorIndex, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const contentLength = dataview.getUint8(1, true);
        const id            = dataview.getUint8(2, true);
        const xorIndex      = dataview.byteLength - 1;
        const check         = dataview.getUint8(xorIndex, true);
        const valid         = msg.validate(dataview, check);

        let syncPackets;

        const res = {
            id,
            valid,
        };

        if(equals(contentLength, 2)) {
            syncPackets = dataview.getUint8(4, true);
            res.syncPackets = syncPackets;
        }

        return res;
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function Sleep() {
    const msg = Message({
        contentLength: 1,
        id: 'sleepMessage', // 197, 0xC5
    });
    const length = msg.getLength();

    function encode(args = {}) {
        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, 0, true);
        view.setUint8(4, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id            = dataview.getUint8(2, true);
        const check         = dataview.getUint8(4, true);
        const valid         = msg.validate(dataview, check);

        return {
            id,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function SearchTimeout() {
    const defaults = {
        channelNumber: 0,
        searchTimeout: 10, // 10 * 2.5 seconds = 25 seconds
    };

    const msg = Message({
        contentLength: 2,
        id: 'searchTimeout', // 68, 0x44
    });
    const length = msg.getLength();

    function encode(args = {}) {
        const channelNumber = existance(args.channelNumber, defaults.channelNumber);
        const searchTimeout = existance(args.searchTimeout, defaults.searchTimeout);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, searchTimeout, true);
        view.setUint8(5, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id            = dataview.getUint8(2, true);
        const channelNumber = dataview.getUint8(3, true);
        const searchTimeout = dataview.getUint8(4, true);
        const check         = dataview.getUint8(5, true);
        const valid         = msg.validate(dataview, check);

        return {
            id,
            channelNumber,
            searchTimeout,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function LowPrioritySearchTimeout() {
    const defaults = {
        channelNumber:    0,
        lowSearchTimeout: 2, // 2 * 2.5 seconds = 5 seconds, 255 is infinite
    };

    const msg = Message({
        contentLength: 2,
        id: 'searchLowTimeout', // 99, 0x63
    });
    const length = msg.getLength();

    function encode(args = {}) {
        const channelNumber    = existance(args.channelNumber, defaults.channelNumber);
        const lowSearchTimeout = existance(args.lowSearchTimeout,
                                        defaults.lowSearchTimeout);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, lowSearchTimeout, true);
        view.setUint8(5, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id               = dataview.getUint8(2, true);
        const channelNumber    = dataview.getUint8(3, true);
        const lowSearchTimeout = dataview.getUint8(4, true);
        const check            = dataview.getUint8(5, true);
        const valid            = msg.validate(dataview, check);

        return {
            id,
            channelNumber,
            lowSearchTimeout,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function EnableExtRxMessages() {
    const defaults = {
        enable: 1, // 0 disable, 1 enable
    };

    const msg = Message({
        contentLength: 2,
        id: 'enableExtRx', // 102, 0x66
    });
    const length = msg.getLength();

    function encode(args = {}) {
        const enable = existance(args.enable, defaults.enable);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, 0, true);
        view.setUint8(4, enable, true);
        view.setUint8(5, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id            = dataview.getUint8(2, true);
        const channelNumber = dataview.getUint8(3, true);
        const enable        = dataview.getUint8(4, true);
        const check         = dataview.getUint8(5, true);
        const valid         = msg.validate(dataview, check);

        return {
            id,
            channelNumber,
            enable,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function LibConfig() {
    const defaults = {
        config: values.libConfig.disabled
    };

    const msg = Message({
        contentLength: 2,
        id: 'libConfig', // 110, 0x6E
    });
    const length = msg.getLength();

    function encode(args = {}) {
        const config = existance(args.config, defaults.config);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, 0, true);
        view.setUint8(4, config, true);
        view.setUint8(5, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id            = dataview.getUint8(2, true);
        const config        = dataview.getUint8(4, true);
        const check         = dataview.getUint8(5, true);
        const valid         = msg.validate(dataview, check);

        return {
            id,
            config,
            valid,
        };
    }

    return Object.freeze({
        values,
        encode,
        decode,
    });
}

function Data(args = {}) {
    const defaults = {
        channelNumber: 0,
        typeId: 'broadcastData',
        payload: (length) => new Uint8Array(new ArrayBuffer(length)),
    };

    const payloadIndex      = 4;
    const payloadLength     = 8;
    const extendedDataIndex = payloadIndex + payloadLength;
    const flagIndex         = 12;

    const typeId = existance(args.typeId, defaults.typeId);

    function contentLength(args = {}) {
        if(exists(args.extended)) return 9 + args.extended.byteLength;
        return 9;
    }

    const msg = Message({
        id: typeId,
    });

    // Configuring extended data with:
    // - EnableExtendedMessages, sends ChannelId (Device number, Device Type, Transmission Type)
    // - LibConfig, sends ChannelId, RSSI and timestamp


    function encode(args = {}) {
        const { length } = msg.setLengths(contentLength(args));
        const xorIndex   = length - 1;

        const channelNumber = existance(args.channelNumber, defaults.channelNumber);
        const payload       = existance(args.payload,       defaults.payload(0));

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        const uint8  = new Uint8Array(buffer);

        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, channelNumber, true);

        uint8.set(new Uint8Array(payload.buffer), payloadIndex);

        if(exists(args.extended)) {
            uint8.set(new Uint8Array((args.extended).buffer), extendedDataIndex);
        }

        view.setUint8(xorIndex, msg.xor(view), true);

        return view;
    }

    function decode(dataview, payloadDecoder = undefined) {
        const contentLength = dataview.getUint8(1, true);
        const id            = dataview.getUint8(2, true);
        const channelNumber = dataview.getUint8(3, true);
        const xorIndex      = dataview.byteLength - 1;
        const check         = dataview.getUint8(xorIndex, true);
        const valid         = msg.validate(dataview, check);

        let payload = new DataView(new ArrayBuffer(contentLength - 1)); // must be dataview

        for(let i = 0; i < contentLength-1; i++) {
            payload.setUint8(i, dataview.getUint8(payloadIndex + i, true), true);
        }

        if(exists(payloadDecoder)) {
            payload = payloadDecoder(payload);
        }

        const res = {
            id,
            channelNumber,
            payload,
            valid,
        };

        if(isExtended(dataview)) {
            const channelId = channelIdDecoder(dataview);
            res.channelId = channelId;
        }

        return res;
    }

    function channelIdDecoder(dataview) {
        const deviceNumber     = dataview.getUint16(13, true);
        const deviceType       = dataview.getUint8(15, true);
        const transmissionType = dataview.getUint8(16, true);

        return {
            deviceNumber,
            deviceType,
            transmissionType,
        };
    }

    function isBroadcast(dataview) {
        return equals(dataview.getUint8(2, true), ids.broadcastData);
    }

    function isAcknowledged(dataview) {
        return equals(dataview.getUint8(2, true), ids.acknowledgedData);
    }

    function isExtended(dataview) {
        return dataview.byteLength > 13;
    }

    return Object.freeze({
        isBroadcast,
        isAcknowledged,
        isExtended,
        encode,
        decode,
        channelIdDecoder,
    });
}

function BroadcastData() {
    return Data({typeId: 'broadcastData'}); // 78, 0x4E
}

function AcknowledgedData() {
    return Data({typeId: 'acknowledgedData'}); // 79, 0x4F
}

function BurstTransferData() {

    function encode() {
        throw new Error('not implemented');
    }

    function decode() {
        throw new Error('not implemented');
    }

    return Object.freeze({
        encode,
        decode
    });
}

function AdvancedBurstData() {

    function encode() {
        throw new Error('not implemented');
    }

    return Object.freeze({ encode });
}

function ChannelEvent() {
    const defaults = {
        channelNumber: 0,
    };

    const msg = Message({
        id: 'channelEvent',
    });

    const encryptionIdLength   = 4;
    const userInfoStringLength = 19;

    function calcContentLength(args) {
        let length = 3;

        if(exists(args.encryptionId)) {
            length += encryptionIdLength;
        }
        if(exists(args.userInfoString)) {
            length += userInfoStringLength;
        }

        return length;
    }

    function encode(args) {
        const contentLength = calcContentLength(args);
        const { length }    = msg.setLengths(contentLength);
        const xorIndex      = length - 1;
        const buffer        = new ArrayBuffer(length);
        const view          = new DataView(buffer);
        const uint8         = new Uint8Array(buffer);

        const channelNumber = existance(args.channelNumber, defaults.channelNumber);
        const eventCode     = existance(args.eventCode);

        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, 1, true);
        view.setUint8(5, eventCode, true);

        if(exists(args.encryptionId)) {
            view.setUint32(6, args.encryptionId, true);

            if(exists(args.userInfoString)) {
                uint8.set(args.userInfoString, 10);
            }
        }

        view.setUint8(xorIndex, xor(view), true);

        return view;
    }

    function decode(dataview) {
        const sync          = dataview.getUint8(0, true);
        const contentLength = dataview.getUint8(1, true);
        const id            = dataview.getUint8(2, true);
        const channelNumber = dataview.getUint8(3, true);
        const eventCode     = dataview.getUint8(5, true);

        const { length }    = msg.setLengths(contentLength);
        const xorIndex      = length - 1;
        const uint8         = new Uint8Array(dataview.buffer);

        const check         = dataview.getUint8(xorIndex, true);
        const valid         = msg.validate(dataview, check);

        let encryptionId;
        let userInfoString;

        const res = {
            id,
            channelNumber,
            eventCode,
            valid,
        };

        if(length > 7) {
            encryptionId = dataview.getUint32(6, true);
            res.encryptionId = encryptionId;

            if(length > (7 + encryptionIdLength)) {
                userInfoString = uint8.subarray(10, 10+userInfoStringLength);
                res.userInfoString = userInfoString;
            }
        }

        return res;
    }

    function isEvent(dataview) {
        return (equals(dataview.getUint8(2, true), ids.channelResponse) &&
                equals(dataview.getUint8(4, true), 1));
    }

    return Object.freeze({
        isEvent,
        encode,
        decode,
    });
}
function ChannelResponse() {
    const defaults = {
        channelNumber: 0,
    };

    const msg = Message({
        contentLength: 3,
        id: 'channelResponse',
    });

    function encode(args) {
        const buffer = new ArrayBuffer(msg.getLength());
        const view   = new DataView(buffer);

        const channelNumber = existance(args.channelNumber, defaults.channelNumber);
        const initMsgId     = existance(args.initMsgId);
        const responseCode  = existance(args.responseCode);

        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, initMsgId, true);
        view.setUint8(5, responseCode, true);
        view.setUint8(6, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const sync          = dataview.getUint8(0, true);
        const contentLength = dataview.getUint8(1, true);
        const id            = dataview.getUint8(2, true);
        const channelNumber = dataview.getUint8(3, true);
        const initMsgId     = dataview.getUint8(4, true);
        const responseCode  = dataview.getUint8(5, true);
        const check         = dataview.getUint8(6, true);
        const valid         = msg.validate(dataview, check);

        return {
            id,
            channelNumber,
            initMsgId,
            responseCode,
            valid,
        };
    }

    function isResponse(dataview) {
        return (equals(dataview.getUint8(2, true), ids.channelResponse) &&
                !equals(dataview.getUint8(4, true), 1));
    }

    return Object.freeze({
        isResponse,
        encode,
        decode,
    });
}

function ChannelStatus() {
    const defaults = {
        channelNumber: 0,
        channelState:  0,
        networkNumber: 0,
        channelType:   0,
    };

    const msg = Message({
        contentLength: 2,
        id: 'channelStatus',
    });

    const channelStates = {
        unassigned: 0,
        assigned:   1,
        searching:  2,
        tracking:   3,
    };

    function encodeChannelStatus(args) {
        let status = 0b00000000;

        status |= existance(args.channelState, defaults.channelState);
        status |= existance(args.networkNumber, defaults.networkNumber) << 2;
        status |= existance(args.channelType, defaults.channelType) << 4;

        return status;
    }

    function encode(args = {}) {
        const buffer = new ArrayBuffer(msg.getLength());
        const view   = new DataView(buffer);

        const channelNumber = args.channelNumber || defaults.channelNumber;
        const status        = encodeChannelStatus(args);

        view.setUint8(0, msg.sync, true);
        view.setUint8(1, msg.getContentLength(), true);
        view.setUint8(2, msg.id, true);
        view.setUint8(3, channelNumber, true);
        view.setUint8(4, status, true);
        view.setUint8(5, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const sync          = dataview.getUint8(0, true);
        const contentLength = dataview.getUint8(1, true);
        const id            = dataview.getUint8(2, true);
        const channelNumber = dataview.getUint8(3, true);
        const status        = dataview.getUint8(4, true);
        const check         = dataview.getUint8(5, true);
        const valid         = msg.validate(dataview, check);

        return {
            id,
            channelNumber,
            status,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function ChannelId() {
    return SetChannelId();
}

function Capabilities() {
    const defaults = {
        maxChannels:  0,
        maxNetworks:  0,
        maxSensRcore: 0,
    };

    const msg = Message({
        contentLength: 8,
        id: 'capabilities',
    });
    const length = msg.getLength();

    function encodeStandardOptions(args) {
        let options = 0b00000000;

        if(args.no_receive_channels)  options |= 0b00000001;
        if(args.no_transmit_channels) options |= 0b00000010;
        if(args.no_receive_messages)  options |= 0b00000100;
        if(args.no_transmit_messages) options |= 0b00001000;
        if(args.no_ackd_messages)     options |= 0b00010000;
        if(args.no_burst_messages)    options |= 0b00100000;

        return options;
    }

    function decodeStandardOptions(bitField) {
        return {
            no_receive_channels:  nthBitToBool(bitField, 0),
            no_transmit_channels: nthBitToBool(bitField, 1),
            no_receive_messages:  nthBitToBool(bitField, 2),
            no_transmit_messages: nthBitToBool(bitField, 3),
            no_ackd_messages:     nthBitToBool(bitField, 4),
            no_burst_messages:    nthBitToBool(bitField, 5),
        };
    }

    function encodeAdvancedOptions(args) {
        let options = 0b00000000;

        if(args.network_enabled)              options |= 0b00000010;
        if(args.serial_number_enabled)        options |= 0b00001000;
        if(args.per_channel_tx_power_enabled) options |= 0b00010000;
        if(args.low_priority_search_enabled)  options |= 0b00100000;
        if(args.script_enabled)               options |= 0b01000000;
        if(args.search_list_enabled)          options |= 0b10000000;

        return options;
    }

    function decodeAdvancedOptions(bitField) {
        return {
            network_enabled:              nthBitToBool(bitField, 1),
            serial_number_enabled:        nthBitToBool(bitField, 3),
            per_channel_tx_power_enabled: nthBitToBool(bitField, 4),
            low_priority_search_enabled:  nthBitToBool(bitField, 5),
            script_enabled:               nthBitToBool(bitField, 6),
            search_list_enabled:          nthBitToBool(bitField, 7),
        };
    }

    function encodeAdvancedOptions2(args) {
        let options = 0b00000000;

        if(args.led_enabled)         options |= 0b00000001;
        if(args.ext_message_enabled) options |= 0b00000010;
        if(args.scan_mode_enabled)   options |= 0b00000100;
        if(args.prox_search_enabled) options |= 0b00010000;
        if(args.ext_assign_enabled)  options |= 0b00100000;
        if(args.fs_antfs_enabled)    options |= 0b01000000;
        if(args.fit1_enabled)        options |= 0b10000000;

        return options;
    }

    function decodeAdvancedOptions2(bitField) {
        return {
            led_enabled:         nthBitToBool(bitField, 0),
            ext_message_enabled: nthBitToBool(bitField, 1),
            scan_mode_enabled:   nthBitToBool(bitField, 2),
            prox_search_enabled: nthBitToBool(bitField, 4),
            ext_assign_enabled:  nthBitToBool(bitField, 5),
            fs_antfs_enabled:    nthBitToBool(bitField, 6),
            fit1_enabled:        nthBitToBool(bitField, 7),
        };
    }

    function encodeAdvancedOptions3(args) {
        let options = 0b00000000;

        if(args.advanced_burst_enabled)         options |= 0b00000001;
        if(args.event_buffering_enabled)        options |= 0b00000010;
        if(args.event_filtering_enabled)        options |= 0b00000100;
        if(args.high_duty_search_enabled)       options |= 0b00001000;
        if(args.search_sharing_enabled)         options |= 0b00010000;
        if(args.selective_data_updates_enabled) options |= 0b01000000;
        if(args.encrypted_channel_enabled)      options |= 0b10000000;

        return options;
    }

    function decodeAdvancedOptions3(bitField) {
        return {
            advanced_burst_enabled:         nthBitToBool(bitField, 0),
            event_buffering_enabled:        nthBitToBool(bitField, 1),
            event_filtering_enabled:        nthBitToBool(bitField, 2),
            high_duty_search_enabled:       nthBitToBool(bitField, 3),
            search_sharing_enabled:         nthBitToBool(bitField, 4),
            selective_data_updates_enabled: nthBitToBool(bitField, 6),
            encrypted_channel_enabled:      nthBitToBool(bitField, 7),
        };
    }

    function encodeAdvancedOptions4(args) {
        let options = 0b00000000;

        if(args.capabilities_rfactive_notification_enabled) options |= 0b00000001;

        return options;
    }

    function decodeAdvancedOptions4(bitField) {
        return {
            capabilities_rfactive_notification_enabled: nthBitToBool(bitField, 0),
        };
    }

    function encode(args = {}) {
        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        const maxChannels  = existance(args.maxChannels, defaults.maxChannels);
        const maxNetworks  = existance(args.maxNetworks, defaults.maxNetworks);
        const standard     = encodeStandardOptions(args);
        const advanced     = encodeAdvancedOptions(args);
        const advanced2    = encodeAdvancedOptions2(args);
        const maxSensRcore = existance(args.maxSensRcore, defaults.maxSensRcore);
        const advanced3    = encodeAdvancedOptions3(args);
        const advanced4    = encodeAdvancedOptions4(args);

        view.setUint8( 0, msg.sync, true);
        view.setUint8( 1, msg.getContentLength(), true);
        view.setUint8( 2, msg.id, true);
        view.setUint8( 3, maxChannels, true);
        view.setUint8( 4, maxNetworks, true);
        view.setUint8( 5, standard, true);
        view.setUint8( 6, advanced, true);
        view.setUint8( 7, advanced2, true);
        view.setUint8( 8, maxSensRcore, true);
        view.setUint8( 9, advanced3, true);
        view.setUint8(10, advanced4, true);
        view.setUint8(11, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id           = dataview.getUint8(2, true);
        const maxChannels  = dataview.getUint8(3, true);
        const maxNetworks  = dataview.getUint8(4, true);
        const standard     = decodeStandardOptions(dataview.getUint8(5, true));
        const advanced     = decodeAdvancedOptions(dataview.getUint8(6, true));
        const advanced2    = decodeAdvancedOptions2(dataview.getUint8(7, true));
        const maxSensRcore = dataview.getUint8(8, true);
        const advanced3    = decodeAdvancedOptions3(dataview.getUint8(9, true));
        const advanced4    = decodeAdvancedOptions4(dataview.getUint8(10, true));
        const check        = dataview.getUint8(11, true);
        const valid        = msg.validate(dataview, check);

        return {
            id,
            maxChannels,
            maxNetworks,
            ...standard,
            ...advanced,
            ...advanced2,
            maxSensRcore,
            ...advanced3,
            ...advanced4,
            valid,
        };
    }

    return Object.freeze({
        encode,
        encodeStandardOptions,
        encodeAdvancedOptions,
        encodeAdvancedOptions2,
        encodeAdvancedOptions3,
        encodeAdvancedOptions4,

        decode,
    });
}

function SerialNumber() {
    const defaults = {
        serialNumber: 0,
    };

    const msg = Message({
        contentLength: 4,
        id: 'serialNumber', // 97, 0x61
    });
    const length = msg.getLength();

    function encode(args) {
        const serialNumber = existance(args.serialNumber, defaults.serialNumber);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8( 0, msg.sync, true);
        view.setUint8( 1, msg.getContentLength(), true);
        view.setUint8( 2, msg.id, true);
        view.setUint32(3, serialNumber, true);
        view.setUint8( 7, msg.xor(view), true);

        return view;
    }

    function decode(dataview) {
        const id           = dataview.getUint8( 2, true);
        const serialNumber = dataview.getUint32(3, true);
        const check        = dataview.getUint8( 7, true);
        const valid        = msg.validate(dataview, check);

        return {
            id,
            serialNumber,
            valid,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function deviceTypeToString(deviceType) {
    if(equals(deviceType, 120)) return 'Heart Rate';
    if(equals(deviceType, 17))  return 'Trainer';
    if(equals(deviceType, 11))  return 'Power Meter';
    if(equals(deviceType, 121)) return 'Speed and Cadence';
    return 'unsupported';
}

function isExtended(dataview) {
    return message.data.isExtended(dataview);
}

function isBroadcast(dataview) {
    return message.data.isBroadcast(dataview);
}

function isAcknowledged(dataview) {
    return message.data.isAcknowledged(dataview);
}

function isEvent(dataview) {
    return message.channelEvent.isEvent(dataview);
}

function isResponse(dataview) {
    return message.channelResponse.isResponse(dataview);
}

const message = {
    // config
    assignChannel:            AssignChannel(),
    unassignChannel:          UnassignChannel(),
    setChannelId:             SetChannelId(),
    setChannelPeriod:         SetChannelPeriod(),
    setChannelFrequency:      SetChannelFrequency(),
    setNetworkKey:            SetNetworkKey(),
    searchTimeout:            SearchTimeout(),
    lowPrioritySearchTimeout: LowPrioritySearchTimeout(),
    enableExtRxMessages:      EnableExtRxMessages(),
    libConfig:                LibConfig(),

    // control
    resetSystem:          ResetSystem(),
    openChannel:          OpenChannel(),
    closeChannel:         CloseChannel(),
    requestMessage:       RequestMessage(),
    requestChannelStatus: RequestMessage({requestedMessageId: ids.channelStatus}),
    openRxScanMode:       OpenRxScanMode(),
    sleep:                Sleep(),

    // data
    data:                Data(),
    broadcastData:       BroadcastData(),
    acknowledgedData:    AcknowledgedData(),
    burstTransferData:   BurstTransferData(),
    advancedBurstData:   AdvancedBurstData(),

    // channel messages
    channelEvent:    ChannelEvent(),
    channelResponse: ChannelResponse(),

    // requested response messages
    channelStatus: ChannelStatus(),
    channelId:     ChannelId(),
    capabilities:  Capabilities(),
    serialNumber:  SerialNumber(),

    // utils
    isExtended,
    isBroadcast,
    isAcknowledged,
    isEvent,
    isResponse,
};

const utils = {
    deviceTypeToString,
};

export {
    message,
    Message,
    utils,
};
