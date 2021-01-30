import { xf } from './xf.js';
import { xor, exists } from './functions.js';

const DynastreamId       = 0x0FCF;
const ANT_USB_2_Stick_Id = 1008;
const ANT_USB_m_Stick_Id = 1009;

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

const HrmProfile = {
    rfFrequency: 66,
    deviceType: 120,
};

const FecProfile = {
    rfFrequency: 57,
    deviceType: 17,
};

function setTransmisssionType(args) {
    const independant            = 0b00000001;
    const sharedOneByteAddress   = 0b00000010;
    const sharedTwoByteAddress   = 0b00000011;
    const globalDataPagesNotUsed = 0b00000000;
    const globalDataPagesUsed    = 0b00000100;
    const deviceNumberExtension  = args.deviceNumberExtension || 0b00000000;
    // implement ...
    return 0b00000001;
}


function Configuration(args) {
    const deviceType = exists(args.deviceType, `ANT+ channel configuration: deviceType is empty!`);

    let config = {
        channelType: 0,                      // 8 bit
        rfFrequency: args.rfFrequency || 66, // 8 bit
        channelId: {
            transmissionType: 0,             // 8 bit
            deviceType: deviceType,          // 8 bit
            deviceNumber: 0,                 // 16 bit
        },
        channelPeriod: 8192, // 4 Hz, 16 bit
        // searchTimeout: 30,   // 30 s,
    };
    return config;
}

function AssaignChannelMsg(args) {
    let buffer   = new ArrayBuffer(7);
    let view     = new DataView(buffer);
    const page   = 64;
    const sync   = 0xA4;
    const length = 3;
    const id     = 0x42;
    const channelNumber = 0;
    const channelType   = 0; // 0x00, 0x10, 0x40
    const networkNumber = 0;

    view.setUint8(  0, sync,          true);
    view.setUint8(  1, length,        true);
    view.setUint8(  2, id,            true);
    view.setUint8(  3, channelNumber, true);
    view.setUint8(  4, channelType,   true);
    view.setUint8(  5, networkNumber, true);
    view.setUint8(  6, xor(view), true);

    return view;
}

function ChannelIdMsg(args) {
    let buffer   = new ArrayBuffer(9);
    let view     = new DataView(buffer);
    const page   = 66;
    const sync   = 0xA4;
    const length = 5;
    const id     = 0x51;
    const channelNumber  = 0;
    const deviceNumber   = 0;
    const deviceTypeId   = 0;
    const transitionType = 0;

    view.setUint8( 0, sync,           true);
    view.setUint8( 1, length,         true);
    view.setUint8( 2, id,             true);
    view.setUint8( 3, channelNumber,  true);
    view.setUint16(4, deviceNumber,   true);
    view.setUint8( 6, deviceTypeId,   true);
    view.setUint8( 7, transitionType, true);
    view.setUint8( 8, xor(view),      true);

    return view;
}

function OpenChannelMsg(args) {
    let buffer   = new ArrayBuffer(5);
    let view     = new DataView(buffer);
    const page   = 94;
    const sync   = 0xA4;
    const length = 1;
    const id     = 0x4B;
    const channelNumber  = 0;

    view.setUint8(0, sync,          true);
    view.setUint8(1, length,        true);
    view.setUint8(2, id,            true);
    view.setUint8(3, channelNumber, true);
    view.setUint8(4, xor(view),     true);

    return view;
}

class Channel {
    constructor() {}
}

function initWriter(writer) {
    return function(data) {
        return writer.write(data);
    };
}

async function SerialAPI() {
    const filter = [{usbVendorId: DynastreamId}];

    const port = await navigator.serial.requestPort({filters: filter});

    let info = port.getInfo();

    console.log(info);

    await port.open({ baudRate: 115200 });
    console.log(port);

    const writer = port.writable.getWriter();
    const reader = port.readable.getReader();

    // const write = initWriter(writer);

    let slaveConfig =
        Configuration({rfFrequency: HrmProfile.rfFrequency,
                       deviceType:  HrmProfile.deviceType});

    // Assaign Channel
    await writer.write(AssaignChannelMsg(slaveConfig).buffer);
    let acmRes = await reader.read();
    console.log(`writer:response  asmRes ${acmRes.value}`);

    // Channel Id
    await writer.write(ChannelIdMsg(slaveConfig).buffer);
    let cimRes = await reader.read();
    console.log(`writer:response  cimRes ${cimRes.value}`);


    // Open Channel
    await writer.write(OpenChannelMsg(slaveConfig).buffer);
    let ocRes = await reader.read();
    console.log(`writer:response  ocRes ${ocRes.value}`);

    // xf.sub('usb:data', async function (value) {});
    // xf.dispatch('usb:data', value);

    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            console.log('DONE');
            reader.releaseLock();
            break;
        }
        console.log(`usb:data  ${value}`);
    }

    writer.releaseLock();

}


export { SerialAPI };
