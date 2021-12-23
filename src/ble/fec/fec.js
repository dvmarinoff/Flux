import { uuids } from '../uuids.js';
import { BLEService } from '../service.js';
import { message } from '../../ant/message.js';
import { page } from '../../ant/page.js';
import { existance } from '../../functions.js';

function fec2Decoder(dataview) {
    const data = message.Data(dataview);
    return data;
}

function powerTarget(value, channel = 5) {
    return message.Control(page.dataPage49(value, channel));
}
function resistanceTarget(value, channel = 5) {
    return message.Control(page.dataPage48(value, channel));
}
function slopeTarget(value, channel = 5) {
    return message.Control(page.dataPage51(value, channel));
}

class FEC extends BLEService {
    uuid = uuids.fec;

    postInit(args = {}) {
        // this.ble = args.ble;
        // this.device = args.device;
        // this.server = args.server;
        // this.deviceServices = args.services;
        // this.onStatus = args.onStatus || ((x) => x);
        // this.onControl = args.onControl || ((x) => x);
        // this.onData = args.onData || ((x) => x);

        this.onData    = existance(args.onData,    ((x) => x));
        this.onControl = existance(args.onControl, ((x) => x));

        this.characteristics = {
            fec2: {
                uuid: uuids.fec2,
                supported: false,
                characteristic: undefined
            },
            fec3: {
                uuid: uuids.fec3,
                supported: false,
                characteristic: undefined
            },
        };
    }
    async config() {
        const self = this;
        await self.sub('fec2', fec2Decoder, self.onData);
    }
    async setTargetPower(value) {
        const self = this;
        const buffer = powerTarget(value);
        return await self.write('fec3', buffer);
    }
    async setTargetResistance(value) {
        const self = this;
        const buffer = resistanceTarget(value);
        return await self.write('fec3', buffer);
    }
    async setTargetSlope(value) {
        const self = this;
        const buffer = slopeTarget(value);
        return await self.write('fec3', buffer);
    }
}

export { FEC };
