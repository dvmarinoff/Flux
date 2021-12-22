//
// 4.9 Indoor Bike Data (characteristic)
//

import { nthBitToBool }  from '../../functions.js';

const flags = {
    InstantaneousSpeed:    { flagBit:  0, present: 0 },
    MoreData:              { flagBit:  0, present: 0 },
    InstantaneousCandence: { flagBit:  2, present: 1 }, // bit 1, present 0
    AverageSpeed:          { flagBit:  1, present: 1 }, // bit 2, present 1
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

const speedPresent               = (flags) => !(nthBitToBool(flags, 0));
const avgSpeedPresent            = (flags) =>   nthBitToBool(flags, 1);
const cadencePresent             = (flags) =>   nthBitToBool(flags, 2);
const avgCadencePresent          = (flags) =>   nthBitToBool(flags, 3);
const distancePresent            = (flags) =>   nthBitToBool(flags, 4);
const resistancePresent          = (flags) =>   nthBitToBool(flags, 5);
const powerPresent               = (flags) =>   nthBitToBool(flags, 6);
const avgPowerPresent            = (flags) =>   nthBitToBool(flags, 7);
const expandedEnergyPresent      = (flags) =>   nthBitToBool(flags, 8);
const heartRatePresent           = (flags) =>   nthBitToBool(flags, 9);
const metabolicEquivalentPresent = (flags) =>   nthBitToBool(flags, 10);
const elapsedTimePresent         = (flags) =>   nthBitToBool(flags, 11);
const remainingTimePresent       = (flags) =>   nthBitToBool(flags, 12);

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

function energyPerHourIndex(flags) {
    let i = fields.Flags.size;
    if(speedPresent(flags))          i += fields.InstantaneousSpeed.size;
    if(avgSpeedPresent(flags))       i += fields.AverageSpeed.size;
    if(cadencePresent(flags))        i += fields.InstantaneousCandence.size;
    if(avgCadencePresent(flags))     i += fields.AverageCandence.size;
    if(distancePresent(flags))       i += fields.TotalDistance.size;
    if(resistancePresent(flags))     i += fields.ResistanceLevel.size;
    if(powerPresent(flags))          i += fields.InstantaneousPower.size;
    if(avgPowerPresent(flags))       i += fields.AvaragePower.size;
    return i;
}

function energyPerMinuteIndex(flags) {
    let i = fields.Flags.size;
    if(speedPresent(flags))          i += fields.InstantaneousSpeed.size;
    if(avgSpeedPresent(flags))       i += fields.AverageSpeed.size;
    if(cadencePresent(flags))        i += fields.InstantaneousCandence.size;
    if(avgCadencePresent(flags))     i += fields.AverageCandence.size;
    if(distancePresent(flags))       i += fields.TotalDistance.size;
    if(resistancePresent(flags))     i += fields.ResistanceLevel.size;
    if(powerPresent(flags))          i += fields.InstantaneousPower.size;
    if(avgPowerPresent(flags))       i += fields.AvaragePower.size;
    if(expandedEnergyPresent(flags)) i += fields.EnergyPerHour.size;
    return i;
}

function heartRateIndex(flags) {
    let i = fields.Flags.size;
    if(speedPresent(flags))          i += fields.InstantaneousSpeed.size;
    if(avgSpeedPresent(flags))       i += fields.AverageSpeed.size;
    if(cadencePresent(flags))        i += fields.InstantaneousCandence.size;
    if(avgCadencePresent(flags))     i += fields.AverageCandence.size;
    if(distancePresent(flags))       i += fields.TotalDistance.size;
    if(resistancePresent(flags))     i += fields.ResistanceLevel.size;
    if(powerPresent(flags))          i += fields.InstantaneousPower.size;
    if(avgPowerPresent(flags))       i += fields.AvaragePower.size;
    if(expandedEnergyPresent(flags)) i += fields.EnergyPerHour.size + fields.EnergyPerMinute.size;
    return i;
}

function readSpeed(dataview) {
    const flags = dataview.getUint16(0, true);
    const speed = dataview.getUint16(speedIndex(flags), true);
    return (speed * fields.InstantaneousSpeed.resolution);
}

function readCadence(dataview) {
    const flags = dataview.getUint16(0, true);
    const cadence = dataview.getUint16(cadenceIndex(flags), true);
    return (cadence * fields.InstantaneousCandence.resolution);
}

function readDistance(dataview) {
    const flags = dataview.getUint16(0, true);
    const distance = dataview.getUint16(distanceIndex(flags), true);
    return (distance * fields.TotalDistance.resolution);
}

function readPower(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getUint16(powerIndex(flags), true);
}

function readHeartRate(dataview) {
    const flags = dataview.getUint16(0, true);
    return dataview.getUint8(heartRateIndex(flags), true);
}

// Example:
//
// Tacx Flux S:
//(0x) 44-00-18-01-14-00-06-00
//(10) [68, 0, 24, 1, 20, 0, 6, 0]
//
//    "Instantanious Speed: 2.8 km/h
//     Instantanious Cadence: 10.0 per min
//     Instantanious Power: 6 W"
//
//              21098 76543210
// flags  68, 0b00000 01000100
//
// Schwinn 800IC:
// (0x) 44-02-AA-05-2E-00-18-00-46
// (10) [68, 2, 170, 5, 46, 0, 24, 0, 70]
//
//    "Instantanious Speed: 14.5 km/h
//     Instantanious Cadence: 23.0 per min
//     Instantanious Power: 24 W
//     Heart Rate: 70 bpm"
//
//                               5432109876543210
// flags,          66, 0x42,   0b0000000001000100
// inst speed,   3000, 0x0bb8,
// inst cadence,  160, 0xa0,
// inst power,    180, 0xb4,
//
// (0x) 42-00- b8-0b- a0-00 b4-00

function IndoorBikeData(dataview) {

    function decode(dataview) {
        const flags = dataview.getUint16(0, true);
        let data = {};

        if(speedPresent(flags)) {
            data['speed'] = readSpeed(dataview);
        }
        if(cadencePresent(flags)) {
            data['cadence'] = readCadence(dataview);
        }
        if(distancePresent(flags)) {
            data['distance'] = readDistance(dataview);
        }
        if(speedPresent(flags)) {
            data['power'] = readPower(dataview);
        }
        if(heartRatePresent(flags)) {
            data['heartRate'] = readHeartRate(dataview);
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

const indoorBikeData = IndoorBikeData();

export { indoorBikeData };

