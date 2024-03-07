//
// FTMS spec
// 4.16 Fitness Machine Control Point (characteristic)
//

import { Spec, hex, dataviewToArray, print, } from '../../functions.js';

function SimulationParameters(args) {
    const opCode = 0x11;
    const length = 7;

    // 2 m/s -> 7.20 km/h, 4 -> 14.4, 6 -> 21.6, 8 -> 28.8, 10 -> 36
    const definitions = {
        windSpeed:      {resolution: 0.001,  unit: 'mps',  size: 2, min: -35.56, max: 35.56,  default: 0.1}, // 2,
        grade:          {resolution: 0.01,   unit: '%',    size: 2, min: -40,    max: 40,     default: 0},
        crr:            {resolution: 0.0001, unit: '',     size: 1, min: 0,      max: 0.0254, default: 0.004},
        windResistance: {resolution: 0.01,   unit: 'kg/m', size: 1, min: 0,      max: 1.86,   default: 0.51},
    };

    const spec = Spec({definitions});

    function encode(args = {}) {
        const windSpeed      = spec.encodeField('windSpeed', args.windSpeed);
        const grade          = spec.encodeField('grade', args.grade);
        const crr            = spec.encodeField('crr', args.crr);
        const windResistance = spec.encodeField('windResistance', args.windResistance);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, opCode, true);
        view.setInt16(1, windSpeed, true);
        view.setInt16(3, grade, true);
        view.setUint8(5, crr, true);
        view.setUint8(6, windResistance, true);

        print.log(`tx: ftms: simulation: grade: ${grade}`);

        return view.buffer;
    }

    function decode(dataview) {
        const opCode         = dataview.getUint8(0);
        const windSpeed      = spec.decodeField('windSpeed', dataview.getUint16(1, true));
        const grade          = spec.decodeField('grade', dataview.getInt16(3, true));
        const crr            = spec.decodeField('crr', dataview.getInt8(5, true));
        const windResistance = spec.decodeField('windResistance', dataview.getUint8(6, true));

        return {
            windSpeed,
            grade,
            crr,
            windResistance
        };
    }

    return Object.freeze({
        opCode,
        length,
        definitions,
        encode,
        decode
    });
}

function PowerTarget() {
    const opCode = 0x05;
    const length = 3;

    const definitions = {
        power: {resolution: 1, unit: 'W', size: 2, min: 0, max: 65534, default: 0},
    };

    const spec = Spec({definitions});

    // {power: Int} -> ArrayBuffer
    function encode(args = {}) {
        const power = spec.encodeField('power', args.power);

        const view = new DataView(new ArrayBuffer(length));

        view.setUint8( 0, opCode, true);
        view.setUint16(1, power,  true);

        print.log(`tx: ftms: powerTarget: ${power}`);

        return view.buffer;
    }

    return Object.freeze({
        opCode,
        length,
        definitions,
        encode,
    });
}

function RequestControl() {
    const opCode = 0x00;
    const length = 1;

    function encode() {
        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, opCode, true);

        print.log(`rx: ftms: request-control:'`);

        return view.buffer;
    }

    function decode(dataview) {
        const opCode = dataview.getUint8(0);
        return { opCode };
    }

    return Object.freeze({
        opCode,
        length,
        encode,
        decode
    });
}

function Response() {
    const opCode = 0x80;

    // Format:
    // response code - request code - result code
    // 128-0-1
    // 128-5-3
    // 128-5-1
    //
    // 128 (0x80) | request control  | success
    // 128 (0x80) | set target power | invalid parameter
    // 128 (0x80) | set target power | success

    const results = {
        '0x01': {definition: 'success',          msg: 'success'},
        '0x02': {definition: 'notSupported',     msg: 'not supported'},
        '0x03': {definition: 'invalidParameter', msg: 'invalid parameter'},
        '0x04': {definition: 'operationFail',    msg: 'operation fail'},
        '0x05': {definition: 'notPermitted',     msg: 'not permitted'},
        '0xFF': {definition: 'unknownError',     msg: 'unknown error'},
    };

    const requests = {
        '0x00': {definition: 'requestControl', msg: 'request control'},
        '0x01': {definition: 'reset', msg: 'reset'},
        '0x04': {definition: 'setTargetResistanceLevel', msg: 'set target resistance'},
        '0x05': {definition: 'setTargetPower', msg: 'set target power'},
        '0x11': {definition: 'setIndoorBikeSimulationParameters', msg: 'set indoor bike simulation'},
        '0x13': {definition: 'spinDownControl', msg: 'Spin Down Control'},
        '0xFF': {definition: 'unknown', msg: 'unknown request'}
    };

    function encode(value) {
        throw 'Not implemented!';
    }

    function decode(dataview) {
        const opCode      = dataview.getUint8(0, true) ?? opCode;
        const requestCode = dataview.getUint8(1, true) ?? 0xFF;
        const resultCode  = dataview.getUint8(2, true) ?? 0xFF;

        // const raw = dataviewToArray(dataview).slice(dataview.byteOffset);
        const request = requests[hex(requestCode)]?.definition ?? '';
        const result = results[hex(resultCode)]?.msg ?? '';

        print.log(`rx: ftms: status: ${result} request: ${request}`);

        return {
            opCode,
            requestCode,
            resultCode,
        };
    }

    return Object.freeze({
        opCode,
        results,
        requests,
        encode,
        decode,
    });
}

const control = {
    simulationParameters: SimulationParameters(),
    powerTarget:          PowerTarget(),
    requestControl:       RequestControl(),
    response:             Response(),
};

export {
    control,
};

