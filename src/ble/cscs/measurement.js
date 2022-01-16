import { State, RateAdjuster } from '../common.js';
import { equals, exists, existance, nthBitToBool, dataviewToArray } from '../../functions.js';
import { format } from '../../utils.js';

const wheelRevolutionDataPresent        = (flags) => nthBitToBool(flags, 0);
const crankRevolutionDataPresent        = (flags) => nthBitToBool(flags, 1);
const cumulativeWheelRevolutionsPresent = (flags) => nthBitToBool(flags, 2);

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
    if(wheelRevolutionDataPresent(flags)) {
        const i = definitions.flags.size;
        return i;
    }
    return undefined;
}

function lastWheelEventTimeIndex(flags) {
    let i = definitions.flags.size;
    if(wheelRevolutionDataPresent(flags)) {
        i+= definitions.cumulativeWheelRevolutions.size;
        return i;
    }
    return undefined;
}

function cumulativeCrankRevolutionsIndex(flags) {
    let i = definitions.flags.size;
    if(crankRevolutionDataPresent(flags)) {

        if(wheelRevolutionDataPresent(flags)) {
            i+= definitions.cumulativeWheelRevolutions.size;
            i+= definitions.lastWheelEventTime.size;
            return i;
        }

        return i;
    }
    return undefined;
}

function lastCrankEventTimeIndex(flags) {
    let i = definitions.flags.size;
    if(crankRevolutionDataPresent(flags)) {

        if(wheelRevolutionDataPresent(flags)) {
            i+= definitions.cumulativeWheelRevolutions.size;
            i+= definitions.lastWheelEventTime.size;
        }

        i+= definitions.cumulativeCrankRevolutions.size;

        return i;
    }

    return undefined;
}

function readFlags(dataview) {
    const flags = dataview.getUint8(flagsIndex(), true);
    return flags;
}

function readCumulativeWheelRevolutions(dataview) {
    const flags = readFlags(dataview);
    const index = cumulativeWheelRevolutionsIndex(flags);
    if(exists(index)) {
        return dataview.getUint32(index, true);
    }
    return undefined;
}

function readLastWheelEventTime(dataview) {
    const flags = readFlags(dataview);
    const index = lastWheelEventTimeIndex(flags);
    if(exists(index)) {
        return dataview.getUint16(index, true);
    }
    return undefined;
}

function readCumulativeCrankRevolutions(dataview) {
    const flags = readFlags(dataview);
    const index = cumulativeCrankRevolutionsIndex(flags);
    if(exists(index)) {
        return dataview.getUint16(index, true);
    }
    return undefined;
}

function readLastCrankEventTime(dataview) {
    const flags = readFlags(dataview);
    const index = lastCrankEventTimeIndex(flags);
    if(exists(index)) {
        return dataview.getUint16(index, true);
    }
    return undefined;
}

function Cadence(args = {}) {
    // In two successive measurements:
    // Instantaneous Cadence =
    //    (Difference in two successive Cumulative Crank Revolutions values) /
    //    (Difference in two successive Last Crank Event Time values)

    function transform(x) {
        // revs per second to revs per minutes
        return Math.round(x * 60);
    }

    const stateValue = State({
        resolution:   1024,
        maxRevs:      2**16,
        maxTime:      2**16,
        transform,
    });

    return Object.freeze(
        stateValue
    );
}

function Speed(args = {}) {
    // In two successive measurements:
    // Instantaneous Speed =
    //    (Difference in two successive Cumulative Wheel Revolution values
    //    * Wheel Circumference) /
    //    (Difference in two successive Last Wheel Event Time values)

    const defaults = {
        wheelCircumference: 2.105, // meters or 700x25
    };

    let wheelCircumference = existance(
        args.wheelCircumference, defaults.wheelCircumference
    );

    function getWheelCircumference() {
        return wheelCircumference;
    }

    function setWheelCircumference(value) {
        wheelCircumference = value;
        return wheelCircumference;
    }

    function transform(x) {
        // revs per second to km per hour
        return format(x * wheelCircumference * 3.6 , 100);
    }

    const stateValue = State({
        resolution: 2048,
        maxRevs:    2**32,
        maxTime:    2**16,
        transform,
    });

    return Object.freeze({
        ...stateValue,
        getWheelCircumference,
        setWheelCircumference,
    });
}

// Example input:
// by Wahoo Sensor
//
// (0x) 03-0c-00-00-00-44-1A-02-00-99-1D
// (0x) [0x03, 0x0c, 0x00, 0x00, 0x00, 0x44, 0x1A, 0x02, 0x00, 0x99, 0x1D]
// (10) [3, 12, 0, 0, 0, 68, 26, 2, 0, 153, 29]
//
// “Wheel rev: 12,
//  Last wheel event time: 6724 ms,
//  Crank rev: 2,
//  Last crank event time: 7577 ms” received
//
//      flags  wheel revs   wheel time  crank revs  crank time
// (0x) 03    -0c-00-00-00 -44-1A      -02-00      -99-1D
//
// Example data stream:
//
// flags  wheel revs   wheel time  crank revs  crank time
// 03    -00-00-00-00 -00-00      -00-00      -00-00
//                                 00          0             -> 0 rpm
// 03    -00-00-00-00 -00-00      -3C-00      -00-F0
//                                 60          (60 * 1024)   -> 60 rpm
// 03    -00-00-00-00 -00-00      -3E-00      -00-F4
//                                 62          (61 * 1024)   -> 120 rpm

function Measurement() {

    const speed   = Speed();
    const cadence = Cadence();

    const rateAdjuster = RateAdjuster({
        sensor: 'cscs',
        onDone: function(maxRateCount) {
            speed.setMaxRateCount(maxRateCount);
            cadence.setMaxRateCount(maxRateCount);
        }
    });

    function reset() {
        const crank = cadence.reset();
        const wheel = speed.reset();

        return {
            wheel,
            crank,
        };
    }

    function setWheelCircumference(value) {
        return speed.setWheelCircumference(value);
    }

    function encode(value) {}

    function decode(dataview) {
        const flags = readFlags(dataview);
        let data = {};

        if(wheelRevolutionDataPresent(flags)) {
            data['wheelRevolutions'] = readCumulativeWheelRevolutions(dataview);
            data['wheelEvent'] = readLastWheelEventTime(dataview);
            data['speed'] = speed.calculate(data['wheelRevolutions'],
                                            data['wheelEvent']);
        }

        if(crankRevolutionDataPresent(flags)) {
            data['crankRevolutions'] = readCumulativeCrankRevolutions(dataview);
            data['crankEvent'] = readLastCrankEventTime(dataview);
            data['cadence'] = cadence.calculate(data['crankRevolutions'],
                                                data['crankEvent']);
        }

        if(!rateAdjuster.isDone()) {
            rateAdjuster.update({ts: Date.now()});
        }

        // const dataLog = {
        //     ts: Date.now(),
        //     r: data.crankRevolutions,
        //     t: data.crankEvent,
        //     c:  data.cadence
        // };
        // console.log(dataLog);

        return data;
    }

    return Object.freeze({
        reset,
        setWheelCircumference,
        encode,
        decode,
        speed,
        cadence,
    });
}

const _ = {
    wheelRevolutionDataPresent,
    crankRevolutionDataPresent,
    cumulativeWheelRevolutionsPresent,

    flagsIndex,
    cumulativeWheelRevolutionsIndex,
    lastWheelEventTimeIndex,
    cumulativeCrankRevolutionsIndex,
    lastCrankEventTimeIndex,

    readFlags,
    readCumulativeWheelRevolutions,
    readLastWheelEventTime,
    readCumulativeCrankRevolutions,
    readLastCrankEventTime,
};

export {
    Measurement,
    Speed,
    Cadence,
    _
};

