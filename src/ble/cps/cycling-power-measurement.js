//
// Cycling Power Spec
// Cycling Power Measurement Characteristic
//

import { equals } from '../../functions.js';
import { RevsOverTime, RateAdjuster } from '../cscs/revs-over-time.js';

const pedalPowerBalancePresent       = (flags) => ((flags >>  0) & 1) === 1;
const pedalPowerBalanceRefPresent    = (flags) => ((flags >>  1) & 1) === 1;
const accumulatedTorquePresent       = (flags) => ((flags >>  2) & 1) === 1;
const accumulatedTorqueSourcePresent = (flags) => ((flags >>  3) & 1) === 1;
const wheelRevolutionDataPresent     = (flags) => ((flags >>  4) & 1) === 1;
const crankRevolutionDataPresent     = (flags) => ((flags >>  5) & 1) === 1;
const cadencePresent                 = (flags) => ((flags >>  5) & 1) === 1;
const extremeForceMagnitudesPresent  = (flags) => ((flags >>  6) & 1) === 1;
const extremeTorqueMagnitudesPresent = (flags) => ((flags >>  7) & 1) === 1;
const extremeAnglesPresent           = (flags) => ((flags >>  8) & 1) === 1;
const topDeadSpotAnglePresent        = (flags) => ((flags >>  9) & 1) === 1;
const bottomDeadSpotAnglePresent     = (flags) => ((flags >> 10) & 1) === 1;
const accumulatedEnergyPresent       = (flags) => ((flags >> 11) & 1) === 1;
const offsetIndicator                = (flags) => ((flags >> 12) & 1) === 1;

const fields = {
    flags:                      {resolution: 1,        unit: '',    size: 2,   type: 'Uint16', present: ((_) => true)},
    power:                      {resolution: 1,        unit: 'W',   size: 2,   type: 'Int16',  present: ((_) => true)},
    pedalPowerBalance:          {resolution: 0.5,      unit: '',    size: 1,   type: 'Uint8',  present: pedalPowerBalancePresent},
    accumulatedTorque:          {resolution: (1/32),   unit: '',    size: 2,   type: 'Uint16', present: accumulatedTorquePresent},
    cumulativeWheelRevolutions: {resolution: 1,        unit: '',    size: 4,   type: 'Uint32', present: wheelRevolutionDataPresent},
    lastWheelEventTime:         {resolution: (1/2048), unit: 's',   size: 2,   type: 'Uint16', present: wheelRevolutionDataPresent},
    cumulativeCrankRevolutions: {resolution: 1,        unit: '',    size: 2,   type: 'Uint16', present: crankRevolutionDataPresent},
    lastCrankEventTime:         {resolution: (1/1024), unit: 's',   size: 2,   type: 'Uint16', present: crankRevolutionDataPresent},
    maximumForceMagnitude:      {resolution: 1,        unit: '',    size: 2,   type: 'Int16',  present: extremeForceMagnitudesPresent},
    minimumForceMagnitude:      {resolution: 1,        unit: '',    size: 2,   type: 'Int16',  present: extremeForceMagnitudesPresent},
    maximumTorqueMagnitude:     {resolution: (1/32),   unit: '',    size: 2,   type: 'Int16',  present: extremeTorqueMagnitudesPresent},
    minimumTorqueMagnitude:     {resolution: (1/32),   unit: '',    size: 2,   type: 'Int16',  present: extremeTorqueMagnitudesPresent},
    extreamAngles:              {resolution: 1,        unit: 'deg', size: 3,   type: 'Uint24', present: extremeAnglesPresent},
    // maximumAngle:               {resolution: 1,        unit: 'deg', size: 1.5, type: 'Uint12', present: extremeAnglesPresent},
    // minimumAngle:               {resolution: 1,        unit: 'deg', size: 1.5, type: 'Uint12', present: extremeAnglesPresent},
    topDeadSpotAngle:           {resolution: 1,        unit: 'deg', size: 2,   type: 'Uint16', present: topDeadSpotAnglePresent},
    bottomDeadSpotAngle:        {resolution: 1,        unit: 'deg', size: 2,   type: 'Uint16', present: bottomDeadSpotAnglePresent},
    accumulatedEnergy:          {resolution: 1,        unit: 'kJ',  size: 2,   type: 'Uint16', present: accumulatedEnergyPresent},
};

const order = [
    'flags',
    'power',
    'pedalPowerBalance',
    'accumulatedTorque',
    'cumulativeWheelRevolutions',
    'lastWheelEventTime',
    'cumulativeCrankRevolutions',
    'lastCrankEventTime',
    'maximumForceMagnitude',
    'minimumForceMagnitude',
    'maximumTorqueMagnitude',
    'minimumTorqueMagnitude',
    'extreamAngles', // maybe remove those it's Uint12 + Uint12
    'topDeadSpotAngle',
    'bottomDeadSpotAngle',
    'accumulatedEnergy',
];

// Example input:
//
//
//      flags  power  wheel revs   wheel time  crank revs  crank time
//       0  1   2  3   4  5  6  7   8  9       10 11       12 13
//
// (0x) 30-00 -21-00 -2A-00-00-00  -C4-60      -12-00      -F7-04
//      48, 0, 33, 0, 42, 0, 0, 0, 196,96,      18, 0,     247, 4
// (0x) 30-00 -56-00 -00-00-00-00  -00-00      -00-00      -F7-04
//      48, 0, 86, 0,  0, 0, 0, 0,   0, 0,       0, 0,     247, 4
// (0x) 30-00 -5E-00 -03-00-00-00  -16-0B      -01-00      -0A-03
//      48, 0, 94, 0,  3, 0, 0, 0,  22,11,       1, 0,      10, 3
//
// '30-00-21-00-2A-00-00-00-C4-60-12-00-F7-04'.split('-').map(x => Number('0x'+x))
//

function CyclingPowerMeasurement(args = {}) {
    const architecture = true;

    function getField(field, dataview, i) {
        if(equals(field.type, 'Uint24')) {
            return (((dataview.getUint16(i, architecture) & 0b1111111111110000) << 4) +
                    dataview.getUint8(i+2, architecture)) *
                   field.resolution;
        }

        return dataview[`get${field.type}`](i, architecture) * field.resolution;
    }

    const cadence = RevsOverTime({
        resolution: 1,
        maxRevs:    (2**16) * fields.cumulativeCrankRevolutions.resolution, // 1
        maxTime:    (2**16) * fields.lastCrankEventTime.resolution, // 1024
        // revs per second to revs per 60 seconds
        format:     (x) => Math.round(x * 60),
    });

    const rateAdjuster = RateAdjuster({
        sensor: 'powerMeter',
        onDone: function(maxRateCount) {
            cadence.setMaxRateCount(maxRateCount);
        }
    });

    function decode(dataview) {
        const byteLength = dataview.byteLength;

        return order.reduce(function(acc, fieldName) {
            const field = fields[fieldName];

            if((acc.i + field.size) > byteLength) return acc;

            if(field.present(acc.flags)) {
                const value = getField(field, dataview, acc.i);
                const unit  = field.unit;
                const name  = field.short ?? fieldName;

                if(acc.i === 0) {
                    acc.flags = value;
                }

                acc.data[name] = value;

                if(name === 'lastCrankEventTime') {
                    acc.data['cadence'] = cadence.calculate(
                        acc.data['cumulativeCrankRevolutions'],
                        acc.data['lastCrankEventTime'],
                    );
                }

                acc.i += field.size;
            };

            return acc;

        }, {i: 0, flags: 0, data: {}}).data;
    }

    return Object.freeze({
        decode,
    });
}

const cyclingPowerMeasurement = CyclingPowerMeasurement();

export {
    CyclingPowerMeasurement,
    cyclingPowerMeasurement,
};

