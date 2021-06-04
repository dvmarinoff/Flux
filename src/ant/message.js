import { equals, nthBitToBool, xor } from '../functions.js';
import { page } from './page.js';

const ids = {
    // config
    setNetworkKey:     70, // 0x46
    unassignChannel:   65, // 0x41
    assignChannel:     66, // 0x42
    assignChannelExt:  66, // 0x42
    channelPeriod:     67, // 0x43
    channelFrequency:  69, // 0x45
    setChannelId:      81, // 0x51
    serialNumberSet:  101, // 0x65
    searchTimeout:     68, // 0x44
    searchLowTimeout:  99, // 0x63
    enableExtRx:      102, // 0x66

    // control
    resetSystem:       74, // 0x4A
    openChannel:       75, // 0x4B
    closeChannel:      76, // 0x4C
    requestMessage:    77, // 0x4D
    sleepMessage:     197, // 0xC5

    // notification
    startUp:          111, // 0x6F
    serialError:      174, // 0xAE

    // data
    broascastData:     78, // 0x4E
    acknowledgedData:  79, // 0x4F
    broascastExtData:  93, // 0x5D
    burstData:         80, // 0x50
    burstAdvData:     114, // 0x72

    // channel
    // channelEvent:     64, // 0x40
    channelEvent:      1, // 0x01
    channelResponse:  64, // 0x40

    // requested response
    channelStatus:    82, // 0x52
    channelId:        81, // 0x51 response
    ANTVersion:       62, // 0x3E
    capabilities:     84, // 0x54
    serialNumber:     97  // 0x61
};

const events = {
    response_no_error:                0,
    event_rx_search_timeout:          1,
    event_rx_fail:                    2,
    event_tx:                         3,
    event_transfer_rx_failed:         4,
    event_transfer_tx_completed:      5,
    event_transfer_tx_failed:         6,
    event_channel_closed:             7,
    event_rx_fail_go_to_search:       8,
    event_channel_collision:          9,
    event_transfer_tx_start:         10,
    event_transfer_next_data_block:  11,
    channel_in_wrong_state:          21,
    channel_not_opened:              22,
    channel_id_not_set:              24,
    close_all_channels:              25,
    transfer_in_progress:            31,
    transfer_sequence_number_error:  32,
    transfer_in_error:               33,
    message_size_exceeds_limit:      34,
    invalid_message:                 40,
    invalid_network_number:          41,
    invalid_list_id:                 48,
    invalid_scan_tx_channel:         49,
    invalid_parameter_provided:      51,
    event_serial_que_overflow:       52,
    event_que_overflow:              53,
    encrypt_negotiation_success:     56,
    encrypt_negotiation_fail:        57,
    nvm_full_error:                  64,
    nvm_write_error:                 65,
    usb_string_write_fail:          112,
    mesg_serial_error_id:           174
};

const values = {
    sync: 164,
};

function SetNetworkKey(args) {
    let buffer   = new ArrayBuffer(13);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 9;
    const id     = 70;  // 0x46
    const key    = args.key || keys.public;
    const networkNumber = args.networkNumber || 0;

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, networkNumber, true);


    let j = 4;
    for(let i=0; i<9; i++) {
        view.setUint8(j, key[i], true);
        j++;
    }

    view.setUint8(12, xor(view), true);

    return view;
}

function AssignChannel(args) {
    const sync     = 164; // 0xA4
    const length   = 3;
    const id       = 66;  // 0x42
    const channelNumber = args.channelNumber || 0;
    const channelType   = args.channelType   || 0;
    const networkNumber = 0;

    let buffer   = new ArrayBuffer(7);
    let view     = new DataView(buffer);

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, channelNumber, true);
    view.setUint8(4, channelType,   true);
    view.setUint8(5, networkNumber, true);
    view.setUint8(6, xor(view),     true);

    return view;
}

function AssignChannelExt(args) {
    const sync     = 164; // 0xA4
    const length   = 4;
    const id       = 66;  // 0x42
    const channelNumber = args.channelNumber || 0;
    const channelType   = args.channelType   || 0;
    const networkNumber = 0;
    const extended      = args.extended      || 0x01;

    let buffer   = new ArrayBuffer(8);
    let view     = new DataView(buffer);

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, channelNumber, true);
    view.setUint8(4, channelType,   true);
    view.setUint8(5, networkNumber, true);
    view.setUint8(6, extended,      true);
    view.setUint8(7, xor(view),     true);

    return view;
}

function ChannelId(args) {
    let buffer   = new ArrayBuffer(9);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 5;
    const id     = 81; // 0x51
    const channelNumber   = args.channelNumber || 0;
    const deviceNumber    = args.deviceNumber  || 0;
    const deviceType      = args.deviceType    || 0;
    const transmitionType = args.transType     || 0;

    view.setUint8( 0, sync,            true);
    view.setUint8( 1, length,          true);
    view.setUint8( 2, id,              true);
    view.setUint8( 3, channelNumber,   true);
    view.setUint16(4, deviceNumber,    true);
    view.setUint8( 6, deviceType,      true);
    view.setUint8( 7, transmitionType, true);
    view.setUint8( 8, xor(view),       true);

    return view;
}

function ChannelFrequency(args) {
    let buffer   = new ArrayBuffer(6);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 2;
    const id     = 69;  // 0x45
    const channelNumber = args.channelNumber || 0;
    const rfFrequency   = args.rfFrequency   || 66;

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, channelNumber, true);
    view.setUint8(4, rfFrequency,   true);
    view.setUint8(5, xor(view),     true);

    return view;
}

function ChannelPeriod(args) {
    let buffer   = new ArrayBuffer(7);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 3;
    const id     = 67;  // 0x43
    const channelNumber = args.channelNumber || 0;
    const period        = args.channelPeriod || 8192;

    view.setUint8( 0, sync,          true);
    view.setUint8( 1, length,        true);
    view.setUint8( 2, id,            true);
    view.setUint8( 3, channelNumber, true);
    view.setUint16(4, period,        true);
    view.setUint8( 6, xor(view),     true);

    return view;
}

function OpenChannel(args) {
    let buffer   = new ArrayBuffer(5);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 1;
    const id     = 75;  // 0x4B
    const channelNumber = args.channelNumber || 0;

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, channelNumber, true);
    view.setUint8(4, xor(view),     true);

    return view;
}

function UnassignChannel(args) {
    let buffer   = new ArrayBuffer(5);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 1;
    const id     = 65;  // 0x41
    const channelNumber = args.channelNumber || 0;

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, channelNumber, true);
    view.setUint8(4, xor(view),     true);

    return view;
}

function CloseChannel(args) {
    let buffer   = new ArrayBuffer(5);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 1;
    const id     = 76;  //0x4C
    const channelNumber = args.channelNumber || 0;

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, channelNumber, true);
    view.setUint8(4, xor(view),     true);

    return view;
}

function ResetSystem(args) {
    let buffer   = new ArrayBuffer(5);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 1;
    const id     = 74;  //0x4A

    view.setUint8(0, sync,      true);
    view.setUint8(1, length,    true);
    view.setUint8(2, id,        true);
    view.setUint8(3, 0,         true);
    view.setUint8(4, xor(view), true);

    return view;
}

function SearchTimeout(args) {
    let buffer   = new ArrayBuffer(6);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 2;
    const id     = 68;  // 0x44
    const channelNumber = args.channelNumber || 0;
    const timeout       = args.timeout; // 12 * 2.5 = 30s, 255 is infinite

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, channelNumber, true);
    view.setUint8(4, timeout,       true);
    view.setUint8(5, xor(view),     true);

    return view;
}

function LowPrioritySearchTimeout(args) {
    let buffer   = new ArrayBuffer(6);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 2;
    const id     = 99;  // 0x63
    const channelNumber = args.channelNumber || 0;
    const timeout       = args.timeoutLow    || 2; // 2 * 2.5 = 5s, 255 is infinite

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, channelNumber, true);
    view.setUint8(4, timeout,       true);
    view.setUint8(5, xor(view),     true);

    return view;
}

function EnableExtRxMessages(args) {
    let buffer   = new ArrayBuffer(6);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 2;
    const id     = 102; // 0x66

    view.setUint8(0, sync,        true);
    view.setUint8(1, length,      true);
    view.setUint8(2, id,          true);
    view.setUint8(3, 0,           true);
    view.setUint8(4, args.enable, true);
    view.setUint8(5, xor(view),   true);

    return view;
}

function Sleep(args) {
    let buffer   = new ArrayBuffer(5);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 1;
    const id     = 197; // 0xC5

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, 0,             true);
    view.setUint8(4, xor(view),     true);

    return view;
}

function Request(args) {
    let buffer   = new ArrayBuffer(6);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 2;
    const id     = 77;  // 0x4D
    const channelNumber = args.channelNumber || 0;
    const request       = args.request       || 0;

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, channelNumber, true);
    view.setUint8(4, request,       true);
    view.setUint8(5, xor(view),     true);

    return view;
}

function CommonPage70(pageNumber) {
    let buffer          = new ArrayBuffer(8);
    let view            = new DataView(buffer);
    const commandId     = 70; // 0x46, Data Page Request
    const transResponse = 2;  // 0b00000010
    const commandType   = 1;

    view.setUint8(0, commandId,     true);
    view.setUint8(1, 255,           true);
    view.setUint8(2, 255,           true);
    view.setUint8(3, 255,           true);
    view.setUint8(4, 255,           true);
    view.setUint8(5, transResponse, true);
    view.setUint8(6, pageNumber,    true);
    view.setUint8(7, commandType,   true);

    return view;
}

function RequestDataPage(pageNumber, channel) {
    return Control(CommonPage70(pageNumber), channel);
}
function targetPower(power, channel = 5) {
    return Control(page.dataPage49(power), channel);
}
function targetResistance(level, channel = 5) {
    return Control(page.dataPage48(level), channel);
}
function targetSlope(slope, channel = 5) {
    return Control(page.dataPage51(slope), channel);
}

function Control(content, channel = 5) {
    const sync   = 164;
    const length = 9;
    const type   = 79; // Acknowledged 0x4F
    let buffer   = new ArrayBuffer(13);
    let view     = new DataView(buffer);
    view.setUint8(0, sync,    true);
    view.setUint8(1, length,  true);
    view.setUint8(2, type,    true);
    view.setUint8(3, channel, true);

    let j = 4;
    for(let i = 0; i < 8; i++) {
        view.setUint8(j, content.getUint8(i), true);
        j++;
    }

    const crc = xor(view);
    view.setUint8(12, crc, true);

    return view;
}
function Data(dataview) {
    const sync     = dataview.getUint8(0);
    const length   = dataview.getUint8(1);
    const type     = dataview.getUint8(2);
    const channel  = dataview.getUint8(3);
    const dataPage = dataview.getUint8(4);

    if(dataPage === 25) {
        return page.dataPage25(dataview);
    }
    if(dataPage === 16) {
        return page.dataPage16(dataview);
    }
    return { page: 0 };
}

// Decode
function readExtendedData(data) {
    const length        = data[1];
    const id            = data[2];
    const channelNumber = data[3];
    const flag          = data[12];
    const deviceNumber  = (data[14] << 8) + (data[13]);
    const deviceType    = data[15];
    const transType     = data[16];
    return { deviceNumber, deviceType, transType };
}

function readChannelStatus(data) {
    const id             = 82; // 0x52
    const channelNumber  = data[3];
    const status         = data[4] & 0b00000011; // just bits 0 and 1
    let res              = 'unknown';
    if(status === 0) res = 'unassigned';
    if(status === 1) res = 'assigned';
    if(status === 2) res = 'searching';
    if(status === 3) res = 'tracking';
    return res;
}

function readChannelId(data) {
    const id            = 81; // 0x51
    const channelNumber = data[3];
    const deviceNumber  = (data[5] << 8) + data[4];
    const deviceType    = data[6];
    const transType     = data[7];
    return { channelNumber, deviceNumber, deviceType, transType };
}

function readANTVersion(data) {
    const id      = 62; // 0x3E
    const version = arrayToString(data.slice(3));
    return { version };
}

function readSerialNumber(data) {
    const id = 97; // 0x61
    const sn = data.slice(3);
    return { sn };
}

function readCapabilities(data) {
    const id               = 84; // 0x54
    const maxAntChannels   = data[3];
    const maxNetworks      = data[4];
    const standardOptions  = data[5];
    const advancedOptions  = data[6];
    const advancedOptions2 = data[7];
    const maxSensRcore     = data[8];
    const advancedOptions3 = data[9];
    const advancedOptions4 = data[10];
    return { maxAntChannels,
             maxNetworks,
             standardOptions,
             advancedOptions,
             advancedOptions2,
             maxSensRcore,
             advancedOptions3,
             advancedOptions4};
}

function readSync(msg) {
    return msg[0];
}
function readLength(msg) {
    return msg[1];
}
function readId(msg) {
    return msg[2];
}
function readChannel(msg) {
    return msg[3];
}

function isValidEventCode(code) {
    return Object.values(events).includes(code);
}
function eventCodeToString(code) {
    if(!isValidEventCode(code)) {
        return `invalid event code`;
    }
    const prop = Object.entries(events)
          .filter(e => e[1] === code)[0][0];
    const str  = prop.split('_').join(' ');
    return `${str}`;
}

function isValidId(id) {
    return Object.values(ids).includes(id);
}
function idToString(id) {
    if(!isValidId(id)) {
        return `invalid message id`;
    }
    const prop = Object.entries(ids).filter(e => e[1] === id)[0][0];
    const str  = prop.split('_').join(' ');
    return `${str}`;
}

function readResponse(msg) {
    // response to write
    const channel = readChannel(msg);
    const id      = readId(msg);
    const toId    = msg[4];
    const code    = msg[5];
    return { channel, id, toId, code };
}
function readEvent(msg) {
    const channel = readChannel(msg);
    const code    = msg[5];
    return { channel, code };
}


function isResponse(msg) {
    return readId(msg) === ids.channelResponse;
}
function isRequestedResponse(msg) {
    return [ids.channelId,
            ids.channelStatus,
            ids.ANTVersion,
            ids.capabilities,
            ids.serialNumber
           ].includes(readId(msg));
}
function isBroadcast(msg) {
    return readId(msg) === ids.broascastData;
}
function isBroadcastExt(msg) {
    return readId(msg) === ids.broascastExtData;
}
function isAcknowledged(msg) {
    return readId(msg) === ids.acknowledgedData;
}
function isBurst(msg) {
    return readId(msg) === ids.burstData;
}
function isBurstAdv(msg) {
    return readId(msg) === ids.burstAdvData;
}
function isEvent(msg) {
    return readId(msg) === ids.channelEvent;
}
function isSerialError(msg) {
    return readId(msg) === ids.serialError;
}
function isChannelId(msg) {
    return ids.channelId === readId(msg);
}
function isChannelStatus(msg) {
    return ids.channelStatus === readId(msg);
}
function isANTVersion(msg) {
    return ids.ANTVersion === readId(msg);
}
function isCapabilities(msg) {
    return ids.capabilities === readId(msg);
}
function isSerialNumber(msg) {
    return ids.serialNumber === readId(msg);
}

function startsWithSync(msg) {
    return readSync(msg) === 0xA4;
}
function isFullMsg(msg) {
    if(msg === undefined) return false;
    if(msg.length > 1) {
        return msg.length === (readLength(msg) + 4);
    }
    return false;
}

function isValid(data) {
    if(!startsWithSync(data)) return false;
    if(!isFullMsg(data))      return false;
    return true;
}

function deviceTypeToString(deviceType) {
    if(equals(deviceType, 120)) return 'Heart Rate';
    if(equals(deviceType, 17))  return 'Trainer';
    if(equals(deviceType, 11))  return 'Power Meter';
    if(equals(deviceType, 121)) return 'Speed and Cadence';
    return 'unsupported';
}


const message = {
    SetNetworkKey,
    AssignChannel,
    AssignChannelExt,
    ChannelId,
    ChannelFrequency,
    ChannelPeriod,
    OpenChannel,
    UnassignChannel,
    CloseChannel,
    ResetSystem,
    SearchTimeout,
    LowPrioritySearchTimeout,
    EnableExtRxMessages,
    Sleep,

    targetPower,
    targetResistance,
    targetSlope,
    RequestDataPage,

    Request,
    Control,
    Data,

    ids,
    events,
    values,

    isResponse,
    isRequestedResponse,
    isBroadcast,
    isAcknowledged,
    isBurst,
    isBurstAdv,
    isBroadcastExt,
    isEvent,
    isSerialError,
    isValid,
    isFullMsg,
    isChannelId,
    isChannelStatus,
    isANTVersion,
    isCapabilities,
    isSerialNumber,
    readSync,
    readLength,
    readId,
    readChannel,
    readResponse,
    readEvent,
    readExtendedData,
    readChannelId,
    readChannelStatus,
    readANTVersion,
    readCapabilities,
    readSerialNumber,
    eventCodeToString,
    idToString,
};

const utils = {
    deviceTypeToString,
};

export { message, utils };
