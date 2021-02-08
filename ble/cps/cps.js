import { nthBitToBool } from '../../functions.js';

const pedalPowerBalance       = (flags) => nthBitToBool(flags,  0);
const pedalPowerBalanceRef    = (flags) => nthBitToBool(flags,  1);
const accumulatedTorque       = (flags) => nthBitToBool(flags,  2);
const accumulatedTorqueSource = (flags) => nthBitToBool(flags,  3);
const wheelRevolutionData     = (flags) => nthBitToBool(flags,  4);
const crankRevolutionData     = (flags) => nthBitToBool(flags,  5);
const extremeForceMagnitudes  = (flags) => nthBitToBool(flags,  6);
const extremeTorqueMagnitudes = (flags) => nthBitToBool(flags,  7);
const extremeAngles           = (flags) => nthBitToBool(flags,  8);
const topDeadSpotAngle        = (flags) => nthBitToBool(flags,  9);
const bottomDeadSpotAngle     = (flags) => nthBitToBool(flags, 10);
const accumulatedEnergy       = (flags) => nthBitToBool(flags, 11);
const offsetIndicator         = (flags) => nthBitToBool(flags, 12);

const fields = {
    flags:                      { size: 2 },
    power:                      { size: 2, resolution: 1 },
    pedalPowerBalance:          { size: 1, resolution: 0.5 },
    accumulatedTorque:          { size: 2, resolution: (1/32) },
    cumulativeWheelRevolutions: { size: 4, resolution: 1 },
    lastWheelEventTime:         { size: 2, resolution: (1/2048) },
    cumulativeCrankRevolutions: { size: 2, resolution: 1 },
    lastCrankEventTime:         { size: 2, resolution: (1/1024)},
    maximumForceMagnitude:      { size: 2, resolution: 1 },
    minimumForceMagnitude:      { size: 2, resolution: 1 },
    maximumTorqueMagnitude:     { size: 2, resolution: 1 },
    minimumTorqueMagnitude:     { size: 2, resolution: 1 }
    // ...
};

function cadencePresent(flags) {
    return nthBitToBool(flags, 5);
}

function powerIndex(flags) {
    let i = fields.flags.size;
    return i;
}
function cadenceIndex(flags) {
    let i = fields.flags.size;
    return i + 7;
}

function getPower(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getInt16(powerIndex(flags), true);
}
function getCadence(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getInt16(cadenceIndex(flags), true);
}

function dataviewToCyclingPowerMeasurement(dataview) {

//               0  1  2  3  4  5  6  7  8  9 10 11 12 13
//  value: (0x) 30-00-21-00-2A-00-00-00-C4-60-12-00-F7-04
//
    const flags = dataview.getUint16(0, true);
    let    data = {};

    data['power'] = getPower(dataview);

    return data;
}

let cps = {
    dataviewToCyclingPowerMeasurement,
};

export { cps };
