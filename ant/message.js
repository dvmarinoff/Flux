import { xor, nthBitToBool, arrayToString } from '../functions.js';

const ids = {
    // config
    setNetworkKey:    70, // 0x46
    unassaignChannel: 65, // 0x41
    assaignChannel:   66, // 0x42
    channelPeriod:    67, // 0x43
    channelFrequency: 69, // 0x45
    setChannelId:     81, // 0x51
    serialNumberSet: 101, // 0x65

    // control
    resetSystem:      74, // 0x4A
    openChannel:      75, // 0x4B
    closeChannel:     76, // 0x4C
    requestMessage:   77, // 0x4D
    sleepMessage:    197, // 0xC5

    // notification
    startUp:         111, // 0x6F
    serialError:     174, // 0xAE

    // data
    broascastData:    78, // 0x4E
    acknowledgedData: 79, // 0x4F

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

const eventCodes = {
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

function AssaignChannel(args) {
    let buffer   = new ArrayBuffer(7);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 3;
    const id     = 66;  // 0x42
    const channelNumber = args.channelNumber || 0;
    const channelType   = args.channelType   || 0; // 0x00 (0), 0x10 (16), 0x40 (64)
    const networkNumber = 0;

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, channelNumber, true);
    view.setUint8(4, channelType,   true);
    view.setUint8(5, networkNumber, true);
    view.setUint8(6, xor(view),     true);

    return view;
}

function ChannelId(args) {
    let buffer   = new ArrayBuffer(9);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 5;
    const id     = 81; // 0x51
    const channelNumber   = args.channelNumber || 0;
    const deviceNumber    = 0;
    const deviceType      = args.deviceType || 0; // 128, 248
    const transmitionType = 0;

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

function UnassaignChannel(args) {
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
    view.setUint8(4, xor(view), true);

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
    const length = 1;
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

function readChannelStatus(data) {
    const id             = 82; // 0x52
    const channelNumber  = data[3];
    const status         = data[4] & 0b00000011; // just bits 0 and 1
    let res              = 'unknown';
    if(status === 0) res = 'unassaigned';
    if(status === 1) res = 'assaigned';
    if(status === 2) res = 'searching';
    if(status === 3) res = 'tracking';
    return res;
}

function readChannelId(data) {
    const id               = 81; // 0x51
    const channelNumber    = data[3];
    const deviceNumber     = (data[4] << 8) + data[5];
    const deviceType       = data[6];
    const transmissionType = data[7];
    return { channelNumber, deviceNumber, deviceType, transmissionType };
}

function readAntVersion(data) {
    const id      = 62; // 0x3E
    const version = arrayToString(data.slice(3));
    return { version };
}

function readDeviceSerialNumber(data) {
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

// FE-C
function decodePower(powerMSB, powerLSB) {
    return ((powerMSB & 0b00001111) << 8) + (powerLSB);
}
function decoupleStatus(powerMSB) {
    return powerMSB >> 4;
}
function decodeStatus(bits) {
    return {
        powerCalibration:      nthBitToBool(bits, 0),
        resistanceCalibration: nthBitToBool(bits, 1),
        userConfiguration:     nthBitToBool(bits, 2)
    };
}

function dataPage25(msg) {
    // Specific Tr data, 0x19
    const updateEventCount = msg[5];
    const cadence          = msg[6];  // rpm
    const powerLSB         = msg[9];  // 8bit Power Lsb
    const powerMSB         = msg[10]; // 4bit Power Msb + 4bit Status
    const flags            = msg[11];

    const power  = decodePower(powerMSB, powerLSB);
    const status = decoupleStatus(powerMSB);

    return { power, cadence, status, page: 25 };
}

function dataPage16(msg) {
    // General FE data, 0x10
    const resolution    = 0.001;
    const equipmentType = msg[5];
    let speed           = (msg[9] << 8) + (msg[8]);
    const flags         = msg[11];
    // const distance      = msg.getUint8(7); // 255 rollover
    // const hr            = msg.getUint8(10); // optional
    speed = (speed * resolution * 3.6);
    return { speed, page: 16 };
}

function dataPage48(resistance) {
    // Data Page 48 (0x30) – Basic Resistance
    const dataPage = 48;
    const unit     = 0.5;
    let buffer     = new ArrayBuffer(8);
    let view       = new DataView(buffer);

    view.setUint8(0, dataPage, true);
    view.setUint8(7, resistance / 0.5, true);

    return view;
}

function dataPage49(power) {
    // Data Page 49 (0x31) – Target Power
    const dataPage = 49;
    const unit     = 0.25;
    let buffer     = new ArrayBuffer(8);
    let view       = new DataView(buffer);

    view.setUint8( 0, dataPage, true);
    view.setUint16(6, power / unit, true);

    return view;
}

function compansateGradeOffset(slope) {
    // slope is coming as -> 1.8% * 100 = 180
    // 0 = -200%, 20000 = 0%, 40000 = 200%
    return 20000 + (slope);
}

// compansateGradeOffset(0)   === 20000
// compansateGradeOffset(1)   === 20100
// compansateGradeOffset(4.5) === 20450
// compansateGradeOffset(10)  === 21000

function dataPage51(slope) {
    // Data Page 51 (0x33) – Track Resistance
    const dataPage  = 51;
    const gradeUnit = 0.01;
    const crrUnit   = 5*Math.pow(10,-5); // 5x10^-5
    const grade     = compansateGradeOffset(slope);
    const crr       = 0xFF; // default value
    let buffer      = new ArrayBuffer(8);
    let view        = new DataView(buffer);

    view.setUint8( 0, dataPage,          true);
    view.setUint16(5, grade, true);
    view.setUint8( 7, crr,               true);

    return view;
}

function controlMessage(content, channel = 5) {
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

function powerTarget(power, channel = 5) {
    return controlMessage(dataPage49(power, channel));
}
function resistanceTarget(level, channel = 5) {
    return controlMessage(dataPage48(level, channel));
}
function slopeTarget(slope, channel = 5) {
    return controlMessage(dataPage51(slope, channel));
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
    return Object.values(eventCodes).includes(code);
}
function eventCodeToString(code) {
    if(!isValidEventCode) {
        return `invalid event code`;
    }
    const prop = Object.entries(eventCodes)
          .filter(e => e[1] === code)[0][0];
    const str  = prop.split('_').join(' ');
    return `${str}`;
}

function isValidId(id) {
    return Object.values(ids).includes(id);
}
function idToString(id) {
    if(!isValidId) {
        return `invalid message id`;
    }
    const prop = Object.entries(ids)
          .filter(e => e[1] === id)[0][0];
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
    return readId(msg) === message.ids.channelResponse;
}
function isBroadcast(msg) {
    return readId(msg) === message.ids.broascastData;
}
function isEvent(msg) {
    return readId(msg) === message.ids.channelEvent;
}
function isSerialError(msg) {
    return readId(msg) === message.ids.serialError;
}

const startsWithSync = (data) => readSync(data) === 0xA4;
const isFullLength   = (data) => readLength(data) !== (data.length + 3);

function isValid(data) {
    if(!startsWithSync(data)) return false;
    if(!isFullLength(data))   return false;
    return true;
}

function DataPage2(msg) {
    // HR Manufacturer Information (0x02)
    const manufacturerId = msg[5];
    const serialNumber   = (msg[7] << 8) + (msg[6]);
}
function DataPage3(msg) {
    // HR Product Information (0x03)
    const hardware = msg[5];
    const software = msg[6];
    const model    = msg[7];

    return { hardware, software, model };
}

function toBatteryPercentage(x) {
    if(x === 255) return 'not supported';
    if(x > 100)   return '--';
    return x;
}
function DataPage7(msg) {
    // HR Battery Status (0x07)
    const level       = toBatteryPercentage(msg[5]);
    const voltage     = msg[6];
    const descriptive = msg[7];

    return { level, voltage, descriptive };
}

function HRPage(msg) {
    const page         = msg[4] & 0b01111111; // just bit 0 to 6
    const pageChange   = msg[4] << 7; // just bit 7
    const hrbEventTime = (msg[9] << 8) + msg[8];
    const hbCount      = msg[10];
    const hr           = msg[11];
    let specific       = {};

    if(page === 2) {
        specific = DataPage2(msg);
    }
    if(page === 3) {
        specific = DataPage3(msg);
    }
    if(page === 7) {
        specific = DataPage7(msg);
    }
    return { hr, page, hrbEventTime, hbCount, ...specific };
}

function FECPage(msg) {
    const page = msg[4];
    if(page === 25) return dataPage25(msg);
    if(page === 16) return dataPage16(msg);
    return { page: 0 };
}

const message = {
    UnassaignChannel,
    AssaignChannel,
    ChannelId,
    ChannelPeriod,
    ChannelFrequency,
    SetNetworkKey,
    ResetSystem,
    OpenChannel,
    CloseChannel,
    Request,
    Sleep,
    readChannelStatus,
    readChannelId,
    powerTarget,
    resistanceTarget,
    slopeTarget,
    ids,
    isResponse,
    isBroadcast,
    isEvent,
    isSerialError,
    isValid,
    readSync,
    readLength,
    readId,
    readChannel,
    readResponse,
    readEvent,
    eventCodeToString,
    idToString,
    HRPage,
    FECPage,
};

export { message };
