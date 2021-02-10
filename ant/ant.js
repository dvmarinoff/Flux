import { xf } from '../xf.js';
import { xor, exists } from '../functions.js';

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

const keys = {
    antPlus: [0xB9, 0xA5, 0x21, 0xFB, 0xBD, 0x72, 0xC3, 0x45],
    public:  [0xE8, 0xE4, 0x21, 0x3B, 0x55, 0x7A, 0x67, 0xC1],
};

const msgIds = {
    channelResponse:  64, // 0x40
    setNetworkKey:    70, // 0x46
    unassaignChannel: 65, // 0x41
    assaignChannel:   66, // 0x42
    channelPeriod:    67, // 0x43
    channelFrequency: 69, // 0x45
    setChannelId:     81, // 0x51
    channelId:        81, // 0x51 response
    resetSystem:      74, // 0x4A
    closeChannel:     76, // 0x4C
    openChannel:      75, // 0x4B
    broascastData:    78, // 0x4E
};

const codes = {
    response_no_error:        0,
    event_rx_search_timeout:  1,
    event_tx:                 3,
    event_channel_closed:     7,
    channel_in_wrong_state:  21,
    channel_id_not_set:      24,
    invalid_message:         40,
    invalid_network_number:  41
};

function SetNetworkKeyMsg(args) {
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

function AssaignChannelMsg(args) {
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

function ChannelIdMsg(args) {
    let buffer   = new ArrayBuffer(9);
    let view     = new DataView(buffer);
    const sync   = 164; // 0xA4
    const length = 5;
    const id     = 81; // 0x51
    const channelNumber   = args.channelNumber || 0;
    const deviceNumber    = 0;
    const deviceType      = args.deviceType || 0; // 128, 248
    const transmitionType = 0;

    view.setUint8(0, sync,            true);
    view.setUint8(1, length,          true);
    view.setUint8(2, id,              true);
    view.setUint8(3, channelNumber,   true);
    view.setUint8(4, deviceNumber,    true);
    view.setUint8(5, deviceType,      true);
    view.setUint8(6, transmitionType, true);
    view.setUint8(7, 0,               true);
    view.setUint8(8, xor(view),       true);

    return view;
}

function ChannelFrequencyMsg(args) {
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

function ChannelPeriodMsg(args) {
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

function OpenChannelMsg(args) {
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

function UnassaignChannelMsg(args) {
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

function CloseChannelMsg(args) {
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

function ResetSystemMsg(args) {
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

class ResponseMsg {
    constructor(args) {
        this.msg = this.read(args.msg);
    }
    read(msg) {
        const self = this;
        const id   = msg[4];
        const code = msg[5];
        self.msg   = { id, code };
        return { id, code };
    }
    noError(msgId) {
        const self = this;
        return ((self.msg.id === msgId) && (self.msg.code  === codes.response_no_error));
    }
    channelClosed() {
        const self = this;
        return (self.msg.code === codes.event_channel_closed);
    }
}

function isResponse(msg) {
    const id = msg[2];
    return id === msgIds.channelResponse;
}
function isBroadcast(msg) {
    const id = msg[2];
    return id === msgIds.broascastData;
}

class HRChannel {
    constructor(args) {
        this.config = { channelNumber: 0,
                        channelType:   0,
                        deviceType:    0,
                        channelPeriod: 8070,
                        rfFrequency:   57,
                        key:           keys.antPlus };
    }
    async open() {
        const self = this;
        await self.writer.write(SetNetworkKeyMsg(self.config).buffer);
    }
    async onResponse(value) {
        const self = this;

        const res = new ResponseMsg({msg: value});

        if(res.noError(msgIds.setNetworkKey)) {
            await self.write(AssaignChannelMsg(self.config).buffer);
        }
        if(res.noError(msgIds.assaignChannel)) {
            await self.write(ChannelIdMsg(self.config).buffer);
        }
        if(res.noError(msgIds.channelId)) {
            await self.write(ChannelFrequencyMsg(self.config).buffer);
        }
        if(res.noError(msgIds.channelFrequency)) {
            await self.write(ChannelPeriodMsg(self.config).buffer);
        }
        if(res.noError(msgIds.channelPeriod)) {
            await self.write(OpenChannelMsg(self.config).buffer);
        }
        if(res.channelClosed()) {
            await self.write(UnassaignChannelMsg(self.config).buffer);
        }
        console.log(`serial:response ${value}`);
    }
    async onBroadcast(value) {
        const self = this;
        const hr   = value[11];
        if(!(hr === undefined) && !isNaN(hr)) {
            xf.dispatch('device:hr', hr);
        }
    }
    serial(writer) {
        const self  = this;
        self.writer = writer;
    }
    async write(buffer) {
        const self = this;
        return await self.writer.write(buffer);
    }
}

// xf.sub('serial:data', data => {
//     console.log(`serial:data  ${data}`);
//     hrChannel.open(writer, data);
// });

let hrChannel = new HRChannel();

async function SerialANT() {
    const filter = [{usbVendorId: DynastreamId}];

    const port = await navigator.serial.requestPort({filters: filter});

    let info = port.getInfo();

    console.log(info);

    await port.open({ baudRate: 115200 });
    console.log(port);

    const writer = port.writable.getWriter();
    const reader = port.readable.getReader();

    hrChannel.serial(writer);
    hrChannel.open();

    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            console.log('Serial DONE');
            reader.releaseLock();
            break;
        }

        if(isResponse(value)) {
            hrChannel.onResponse(value);
        }
        if(isBroadcast(value)) {
            hrChannel.onBroadcast(value);
        }
        // xf.dispatch(`serial:data`, value);
    }
    writer.releaseLock();
}


xf.sub('serial:connect', async function(e) {
    console.log(`connect`);
    SerialANT();
});

export { SerialANT };
