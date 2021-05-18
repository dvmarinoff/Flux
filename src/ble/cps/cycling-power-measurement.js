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
function crankRevolutionsIndex(flags) {
    let i = fields.flags.size + fields.power.size;
    if(pedalPowerBalance(flags)) {
        i+= fields.pedalPowerBalance.size;
    }
    if(accumulatedTorque(flags)) {
        i+= fields.accumulatedTorque.size;
    }
    if(wheelRevolutionData(flags)) {
        i+= fields.cumulativeWheelRevolutions.size;
        i+= fields.lastWheelEventTime.size;
    }
    return i;
}
function crankEventIndex(flags) {
    let i = fields.flags.size;
    return i + 9;
}

function getPower(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getInt16(powerIndex(flags), true);
}
function getCrankRevolutions(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getInt16(crankRevolutionsIndex(flags), true);
}
function getCrankEvent(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getInt16(crankEventIndex(flags), true);
}

function cyclingPowerMeasurementDecoder(dataview) {

//               0  1  2  3  4  5  6  7  8  9 10 11 12 13
//  value: (0x) 30-00-21-00-2A-00-00-00-C4-60-12-00-F7-04
//
    const flags = dataview.getUint16(0, true);

    let data = {};
    data['power'] = getPower(dataview);
    data['offsetIndicator'] = offsetIndicator(flags);

    if(crankRevolutionData(flags)) {
        data['crankRevolutions'] = getCrankRevolutions(dataview);
        data['crankEvent'] = getCrankEvent(dataview);
    }

    return data;
}

export {
    cyclingPowerMeasurementDecoder,
};
