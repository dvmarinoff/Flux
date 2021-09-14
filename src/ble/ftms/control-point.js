import { hex }  from '../../utils.js';

// 00 - reserved for future use
// 01 - success
// 02 - not supported
// 03 - invalid parameter
// 04 - operation fail
// 05 - control not permitted
// 06 - reserved for future use
//
// 0xFF on fitness machine status - control permission lost
// 128 - 0b10000000, 8 bit is 1
//
// 0x80 - operation code - status code
// 128-0-1
// 128-5-3
// 128-5-1

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

function controlPointResponseDecoder(dataview) {

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

function powerTarget(power) {
    let OpCode = 0x05;
    let buffer = new ArrayBuffer(3);
    let view   = new DataView(buffer);
    view.setUint8(0, 0x05, true);
    view.setInt16(1, power, true);

    return view;
}

function simulationParameters(args) {
    const OpCode = 0x11;
    const windResolution  = 1000;
    const gradeResolution = 100;
    const crrResolution   = 10000;
    const dragResolution  = 100;
    const wind  = args.wind  * windResolution  || 0; // mps      - 0.001
    const grade = args.grade * gradeResolution || 0; // %        - 0.01
    const crr   = args.crr   * crrResolution   || 0; // unitless - 0.0001
    const drag  = args.drag  * dragResolution  || 0; // kg/m     - 0.01

    let buffer = new ArrayBuffer(7);
    let view   = new DataView(buffer);
    view.setUint8(0, OpCode, true);
    view.setInt16(1, wind,  true);
    view.setInt16(3, grade, true);
    view.setUint8(5, crr,   true);
    view.setUint8(6, drag,  true);

    console.log(`:simulation {:wind ${wind} :grade ${grade} :crr ${crr} :drag ${drag}}`);

    return view;
}

function slopeTarget(slope) {
    return simulationParameters({grade: slope});
}

function resistanceTarget(resistance) {
    const OpCode = 0x04;
    const resolution = 1; // 10
    resistance = resistance * resolution;

    let buffer   = new ArrayBuffer(3);
    let view     = new DataView(buffer);
    view.setUint8(0, OpCode, true);
    // view.setUint8(1, resistance, true); // by Spec
    view.setInt16(1, resistance, true); // works with Tacx

    return view;
}

function requestControl() {
    const OpCode = 0x00;
    let buffer   = new ArrayBuffer(1);
    let view     = new DataView(buffer);
    view.setUint8(0, OpCode, true);

    return view;
}

export {
    powerTarget,
    resistanceTarget,
    slopeTarget,
    simulationParameters,
    requestControl,
    controlPointResponseDecoder
};
