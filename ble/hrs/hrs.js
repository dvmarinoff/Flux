import { nthBitToBool } from '../../functions.js';

const hrValueFormat  = (flags) => nthBitToBool(flags, 0);
const inContact      = (flags) => nthBitToBool(flags, 1);
const sensorContact  = (flags) => nthBitToBool(flags, 2);
const energyExpanded = (flags) => nthBitToBool(flags, 3);
const rrInterval     = (flags) => nthBitToBool(flags, 4);

const fields = {
    hr: {
        size: (flags) => hrValueFormat(flags) ? 2 : 1,
    }
};

function hrIndex(flags) {
    return 1;
};

function dataviewToHeartRateMeasurement(dataview) {
    const flags = dataview.getUint8(0, true);

    let hr;
    if(fields.hr.size(flags) === 1) {
        hr = dataview.getUint8(hrIndex(flags), true);
    } else {
        hr = dataview.getUint16(hrIndex(flags), true);
    }

    return { hr };
}

let hrs = {
    dataviewToHeartRateMeasurement
};

export { hrs };
