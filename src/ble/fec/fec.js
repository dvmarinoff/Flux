import { uuids } from '../uuids.js';
import { BLEService } from '../service.js';

import { message } from '../../ant/message.js';
import { common } from '../../ant/common.js';
import { fec } from '../../ant/fec.js';
import { equals, isObject, exists, existance, delay, dataviewToArray } from '../../functions.js';

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
        // console.log(dataviewToArray(dataview));

        const msg = message.acknowledgedData.decode(dataview, dataPageDecoder);

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

function lastCommandStatus() {
    return message.acknowledgedData.encode({
        channelNumber: 5,
        payload: common.commonPage70.encode({
            slaveSerialNumber: 0xFF,
            descriptor: 0xFFFF,
            requestedTransmission: 0b00000001,
            requestedPageNumber: 0x47,
            commandType: 0x01,
        }),
    }).buffer;
}


function userConfig(args = {}) {
    const defaults = {
        channel: 5,
        userWeight: 75,
        bikeWeight: 9,
    };

    const userWeight = existance(args.userWeight, defaults.userWeight);
    const bikeWeight = existance(args.bikeWeight, defaults.bikeWeight);
    const channel    = existance(args.channel, defaults.channel);

    console.log(`:tx :fec :userConfig ${userWeight} ${bikeWeight}`);

    return message.acknowledgedData.encode({
        channelNumber: channel,
        payload: fec.dataPage55.encode({userWeight, bikeWeight}),
    }).buffer;
}

class FEC extends BLEService {
    uuid = uuids.fec;

    postInit(args = {}) {
        this.protocol  = 'fec';
        this.wait      = 500;
        this.onData    = existance(args.onData,    ((x) => x));
        this.onControl = existance(args.onControl, ((x) => x));
        this.controllable = args.controllable;
        this.userWeight = args.controllable.userWeight;

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
    async postStart() {
        const self = this;

        await self.sub('fec2', fec2.decode, self.onData);

        await delay(4000);
        self.userConfig({userWeight: self.userWeight});
    }
    async setTargetPower(value) {
        const self = this;
        const buffer = powerTarget(value);
        console.log(`:tx :fec :power ${value}`);
        return await self.write('fec3', buffer);
    }
    async setTargetResistance(value) {
        const self = this;
        const buffer = resistanceTarget(value);
        console.log(`:tx :fec :resistance ${value}`);
        return await self.write('fec3', buffer);
    }
    async setTargetSlope(value) {
        const self = this;
        const buffer = slopeTarget(value);
        console.log(`:tx :fec :slope ${value}`);
        return await self.write('fec3', buffer);
    }
    async userConfig(value) {
        const self = this;
        const buffer = userConfig(value);
        return await self.write('fec3', buffer);
    }
    async setUserWeight(kg = 75) {
        const self = this;
        await self.userConfig({userWeight: kg});
    }
    async lastCommandStatus() {
        const self = this;
        const buffer = lastCommandStatus();
        console.log(':tx :fec :command-status');
        return await self.write('fec3', buffer);
    }
}

export { FEC };

