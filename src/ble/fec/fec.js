import { uuids } from '../uuids.js';
import { BLEService } from '../service.js';
import { message } from '../../ant/message.js';
import { fec } from '../../ant/fec.js';
import { equals, isObject, exists, existance, dataviewToArray } from '../../functions.js';

function FEC2() {

    function dataPageDecoder(dataview) {
        const pageNumber = dataview.getUint8(0, true);

        if(equals(pageNumber, fec.dataPage16.number)) {
            return fec.dataPage16.decode(dataview);
        }
        if(equals(pageNumber, fec.dataPage25.number)) {
            return fec.dataPage25.decode(dataview);
        }
        // manufacturer specific data pages (page numbers 240 - 255)
        // transmit additional parameters to calculate total resistance in SIM mode
        // not interoperable, should only be used to supplement
        // 240 -> [240, 0, 0, 0, 0, 0, 0, 0]
        // 249 -> [249, 0, 0, 0, 218, 178, 4, 0]
        //  80 -> [80, 255, 255, 1, 89, 0, 84, 11]
        // ? 81 missing in transmission

        return dataviewToArray(dataview);
    }

    function decode(dataview) {
        const msg = message.acknowledgedData.decode(dataview, dataPageDecoder);

        console.log(msg.payload);

        if(isObject(msg.payload)) {
            return msg.payload;
        }
        return {};
    }

    return Object.freeze({
        decode,
    });
}

const fec2 = FEC2();

function powerTarget(power, channel = 5) {
    return message.acknowledgedData.encode({
        channelNumber: channel,
        payload: fec.dataPage49.encode({
            power,
        }),
    }).buffer;
}

function resistanceTarget(resistance, channel = 5) {
    return message.acknowledgedData.encode({
        channelNumber: channel,
        payload: fec.dataPage48.encode({
            resistance,
        }),
    }).buffer;
}

function slopeTarget(grade, channel = 5) {
    return message.acknowledgedData.encode({
        channelNumber: channel,
        payload: fec.dataPage51.encode({
            grade,
        }),
    }).buffer;
}

function userConfig(args = {}) {
    const defaults = {
        channel: 5,
        user: {
            userWeight: 75,
            bikeWeight: 9,
        },
    };

    const user    = existance(args.user, defaults.user);
    const channel = existance(args.channel, defaults.channel);

    return message.acknowledgedData.encode({
        channelNumber: channel,
        payload: fec.dataPage55.encode(user),
    }).buffer;
}

class FEC extends BLEService {
    uuid = uuids.fec;

    postInit(args = {}) {
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
        await self.sub('fec2', fec2.decode, self.onData);

        setTimeout(function() {
            self.userConfig();
        }, 4000);
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
    async userConfig(value) {
        const self = this;
        const buffer = userConfig(value);
        return await self.write('fec3', buffer);
    }
}

export { FEC };
