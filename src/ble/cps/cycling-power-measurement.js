import { Speed, Cadence } from '../cscs/measurement.js';
import { RateAdjuster } from '../common.js';
import { nthBitToBool, dataviewToArray } from '../../functions.js';

const pedalPowerBalancePresent       = (flags) => nthBitToBool(flags,  0);
const pedalPowerBalanceRefPresent    = (flags) => nthBitToBool(flags,  1);
const accumulatedTorquePresent       = (flags) => nthBitToBool(flags,  2);
const accumulatedTorqueSourcePresent = (flags) => nthBitToBool(flags,  3);
const wheelRevolutionDataPresent     = (flags) => nthBitToBool(flags,  4);
const crankRevolutionDataPresent     = (flags) => nthBitToBool(flags,  5);
const cadencePresent                 = (flags) => nthBitToBool(flags,  5);
const extremeForceMagnitudesPresent  = (flags) => nthBitToBool(flags,  6);
const extremeTorqueMagnitudesPresent = (flags) => nthBitToBool(flags,  7);
const extremeAnglesPresent           = (flags) => nthBitToBool(flags,  8);
const topDeadSpotAnglePresent        = (flags) => nthBitToBool(flags,  9);
const bottomDeadSpotAnglePresent     = (flags) => nthBitToBool(flags, 10);
const accumulatedEnergyPresent       = (flags) => nthBitToBool(flags, 11);
const offsetIndicator                = (flags) => nthBitToBool(flags, 12);

const definitions = {
    flags:                      { size: 2, resolution: 1,        unit: '' },
    power:                      { size: 2, resolution: 1,        unit: 'W' },
    pedalPowerBalance:          { size: 1, resolution: 0.5,      unit: '' },
    accumulatedTorque:          { size: 2, resolution: (1/32),   unit: '' },
    cumulativeWheelRevolutions: { size: 4, resolution: 1,        unit: '' },
    lastWheelEventTime:         { size: 2, resolution: (1/2048), unit: 's' },
    cumulativeCrankRevolutions: { size: 2, resolution: 1,        unit: '' },
    lastCrankEventTime:         { size: 2, resolution: (1/1024), unit: 's' },
    maximumForceMagnitude:      { size: 2, resolution: 1,        unit: '' },
    minimumForceMagnitude:      { size: 2, resolution: 1,        unit: '' },
    maximumTorqueMagnitude:     { size: 2, resolution: 1,        unit: '' },
    minimumTorqueMagnitude:     { size: 2, resolution: 1,        unit: '' }
    // ...
};

function flagsIndex() {
    return 0;
}

function powerIndex(flags) {
    let i = definitions.flags.size;
    return i;
}

function wheelRevolutionsIndex(flags) {
    let i = definitions.flags.size + definitions.power.size;

    if(wheelRevolutionDataPresent(flags)) {
        if(pedalPowerBalancePresent(flags)) {
            i+= definitions.pedalPowerBalance.size;
        }
        if(accumulatedTorquePresent(flags)) {
            i+= definitions.accumulatedTorque.size;
        }
        return i;
    }
    return undefined;
}

function wheelEventIndex(flags) {
    let i = definitions.flags.size + definitions.power.size;
    if(pedalPowerBalancePresent(flags)) {
        i+= definitions.pedalPowerBalance.size;
    }
    if(accumulatedTorquePresent(flags)) {
        i+= definitions.accumulatedTorque.size;
    }
    i+= definitions.cumulativeWheelRevolutions.size;
    return i;
}

function crankRevolutionsIndex(flags) {
    let i = definitions.flags.size + definitions.power.size;
    if(pedalPowerBalancePresent(flags)) {
        i+= definitions.pedalPowerBalance.size;
    }
    if(accumulatedTorquePresent(flags)) {
        i+= definitions.accumulatedTorque.size;
    }
    if(wheelRevolutionDataPresent(flags)) {
        i+= definitions.cumulativeWheelRevolutions.size;
        i+= definitions.lastWheelEventTime.size;
    }
    return i;
}

function crankEventIndex(flags) {
    let i = definitions.flags.size + definitions.power.size;
    if(pedalPowerBalancePresent(flags)) {
        i+= definitions.pedalPowerBalance.size;
    }
    if(accumulatedTorquePresent(flags)) {
        i+= definitions.accumulatedTorque.size;
    }
    if(wheelRevolutionDataPresent(flags)) {
        i+= definitions.cumulativeWheelRevolutions.size;
        i+= definitions.lastWheelEventTime.size;
    }
    i+= definitions.cumulativeCrankRevolutions.size;
    return i;
}

function readPower(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getInt16(powerIndex(flags), true);
}

function readWheelRevolutions(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getUint32(wheelRevolutionsIndex(flags), true);
}

function readWheelEvent(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getUint16(wheelEventIndex(flags), true);
}

function readCrankRevolutions(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getUint16(crankRevolutionsIndex(flags), true);
}

function readCrankEvent(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getUint16(crankEventIndex(flags), true);
}

// Example input:
//         0  1  2  3  4  5  6  7  8  9 10 11 12 13
//   (0x) 30-00-21-00-2A-00-00-00-C4-60-12-00-F7-04
//
//
//      flags  power  wheel revs   wheel time  crank revs  crank time
// (0x) 30-00 -56-00 -00-00-00-00 -00-00      -00-00      -F7-04
//
// (0x) 30-00 -5E-00 -03-00-00-00 -16-0B -01-00 -0A-03
//

function Measurement() {

    const speed   = Speed();
    const cadence = Cadence();

    const rateAdjuster = RateAdjuster({
        sensor: 'pm',
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

    function decode(dataview) {

        const flags = dataview.getUint16(0, true);

        const data = {};
        data['power'] = readPower(dataview);
        data['offsetIndicator'] = offsetIndicator(flags);

        if(wheelRevolutionDataPresent(flags)) {
            data['wheelRevolutions'] = readWheelRevolutions(dataview);
            data['wheelEvent']       = readWheelEvent(dataview);
            data['speed']            = speed.calculate(data['wheelRevolutions'],
                                                       data['wheelEvent']);
        }
        if(crankRevolutionDataPresent(flags)) {
            data['crankRevolutions'] = readCrankRevolutions(dataview);
            data['crankEvent']       = readCrankEvent(dataview);
            data['cadence']          = cadence.calculate(data['crankRevolutions'],
                                                         data['crankEvent']);
        }

        if(!rateAdjuster.isDone()) {
            rateAdjuster.update({ts: Date.now()});
        }

        // const dataLog = {
        //     ts: Date.now(),
        //     r:  data.crankRevolutions,
        //     t:  data.crankEvent,
        //     c:  data.cadence
        // };
        // console.log(dataLog);

        return data;
    }

    function encode() {
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
    pedalPowerBalancePresent,
    pedalPowerBalanceRefPresent,
    accumulatedTorquePresent,
    accumulatedTorqueSourcePresent,
    wheelRevolutionDataPresent,
    crankRevolutionDataPresent,
    cadencePresent,
    extremeForceMagnitudesPresent,
    extremeTorqueMagnitudesPresent,
    extremeAnglesPresent,
    topDeadSpotAnglePresent,
    bottomDeadSpotAnglePresent,
    accumulatedEnergyPresent,
    offsetIndicator,

    flagsIndex,
    powerIndex,
    wheelRevolutionsIndex,
    wheelEventIndex,
    crankRevolutionsIndex,
    crankEventIndex,

    readPower,
    readWheelRevolutions,
    readWheelEvent,
    readCrankRevolutions,
    readCrankEvent,
};

export { Measurement, _ };

