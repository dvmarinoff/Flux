import { equals } from '../../functions.js';
import { hex } from '../../utils.js';

const fitnessMachineStatusCodes = {
    '0x00': {param: false, msg: 'Reserved for Future Use'},
    '0x01': {param: false, msg: 'Reset'},
    '0x02': {param: false, msg: 'Fitness Machine Stopped or Paused by the User'},
    '0x03': {param: false, msg: 'Fitness Machine Stopped by Safety Key'},
    '0x04': {param: false, msg: 'Fitness Machine Started or Resumed by the User'},
    '0x05': {param: true,  msg: 'Target Speed Changed'},
    '0x06': {param: true,  msg: 'Target Incline Changed'},
    '0x07': {param: true,  msg: 'Target Resistance Level Changed'},
    '0x08': {param: true,  msg: 'Target Power Changed'},
    '0x09': {param: true,  msg: 'Target Heart Rate Changed'},
    '0x0D': {param: true,  msg: 'Target Distance Changed'},
    '0x12': {param: true,  msg: 'Indoor Bike Simulation Parameters Changed'},
    '0x13': {param: true,  msg: 'Wheel Circumference Changed'},
    '0x14': {param: true,  msg: 'Spin Down Status'},
    '0x15': {param: true,  msg: 'Targeted Cadence Changed'},
    '0xFF': {param: false, msg: 'Control Permission Lost'},
};

const spinDownStatusValue = {
    '0x00': 'Reserved for Future Use',
    '0x01': 'Spin Down Requested',
    '0x02': 'Success',
    '0x03': 'Error',
    '0x04': 'Stop Pedaling'
};



function isTargetSpeed(statusCode) {
    return equals(statusCode, '0x05');
}
function isTargetIncline(statusCode) {
    return equals(statusCode, '0x06');
}
function isTargetResistance(statusCode) {
    return equals(statusCode, '0x07');
}
function isTargetPower(statusCode) {
    return equals(statusCode, '0x08');
}
function isTargetHeartRate(statusCode) {
    return equals(statusCode, '0x09');
}
function isTargetDistance(statusCode) {
    return equals(statusCode, '0x0D');
}
function isIndoorBikeSimulation(statusCode) {
    return equals(statusCode, '0x12');
}
function isWheelCircumference(statusCode) {
    return equals(statusCode, '0x13');
}
function isSpinDownStatus(statusCode) {
    return equals(statusCode, '0x14');
}
function isTargetCadence(statusCode) {
    return equals(statusCode, '0x15');
}
function isControlLost(statusCode) {
    return equals(statusCode, '0xFF');
}



function readTargetPower(dataview) {
    return dataview.getInt16(1, dataview, true);
}
function readTargetResistance(dataview) {
    const resolution = 0.1;
    return dataview.getUint8(1, dataview, true) * resolution;
}
function readIndootBikeSimulation(dataview) {
    const windResolution  = 0.001;
    const gradeResolution = 0.01;
    const crrResolution   = 0.0001;
    const dragResolution  = 0.01;
    const wind  = dataview.getInt16(1, dataview, true) * windResolution;
    const grade = dataview.getInt16(3, dataview, true) * gradeResolution;
    const crr   = dataview.getUint8(5, dataview, true) * crrResolution;
    const drag  = dataview.getUint8(6, dataview, true) * dragResolution;
    return  { wind, grade, crr, drag };
}
function readTargetIncline(dataview) {
    const resolution = 0.1;
    return dataview.getInt16(1, dataview, true) * resolution;
}
function readTargetSpeed(dataview) {
    const resolution = 0.01;
    return dataview.getUint16(1, dataview, true) * resolution;
}
function readTargetCadence(dataview) {
    const resolution = 0.05;
    return dataview.getUint16(1, dataview, true) * resolution;
}
function readTargetHeartRate(dataview) {
    return dataview.getUint8(1, dataview, true);
}
function readTargetDistance(dataview) {
    return dataview.getUint32(1, dataview, true);
}
function reedWheelCircumference(dataview) {
    const resolution = 0.1;
    return dataview.getUint16(1, dataview, true) * resolution;
}
function readSpinDownStatus(dataview) {
    const statusCode = dataview.getUnit8(1, dataview, true);
    return spinDownStatusValue[statusCode];
}
function readParam(dataview, code) {
    if(isTargetPower(code))          return readTargetPower(dataview);
    if(isTargetResistance(code))     return readTargetResistance(dataview);
    if(isIndoorBikeSimulation(code)) return readIndootBikeSimulation(dataview);
    if(isTargetSpeed(code))          return readTargetSpeed(dataview);
    if(isTargetDistance(code))       return readTargetDistance(dataview);
    if(isTargetCadence(code))        return readTargetCadence(dataview);
    if(isTargetHeartRate(code))      return readTargetHeartRate(dataview);
    if(isSpinDownStatus(code))       return readSpinDownStatus(dataview);
    return false;
}



function fitnessMachineStatusDecoder(dataview) {
    const statusCode = dataview.getUint8(0, dataview, true);
    const status = fitnessMachineStatusCodes[hex(statusCode)];
    const msg = status.msg;
    let value = false;

    if(status.param) {
        value = readParam(dataview, hex(statusCode));
    }

    return {statusCode, msg, value};
}

export { fitnessMachineStatusDecoder };
