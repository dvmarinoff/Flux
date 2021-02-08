import { nthBitToBool }  from '../../functions.js';

const flags = {
    InstantaneousSpeed:    { flagBit:  0, present: 0 },
    MoreData:              { flagBit:  0, present: 0 },
    InstantaneousCandence: { flagBit:  1, present: 0 },
    AverageSpeed:          { flagBit:  2, present: 1 },
    AverageCandence:       { flagBit:  3, present: 1 },
    TotalDistance:         { flagBit:  4, present: 1 },
    ResistanceLevel:       { flagBit:  5, present: 1 },
    InstantaneousPower:    { flagBit:  6, present: 1 },
    AveragePower:          { flagBit:  7, present: 1 },
    ExpendedEnergy:        { flagBit:  8, present: 1 },
    HeartRate:             { flagBit:  9, present: 1 },
    MetabolicEquivalent:   { flagBit: 10, present: 1 },
    ElapsedTime:           { flagBit: 11, present: 1 },
    RemainingTime:         { flagBit: 12, present: 1 }
    // Reserved:              { flagBit: 13-15, present: null }
};

const fields = {
    Flags:                 { type: 'Uint16', size: 2, resolution: 1,    unit: 'bit'     },
    InstantaneousSpeed:    { type: 'Uint16', size: 2, resolution: 0.01, unit: 'kph'     },
    AverageSpeed:          { type: 'Uint16', size: 2, resolution: 0.01, unit: 'kph'     },
    InstantaneousCandence: { type: 'Uint16', size: 2, resolution: 0.5,  unit: 'rpm'     },
    AverageCandence:       { type: 'Uint16', size: 2, resolution: 0.5,  unit: 'rpm'     },
    TotalDistance:         { type: 'Uint24', size: 3, resolution: 1,    unit: 'm'       },
    ResistanceLevel:       { type: 'Uint16', size: 2, resolution: 1,    unit: 'unitless'},
    InstantaneousPower:    { type: 'Uint16', size: 2, resolution: 1,    unit: 'W'       },
    AveragePower:          { type: 'Uint16', size: 2, resolution: 1,    unit: 'W'       },
    TotalEnergy:           { type: 'Int16',  size: 2, resolution: 1,    unit: 'kcal'    },
    EnergyPerHour:         { type: 'Int16',  size: 2, resolution: 1,    unit: 'kcal'    },
    EnergyPerMinute:       { type: 'Uint8',  size: 1, resolution: 1,    unit: 'kcal'    },
    HeartRate:             { type: 'Uint16', size: 2, resolution: 1,    unit: 'bpm'     },
    MetabolicEquivalent:   { type: 'Uint8',  size: 1, resolution: 1,    unit: 'me'      },
    ElapsedTime:           { type: 'Uint16', size: 2, resolution: 1,    unit: 's'       },
    RemainingTime:         { type: 'Uint16', size: 2, resolution: 1,    unit: 's'       }
};

const speedPresent          = (flags) => !(nthBitToBool(flags, 0));
const avgSpeedPresent       = (flags) =>   nthBitToBool(flags, 1);
const cadencePresent        = (flags) =>   nthBitToBool(flags, 2);
const avgCadencePresent     = (flags) =>   nthBitToBool(flags, 3);
const distancePresent       = (flags) =>   nthBitToBool(flags, 4);
const resistancePresent     = (flags) =>   nthBitToBool(flags, 5);
const powerPresent          = (flags) =>   nthBitToBool(flags, 6);
const avgPowerPresent       = (flags) =>   nthBitToBool(flags, 7);
const expandedEnergyPresent = (flags) =>   nthBitToBool(flags, 8);
const heartRatePresent      = (flags) =>   nthBitToBool(flags, 9);

function speedIndex(flags) {
    let i = fields.Flags.size;
    return i;
}
function cadenceIndex(flags) {
    let i = fields.Flags.size;
    if(speedPresent(flags))    i += fields.InstantaneousSpeed.size;
    if(avgSpeedPresent(flags)) i += fields.AverageSpeed.size;
    return i;
}
function distanceIndex(flags) {
    let i = fields.Flags.size;
    if(speedPresent(flags))      i += fields.InstantaneousSpeed.size;
    if(avgSpeedPresent(flags))   i += fields.AverageSpeed.size;
    if(cadencePresent(flags))    i += fields.InstantaneousCandence.size;
    if(avgCadencePresent(flags)) i += fields.AverageCandence.size;
    return i;
}
function powerIndex(flags) {
    let i = fields.Flags.size;
    if(speedPresent(flags))      i += fields.InstantaneousSpeed.size;
    if(avgSpeedPresent(flags))   i += fields.AverageSpeed.size;
    if(cadencePresent(flags))    i += fields.InstantaneousCandence.size;
    if(avgCadencePresent(flags)) i += fields.AverageCandence.size;
    if(distancePresent(flags))   i += fields.TotalDistance.size;
    if(resistancePresent(flags)) i += fields.ResistanceLevel.size;
    return i;
}

function getSpeed(dataview) {
    const flags = dataview.getUint16(0, true);
    const speed = dataview.getUint16(speedIndex(flags), true);
    return (speed * fields.InstantaneousSpeed.resolution);
}
function getCadence(dataview) {
    const flags = dataview.getUint16(0, true);
    const cadence = dataview.getUint16(cadenceIndex(flags), true);
    return (cadence * fields.InstantaneousCandence.resolution);
}
function getDistance(dataview) {
    const flags    = dataview.getUint16(0, true);
    const distance = dataview.getUint16(distanceIndex(flags), true);
    return (distance * fields.TotalDistance.resolution);
}
function getPower(dataview) {
    const flags   = dataview.getUint16(0, true);
    return dataview.getUint16(powerIndex(flags), true);
}

// Example:
//    value: (0x) 44-00-18-01-14-00-06-00
//           (10) 68-00-24-01-20-00-06-00
//
//    "Instantanious Speed: 2.8 km/h
//     Instantanious Cadence: 10.0 per min
//     Instantanious Power: 6 W" received
//
// flags  68, 0b01000100
// flags 100, 0b01100100

function dataviewToIndoorBikeData(dataview) {
    const flags = dataview.getUint16(0, true);
    let data    = {};

    if(speedPresent(flags)) {
        data['speed']    = getSpeed(dataview);
    }
    if(cadencePresent(flags)) {
        data['cadence']  = getCadence(dataview);
    }
    if(distancePresent(flags)) {
        data['distance'] = getDistance(dataview);
    }
    if(speedPresent(flags)) {
        data['power']    = getPower(dataview);
    }

    console.log(`dataviewToIndoorBikeData: ${data}`);
    return data;
}

export { dataviewToIndoorBikeData };
