//
// FTMS spec
// 4.9 Indoor Bike Data (characteristic)
//

import { equals, getUint24LE, } from '../../functions.js';

const speedPresent               = (flags) => ((flags >>  0) & 1) === 0;
const avgSpeedPresent            = (flags) => ((flags >>  1) & 1) === 1;
const cadencePresent             = (flags) => ((flags >>  2) & 1) === 1;
const avgCadencePresent          = (flags) => ((flags >>  3) & 1) === 1;
const distancePresent            = (flags) => ((flags >>  4) & 1) === 1;
const resistancePresent          = (flags) => ((flags >>  5) & 1) === 1;
const powerPresent               = (flags) => ((flags >>  6) & 1) === 1;
const avgPowerPresent            = (flags) => ((flags >>  7) & 1) === 1;
const expandedEnergyPresent      = (flags) => ((flags >>  8) & 1) === 1;
const heartRatePresent           = (flags) => ((flags >>  9) & 1) === 1;
const metabolicEquivalentPresent = (flags) => ((flags >> 10) & 1) === 1;
const elapsedTimePresent         = (flags) => ((flags >> 11) & 1) === 1;
const remainingTimePresent       = (flags) => ((flags >> 12) & 1) === 1;

const fields = {
    Flags:                 {resolution: 1,    unit: 'bit',      size: 2, type: 'Uint16', present: (_ => true),                                   },
    InstantaneousSpeed:    {resolution: 0.01, unit: 'kph',      size: 2, type: 'Uint16', present: speedPresent,               short: 'speed',    },
    AverageSpeed:          {resolution: 0.01, unit: 'kph',      size: 2, type: 'Uint16', present: avgSpeedPresent,                               },
    InstantaneousCadence:  {resolution: 0.5,  unit: 'rpm',      size: 2, type: 'Uint16', present: cadencePresent,             short: 'cadence',  },
    AverageCadence:        {resolution: 0.5,  unit: 'rpm',      size: 2, type: 'Uint16', present: avgCadencePresent,                             },
    TotalDistance:         {resolution: 1,    unit: 'm',        size: 3, type: 'Uint24', present: distancePresent,            short: 'distance'  },
    ResistanceLevel:       {resolution: 1,    unit: 'unitless', size: 2, type: 'Uint16', present: resistancePresent,                             },
    InstantaneousPower:    {resolution: 1,    unit: 'W',        size: 2, type: 'Uint16', present: powerPresent,               short: 'power',    },
    AveragePower:          {resolution: 1,    unit: 'W',        size: 2, type: 'Uint16', present: avgPowerPresent,                               },
    TotalEnergy:           {resolution: 1,    unit: 'kcal',     size: 2, type: 'Int16',  present: expandedEnergyPresent,                         },
    EnergyPerHour:         {resolution: 1,    unit: 'kcal',     size: 2, type: 'Int16',  present: expandedEnergyPresent,                         },
    EnergyPerMinute:       {resolution: 1,    unit: 'kcal',     size: 1, type: 'Uint8',  present: expandedEnergyPresent,                         },
    HeartRate:             {resolution: 1,    unit: 'bpm',      size: 1, type: 'Uint8',  present: heartRatePresent,           short: 'heartRate',},
    MetabolicEquivalent:   {resolution: 1,    unit: 'me',       size: 1, type: 'Uint8',  present: metabolicEquivalentPresent,                    },
    ElapsedTime:           {resolution: 1,    unit: 's',        size: 2, type: 'Uint16', present: elapsedTimePresent,                            },
    RemainingTime:         {resolution: 1,    unit: 's',        size: 2, type: 'Uint16', present: remainingTimePresent,                          },
};

const order = [
    'Flags',
    'InstantaneousSpeed',
    'AverageSpeed',
    'InstantaneousCadence',
    'AverageCadence',
    'TotalDistance',
    'ResistanceLevel',
    'InstantaneousPower',
    'AveragePower',
    'TotalEnergy',
    'EnergyPerHour',
    'EnergyPerMinute',
    'HeartRate',
    'MetabolicEquivalent',
    'ElapsedTime',
    'RemainingTime',
];

function IndoorBikeData(args = {}) {
    const architecture = true;

    function getField(field, dataview, i) {
        if(equals(field.type, 'Uint24')) {
            return getUint24LE(dataview, i) * field.resolution;
        }
        return dataview[`get${field.type}`](i, architecture) * field.resolution;
    }

    // Dataview -> {'<field-name>': {value: Number, unit: String}}
    function decode(dataview) {
        const byteLength = dataview.byteLength;

        return order.reduce(function(acc, fieldName) {
            const field = fields[fieldName];

            if((acc.i + field.size) > byteLength) return acc;

            if(field.present(acc.flags)) {
                const value = getField(field, dataview, acc.i);
                const unit  = field?.unit ?? '';
                const name  = field?.short ?? fieldName;

                if(acc.i === 0) {
                    acc.flags = value;
                } else {
                    // acc.data[name] = {value, unit,};
                    acc.data[name] = value;
                }
                acc.i += field.size;
            };

            return acc;
        }, {i: 0, flags: 0, data: {}}).data;
    }

    return Object.freeze({
        getField,
        decode,
    });
}

const indoorBikeData = IndoorBikeData();

export {
    IndoorBikeData,
    indoorBikeData,
};

