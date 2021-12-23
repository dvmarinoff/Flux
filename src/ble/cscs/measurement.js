import { nthBitToBool } from '../../functions.js';

const wheelRevolutionDataPresent = (flags) => nthBitToBool(flags, 0);
const crankRevolutionDataPresent = (flags) => nthBitToBool(flags, 1);
const cumulativeWheelRevolutions = (flags) => nthBitToBool(flags, 2);

const definitions = {
    flags: {
        size: 1, resolution: 1, unit: '',
    },
    cumulativeWheelRevolutions: {
        size: 4, resolution: 1, unit: '',
    },
    lastWheelEventTime: {
        size: 2, resolution: (1/1024), unit: 's',
    },
    cumulativeCrankRevolutions: {
        size: 2, resolution: 1, unit: '',
    },
    lastCrankEventTime: {
        size: 2, resolution: (1/1024), unit: 's',
    },

};

function flagsIndex() {
    return 0;
}

function cumulativeWheelRevolutionsIndex(flags) {
    const i = definitions.flags.size;
    return i;
}

function lastWheelEventTimeIndex(flags) {
    let i = definitions.flags.size;
    if(wheelRevolutionDataPresent(flags)) {
        i+= definitions.cumulativeWheelRevolutions.size;
    }
    return i;
}

function cumulativeCrankRevolutionsIndex(flags) {
    let i = definitions.flags.size;
    if(wheelRevolutionDataPresent(flags)) {
        i+= definitions.cumulativeWheelRevolutions.size;
        i+= definitions.lastWheelEventTime.size;
    }
    return i;
}

function lastCrankEventTimeIndex(flags) {
    let i = definitions.flags.size;
    if(wheelRevolutionDataPresent(flags)) {
        i+= definitions.cumulativeWheelRevolutions.size;
        i+= definitions.lastWheelEventTime.size;
    }
    if(crankRevolutionDataPresent(flags)) {
        i+= definitions.cumulativeCrankRevolutions.size;
    }
    return i;
}

function readFlags(dataview) {
    const flags = dataview.getUint8(flagsIndex(), true);
    return flags;
}

function readCumulativeWheelRevolutions(dataview) {
    const flags = readFlags(dataview);
    const index = cumulativeWheelRevolutionsIndex(flags);
    return dataview.getUint32(index, true);
}

function readLastWheelEventTime(dataview) {
    const flags = readFlags(dataview);
    const index = lastWheelEventTimeIndex(flags);
    return dataview.getUint16(index, true);
}

function readCumulativeCrankRevolutions(dataview) {
    const flags = readFlags(dataview);
    const index = cumulativeCrankRevolutionsIndex(flags);
    return dataview.getUint16(index, true);
}

function readLastCrankEventTime(dataview) {
    const flags = readFlags(dataview);
    const index = lastCrankEventTimeIndex(flags);
    return dataview.getUint16(index, true);
}

// Instantaneous Cadence = (Difference in two successive Cumulative Crank Revolutions values) /
//                         (Difference in two successive Last Crank Event Time values)
let crank_revs_1 = -1;
let crank_time_1 = -1;

function calculateCadence(crank_revs_2, crank_time_2) {
    const resolution = 1024;
    const rollover = 1024 * 64;
    const toRpm =  60;
    if(crank_revs_1 < 0) crank_revs_1 = crank_revs_2; // set initial value
    if(crank_time_1 < 0) crank_time_1 = crank_time_2; // set initial value

    if(crank_time_2 < crank_time_1) crank_time_1 = crank_time_1 - rollover; // clock rolls over
    if(crank_revs_1 === crank_revs_2) return 0; // coasting

    const cadence = Math.round((crank_revs_1 - crank_revs_2) /
                               ((crank_time_1 - crank_time_2) / (resolution * toRpm)));
    crank_revs_1 = crank_revs_2;
    crank_time_1 = crank_time_2;
    return cadence;
}

// Example input:
// Wahoo Sensor
//
// (0x) 03-0c-00-00-00-44-1A-02-00-99-1D
// (0x) [0x03, 0x0c, 0x00, 0x00, 0x00, 0x44, 0x1A, 0x02, 0x00, 0x99, 0x1D]
// (10) [3, 12, 0, 0, 0, 68, 26, 2, 0, 153, 29]
//
// “Wheel rev: 12,
// Last wheel event time: 6724 ms,
// Crank rev: 2,
// Last crank event time: 7577 ms” received
//

function Measurement() {

    function encode(value) {}

    function decode(dataview) {
        const flags = readFlags(dataview);
        let data = {};

        if(wheelRevolutionDataPresent(flags)) {
            data['cumulativeWheelRevolutions'] = readCumulativeWheelRevolutions(dataview);
            data['lastWheelEventTime'] = readLastWheelEventTime(dataview);
        }

        if(crankRevolutionDataPresent(flags)) {
            data['cumulativeCrankRevolutions'] = readCumulativeCrankRevolutions(dataview);
            data['lastCrankEventTime'] = readLastCrankEventTime(dataview);
            data['cadence'] = calculateCadence(data['crankRevolutions'], data['crankEvent']);
        }

        // console.log(data);

        return data;
    }

    return Object.freeze({
        encode,
        decode
    });
}

const measurement = Measurement();

export {
    measurement,
}
