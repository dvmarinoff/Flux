import { stringToHex,
         hexToString,
         hex,
         dataViewToString,
         getBitField,
         toBool, }  from '../functions.js';

const controlPointResults = {
    '0x01': {definition: 'success',          msg: 'success'},
    '0x02': {definition: 'notSupported',     msg: 'not supported'},
    '0x03': {definition: 'invalidParameter', msg: 'invalid parameter'},
    '0x04': {definition: 'operationFail',    msg: 'operation fail'},
    '0x05': {definition: 'notPermitted',     msg: 'not permitted'},
};

const controlPointOperations = {
    '0x00': {param: false,
             definition: 'requestControl',
             msg: 'request control'},
    '0x01': {param: false,
             definition: 'reset',
             msg: 'reset'},
    '0x04': {param: {resistance: 'Uint8'},
             definition: 'setTargetResistanceLevel',
             msg: 'set target resistance'},
    '0x05': {param: {power: 'Int16'},
             definition: 'setTargetPower',
             msg: 'set target power'},
    '0x11': {param: {wind: 'Int16', grade: 'Int16', crr: 'Uint8', cw: 'Uint8'},
             definition: 'setIndoorBikeSimulationParameters',
             msg: 'set indoor bike simulation'},
    '0x13': {param: {speedLow: 'Uint16', speedHigh: 'Uint16'},
             definition: 'spinDownControl',
             msg: 'Spin Down Control'},
};

const fitnessMachineStatusCodes = {
    '0x00': {param: false, msg: 'Reserved for Future Use'},
    '0x01': {param: false, msg: 'Reset'},
    '0x02': {param: false, msg: 'Fitness Machine Stopped or Paused by the User'},
    '0x03': {param: false, msg: 'Fitness Machine Stopped by Safety Key'},
    '0x04': {param: false, msg: 'Fitness Machine Started or Resumed by the User'},
    '0x07': {param: {resistance: 'Uint8'},
             msg: 'Target Resistance Level Changed'},
    '0x08': {param: {power: 'Int16'},
             msg: 'Target Power Changed'},
    '0x12': {param: {wind: 'Int16', grade: 'Int16', crr: 'Uint8', cw: 'Uint8'},
             msg: 'Indoor Bike Simulation Parameters Changed'},
    '0x14': {param: '', msg: 'Spin Down Status'},
    '0xFF': {param: '', msg: 'Control Permission Lost'},
};

let targetSettingFeatures =
[
    {key: 'Speed',                          flagBit:  0, supported: false, msg: 'Speed'},
    {key: 'Inclination',                    flagBit:  1, supported: false, msg: 'Inclination'},
    {key: 'Resistance',                     flagBit:  2, supported: false, msg: 'Resistance'},
    {key: 'Power',                          flagBit:  3, supported: false, msg: 'Power'},
    {key: 'HeartRate',                      flagBit:  4, supported: false, msg: 'Heart Rate'},
    {key: 'ExpendedEnergy',                 flagBit:  5, supported: false, msg: 'Expended Energy'},
    {key: 'StepNumber',                     flagBit:  6, supported: false, msg: 'Step Number'},
    {key: 'StrideNumber',                   flagBit:  7, supported: false, msg: 'Stride Number'},
    {key: 'Distance',                       flagBit:  8, supported: false, msg: 'Distance'},
    {key: 'TrainingTime',                   flagBit:  9, supported: false, msg: 'Training Time'},
    {key: 'TimeInTwoHeartRateZones',        flagBit: 10, supported: false, msg: 'Time In Two Heart Rate Zones'},
    {key: 'TimeInThreeHeartRateZones',      flagBit: 11, supported: false, msg: 'Time In Three Heart Rate Zones'},
    {key: 'TimeInFiveHeartRateZones',       flagBit: 12, supported: false, msg: 'Time In Five Heart Rate Zones'},
    {key: 'IndoorBikeSimulationParameters', flagBit: 13, supported: false, msg: 'Indoor Bike Simulation (Grade %)'},
    {key: 'WheelCircumference',             flagBit: 14, supported: false, msg: 'Wheel Circumference'},
    {key: 'SpinDownControl',                flagBit: 15, supported: false, msg: 'Spin Down'},
    {key: 'Cadence',                        flagBit: 16, supported: false, msg: 'Cadence'},
    // bit 17-31 reserved for future use
];

let fitnessMachineFeatures =
[
    {key: 'AverageSpeed',              flagBit:  0, supported: false, msg: 'Average Speed'},
    {key: 'Cadence',                   flagBit:  1, supported: false, msg: 'Cadence'},
    {key: 'TotalDistance',             flagBit:  2, supported: false, msg: 'Total Distance'},
    {key: 'Inclination',               flagBit:  3, supported: false, msg: 'Inclination'},
    {key: 'ElevationGain',             flagBit:  4, supported: false, msg: 'Elevation Gain'},
    {key: 'Pace',                      flagBit:  5, supported: false, msg: 'Pace'},
    {key: 'StepCount',                 flagBit:  6, supported: false, msg: 'Step Count'},
    {key: 'ResistanceLevel',           flagBit:  7, supported: false, msg: 'Resistance Level'},
    {key: 'StrideCount',               flagBit:  8, supported: false, msg: 'Stride Count'},
    {key: 'ExpendedEnergy',            flagBit:  9, supported: false, msg: 'Expended Energy'},
    {key: 'HeartRateMeasurement',      flagBit: 10, supported: false, msg: 'Heart Rate Measurement'},
    {key: 'MetabolicEquivalent',       flagBit: 11, supported: false, msg: 'Metabolic Equivalent'},
    {key: 'ElapsedTime',               flagBit: 12, supported: false, msg: 'Elapsed Time'},
    {key: 'RemainingTime',             flagBit: 13, supported: false, msg: 'Remaining Time'},
    {key: 'PowerMeasurement',          flagBit: 14, supported: false, msg: 'Power Measurement'},
    {key: 'ForceOnBeltAndPowerOutput', flagBit: 15, supported: false, msg: 'Force On Belt And Power Output'},
    {key: 'UserDataRetention',         flagBit: 16, supported: false, msg: 'User DataRetention'},
    // bit 17-31 reserved for future use
];

let indoorBikeDataFlags =
[
    {key: 'MoreData',             flagBit:  0, present: false}, // 0 present,
    {key: 'AverageSpeed',         flagBit:  1, present: false}, // 1 present,
    {key: 'InstantaneousCadence', flagBit:  2, present: false}, // 0 present,
    {key: 'AverageCandence',      flagBit:  3, present: false}, // 1 present,
    {key: 'TotalDistance',        flagBit:  4, present: false}, // 1 present,
    {key: 'ResistanceLevel',      flagBit:  5, present: false}, // 1 present,
    {key: 'InstantaneousPower',   flagBit:  6, present: false}, // 1 present,
    {key: 'AveragePower',         flagBit:  7, present: false}, // 1 present,
    {key: 'ExpendedEnergy',       flagBit:  8, present: false}, // 1 present,
    {key: 'HeartRate',            flagBit:  9, present: false}, // 1 present,
    {key: 'MetabolicEquivalent',  flagBit: 10, present: false}, // 1 present,
    {key: 'ElapsedTime',          flagBit: 11, present: false}, // 1 present,
    {key: 'RemainingTime',        flagBit: 12, present: false}  // 1 present,
];

function setSupportFeatures(dataview) {
    let featureFlags       = dataview.getUint32(0, true); // 0-31 flags
    let targetSettingFlags = dataview.getUint32(4, true); // 0-31 flags
    let read = (xs, i) => toBool(getBitField(xs, i));

    fitnessMachineFeatures.forEach(feature => {
        feature.supported = read(featureFlags, feature.flagBit);
    });

    targetSettingFeatures.forEach(feature => {
        feature.supported = read(targetSettingFlags, feature.flagBit);
    });

    return {fitnessMachineFeatures: fitnessMachineFeatures,
            targetSettingFeatures:  targetSettingFeatures};
}

function dataviewToFitnessMachineFeature(dataview) {
    // (0x) 82-40-00-00-0C-A0-00-00
    let featureFlags       = dataview.getUint32(0, true); // 0-31 flags
    let targetSettingFlags = dataview.getUint32(4, true); // 0-31 flags
    let read = (xs, i) => toBool(getBitField(xs, i));

    fitnessMachineFeatures.forEach(feature => {
        feature.supported = read(featureFlags, feature.flagBit);
    });

    targetSettingFeatures.forEach(feature => {
        feature.supported = read(targetSettingFlags, feature.flagBit);
    });

    let readings  = fitnessMachineFeatures;
    let targets   = targetSettingFeatures;
    let supported = {readings: [], targets: []};

    supported.readings = readings.filter(feature => feature.supported);
    supported.targets  = targets.filter(feature => feature.supported);

    return supported;
}

function dataviewToSupportedResistanceLevelRange(dataview) {
    // (0x) 00-00-E8-03-01-00
    let min = dataview.getUint16(0, dataview, true);
    let max = dataview.getUint16(2, dataview, true);
    let inc = dataview.getUint16(4, dataview, true);

    return {min, max, inc};
}
function dataviewToSupportedPowerRange(dataview) {
    // (0x) 00-00-20-03-01-00
    let min = dataview.getUint16(0, dataview, true);
    let max = dataview.getUint16(2, dataview, true);
    let inc = dataview.getUint16(4, dataview, true);

    return {min, max, inc};
}

function dataviewToFitnessMachineStatus(dataview) {
    // ?
    let status = dataview.getUint8(0, dataview, true);
    let msg    = fitnessMachineStatusCodes[hex(status)].msg;

    return {status, msg};
}

let hr             = dataview => dataview.getUint8(1, true);
let requestControl = _        => new Uint8Array([0x00]);
let setTargetPower = value    => new Uint8Array([0x05,0xe6]);

function dataviewToIndoorBikeData(dataview) {
    const speedDiv    = 100;
    const cadenceDiv  = 2;
    const flags       = dataview =>  dataview.getUint16(0, true);
    const instSpeed   = dataview => (dataview.getUint16(2, true) / speedDiv);
    const instCadence = dataview => (dataview.getUint16(4, true) / cadenceDiv);
    const instPower   = dataview =>  dataview.getUint16(6, true);

    let data = {
        flags: flags(dataview),
        pwr:   instPower(dataview),
        spd:   instSpeed(dataview),
        cad:   instCadence(dataview),
    };

    return data;
}

function dataviewToIndoorBikeDataFlags(dataview) {
    const flags = dataview.getUint16(0, true);
    const read  = (xs, i) => toBool(getBitField(xs, i));

    indoorBikeDataFlags.forEach(flag => {
        if(flag.flagBit === 0 || flag.flagBit || 2) {
            flag.present = !read(flags, flag.flagBit);
        }
        flag.present = read(flags, flag.flagBit);
    });

    let present = indoorBikeDataFlags.filter(flag => flag.present);

    return present;
}

function dataviewToControlPointResponse(dataview) {
    // 00 - reserved for future use
    // 01 - success
    // 02 - not supported
    // 03 - invalid parameter
    // 04 - operation fail
    // 05 - control not permitted
    // 06 - reserved for future use

    // 0xFF on fitness machine status - control permission lost
    // 128 - 0b10000000, 8 bit is 1

    // 0x80 - operation code - status code
    // 128-0-1
    // 128-5-3
    // 128-5-1

    let res = {
        responseCode: dataview.getUint8(0, true),
        requestCode:  dataview.getUint8(1, true),
        resultCode:   dataview.getUint8(2, true)
    };

    res.response  = hex(res.responseCode) || '';
    res.operation = controlPointOperations[hex(res.requestCode)].msg || '';
    res.result    = controlPointResults[hex(res.resultCode)].msg || '';

    return res;
}

let ftms = {
    dataviewToFitnessMachineFeature,
    dataviewToSupportedResistanceLevelRange,
    dataviewToSupportedPowerRange,
    dataviewToFitnessMachineStatus,
    dataviewToIndoorBikeData,
    dataviewToControlPointResponse,
    setSupportFeatures,
};

export { ftms };
