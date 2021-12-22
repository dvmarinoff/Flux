import { equals, nthBitToBool } from '../../functions.js';

const heartRateFormat = (flags) => nthBitToBool(flags, 0);
const inContact       = (flags) => nthBitToBool(flags, 1);
const sensorContact   = (flags) => nthBitToBool(flags, 2);
const energyExpanded  = (flags) => nthBitToBool(flags, 3);
const rrInterval      = (flags) => nthBitToBool(flags, 4);

const fields = {
    heartRate: {
        size: (flags) => heartRateFormat(flags) ? 2 : 1,
    }
};

function heartRateIndex(flags) {
    return 1;
};

function readHeartRate(dataview) {
    const flags = dataview.getUint8(0, true);

    if(equals(fields.heartRate.size(flags), 1)) {
        return dataview.getUint8(heartRateIndex(flags), true);
    } else {
        return dataview.getUint16(heartRateIndex(flags), true);
    }
}

function HeartRateMeasurement() {

    function encode(args = {}) {
    }

    function decode(dataview) {
        const flags     = dataview.getUint16(0, true);
        const heartRate = readHeartRate(dataview);

        const data = {};

        data['heartRate'] = heartRate;

        return data;
    }

    return Object.freeze({
        encode,
        decode
    });
}

const heartRateMeasurement = HeartRateMeasurement();

export {
    heartRateMeasurement
};

