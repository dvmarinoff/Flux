import { nthBitToBool } from '../../functions.js';
import { format } from '../../utils.js';

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
function wheelRevolutionsIndex(flags) {
    let i = fields.flags.size + fields.power.size;
    if(pedalPowerBalance(flags)) {
        i+= fields.pedalPowerBalance.size;
    }
    if(accumulatedTorque(flags)) {
        i+= fields.accumulatedTorque.size;
    }
    return i;
}
function wheelEventIndex(flags) {
    let i = fields.flags.size + fields.power.size;
    if(pedalPowerBalance(flags)) {
        i+= fields.pedalPowerBalance.size;
    }
    if(accumulatedTorque(flags)) {
        i+= fields.accumulatedTorque.size;
    }
    i+= fields.cumulativeWheelRevolutions.size;
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
    i+= fields.cumulativeCrankRevolutions.size;
    return i;
}

function getPower(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getInt16(powerIndex(flags), true);
}
function getWheelRevolutions(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getUint32(wheelRevolutionsIndex(flags), true);
}
function getWheelEvent(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getUint16(wheelEventIndex(flags), true);
}
function getCrankRevolutions(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getUint16(crankRevolutionsIndex(flags), true);
}
function getCrankEvent(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getUint16(crankEventIndex(flags), true);
}



// Instantaneous Speed = (Difference in two successive Cumulative Wheel Revolution values * Wheel Circumference) /
//                       (Difference in two successive Last Wheel Event Time values)

let wheel_rev_1 = -1;
let wheel_time_1 = -1;
function calculateSpeed(wheel_rev_2, wheel_time_2) {
    const resolution = 2048;
    const rollover = 2048 * 32;
    const wheel_circumference = 2.105; // m -> 700x25
    const toKmh = 3.6;

    if(wheel_rev_1 < 0) wheel_rev_1 = wheel_rev_2;
    if(wheel_time_1 < 0) wheel_time_1 = wheel_time_2;

    if(wheel_time_2 < wheel_time_1) wheel_time_1 = wheel_time_1 - rollover; // clock rolls over
    if(wheel_rev_2 === wheel_rev_1) return 0; // coasting

    let speed = ((wheel_rev_1 - wheel_rev_2) * wheel_circumference /
                   ((wheel_time_1 - wheel_time_2) / resolution)) * toKmh;
        speed = format(speed, 100);

    wheel_rev_1 = wheel_rev_2;
    wheel_time_1 = wheel_time_2;
    return speed;
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

function CyclingPowerMeasurement() {

    function decode(dataview) {
        //               0  1  2  3  4  5  6  7  8  9 10 11 12 13
        //  value: (0x) 30-00-21-00-2A-00-00-00-C4-60-12-00-F7-04
        //
        // power    , speed                       , cadence
        // 86 0x0056, 0 0x00-00-00-00, 0    0x0000, 0    0 0x0000
        // 94 0x005E, 3 0x00-00-00-03  2838 0x0B16, 79 778 0x030A
        //
        // (0x) 30-00 -56-00 -00-00-00-00 -00-00 -00-00-F7-04
        // (0x) 30-00 -5E-00 -03-00-00-00 -16-0B -01-00-0A-03

        const flags = dataview.getUint16(0, true);

        const data = {};
        data['power'] = getPower(dataview);
        data['offsetIndicator'] = offsetIndicator(flags);

        if(wheelRevolutionData(flags)) {
            data['wheelRevolutions'] = getWheelRevolutions(dataview);
            data['wheelEvent']       = getWheelEvent(dataview);
            data['speed']            = calculateSpeed(data['wheelRevolutions'],
                                                      data['wheelEvent']);
        }
        if(crankRevolutionData(flags)) {
            data['crankRevolutions'] = getCrankRevolutions(dataview);
            data['crankEvent']       = getCrankEvent(dataview);
            data['cadence']          = calculateCadence(data['crankRevolutions'],
                                                        data['crankEvent']);
        }

        return data;
    }

    function encode() {
    }

    return Object.freeze({
        encode,
        decode,
    });
}

const cyclingPowerMeasurement = CyclingPowerMeasurement();

export {
    cyclingPowerMeasurement,
};

