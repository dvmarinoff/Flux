//
// 4.16 Fitness Machine Control Point (characteristic)
//

import { fixInRange, hex }  from '../../utils.js';
import {  existance, curry2 }  from '../../functions.js';

const logs = true;

function log(msg) {
    if(logs) {
        console.log(msg);
    }
}

function Data(args = {}) {
    const definitions = existance(args.definitions);

    const applyResolution = curry2((prop, value) => {
        return value / definitions[prop].resolution;
    });

    const removeResolution = curry2((prop, value) => {
        return value * definitions[prop].resolution;
    });

    function encodeField(prop, input, transform = applyResolution(prop)) {
        const fallback = definitions[prop].default;
        const min      = applyResolution(definitions[prop].min);
        const max      = applyResolution(prop, definitions[prop].max);
        const value    = existance(input, fallback);

        return Math.floor(fixInRange(min, max, transform(value)));
    }

    function decodeField(prop, input, transform = removeResolution) {
        return transform(prop, input);
    }

    return {
        definitions,
        applyResolution,
        removeResolution,
        encodeField,
        decodeField,
    };
}

function PowerTarget(power) {
    const opCode = 0x05;
    const length = 3;

    const definitions = {
        power: {resolution: 1, unit: 'W', size: 2, min: 0, max: 65534, default: 0},
    };

    const data = Data({definitions});

    function encode(args = {}) {
        const power = data.encodeField('power', args.power);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8(0, opCode, true);
        view.setInt16(1, power, true);

        log(`:tx :ftms :power ${power}`);

        return view.buffer;
    }

    function decode(dataview) {
        const opCode = dataview.getUint8(0);
        const power  = data.decodeField('power', dataview.getInt16(1, true));

        return {
            power,
        };
    }

    return Object.freeze({
        opCode,
        length,
        definitions,
        encode,
        decode,
    });
}

function ResistanceTarget() {
    const opCode = 0x04;
    const length = 3; // 3

    const definitions = {
        resistance: {resolution: 0.1, unit: '', size: 2, min: -100, max: 100, default: 0},
    };

    const data = Data({definitions});

    function encode(args = {}) {
        const resistance = data.encodeField('resistance', args.resistance);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8(0, opCode, true);
        view.setInt16(1, resistance, true);

        log(`:tx :ftms :resistance ${args.resistance} -> ${resistance}`);

        return view;
    }

    function decode(dataview) {
        const opCode     = dataview.getUint8(0);
        const resistance = data.decodeField('resistance', dataview.getInt16(1, true));

        return {
            resistance,
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

function SimulationParameters(args) {
    const opCode = 0x11;
    const length = 7;

    // 4 -> 14.4, 6 -> 21.6 km/h, 8 -> 28.8, 10 -> 36
    const definitions = {
        windSpeed:      {resolution: 0.001,  unit: 'mps',  size: 2, min: -35.56, max: 35.56,  default: 4}, // 0,
        grade:          {resolution: 0.01,   unit: '%',    size: 2, min: -40,    max: 40,     default: 0},
        crr:            {resolution: 0.0001, unit: '',     size: 1, min: 0,      max: 0.0254, default: 0.004},
        windResistance: {resolution: 0.01,   unit: 'kg/m', size: 1, min: 0,      max: 1.86,   default: 0.51},
    };

    const data = Data({definitions});

    function encode(args = {}) {
        const windSpeed      = data.encodeField('windSpeed', args.windSpeed);
        const grade          = data.encodeField('grade', args.grade);
        const crr            = data.encodeField('crr', args.crr);
        const windResistance = data.encodeField('windResistance', args.windResistance);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, opCode, true);
        view.setInt16(1, windSpeed, true);
        view.setInt16(3, grade, true);
        view.setUint8(5, crr, true);
        view.setUint8(6, windResistance, true);

        log(`:tx :ftms :simulation {:windSpeed ${windSpeed} :grade ${grade} :crr ${crr} :windResistance ${windResistance}}`);

        return view.buffer;
    }

    function decode(dataview) {
        const opCode         = dataview.getUint8(0);
        const windSpeed      = data.decodeField('windSpeed', dataview.getUint16(1, true));
        const grade          = data.decodeField('grade', dataview.getInt16(3, true));
        const crr            = data.decodeField('crr', dataview.getInt8(5, true));
        const windResistance = data.decodeField('windResistance', dataview.getUint8(6, true));

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

function WheelCircumference(args) {
    const opCode = 0x12;
    const length = 3;

    const definitions = {
        circumference: {resolution: 0.1, unit: 'mm', min: 0, max: 6553.4, default: 2105}
    };

    const values = {
        2080: '700x19C', 2086: '700x20C', 2096: '700x23C', 2105: '700x25C', 2136: '700x28C',
	      2146: '700x30C', 2155: '700x32C', 2168: '700x35C', 2180: '700x38C',
        2200: '700x40C', 2242: '700x45C', 2268: '700x47C',
        2281: `29"x2.25"`, 2326: `29"x2.3"`, 2750: '',
    };

    // 700x25C -> 2105 -> [0x12, 0x3A, 0x52] -> [18, 58, 82]
    // 700x40C -> 2200 -> [0x12, 0xF0, 0x55] -> [18, 240, 85]
    // 700x47C -> 2268 -> [0x12, 0x98, 0x58] -> [18, 152, 88]
    // Max     -> 2750 -> [0x12, 0x6C, 0x6B] -> [18, 108, 107]

    const data = Data({definitions});

    function encode(args = {}) {
        const circumference = data.encodeField('circumference', args.circumference);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8( 0, opCode, true);
        view.setUint16(1, circumference, true);

        log(`:tx :ftms :wheelCircumference ${args.circumference} -> ${circumference}`);

        return view.buffer;
    }

    function decode(dataview) {
        const opCode        = dataview.getUint8(0);
        const circumference = data.decodeField('circumference', dataview.getUint16(1, true));

        log(`:rx :ftms :wheelCircumference ${circumference}`);

        return {
            circumference,
        };
    }

    return Object.freeze({
        opCode,
        length,
        definitions,
        values,
        encode,
        decode,
    });
}

function Reset() {
    const opCode = 0x01;
    const length = 1;

    function encode() {
        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, opCode, true);

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

function RequestControl() {
    const opCode = 0x00;
    const length = 1;

    function encode() {
        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, opCode, true);

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
    };

    const requests = {
        '0x00': {definition: 'requestControl', msg: 'request control'},
        '0x01': {definition: 'reset', msg: 'reset'},
        '0x04': {definition: 'setTargetResistanceLevel', msg: 'set target resistance'},
        '0x05': {definition: 'setTargetPower', msg: 'set target power'},
        '0x11': {definition: 'setIndoorBikeSimulationParameters', msg: 'set indoor bike simulation'},
        '0x13': {definition: 'spinDownControl', msg: 'Spin Down Control'},
    };

    function encode(value) {
    }

    function decode(dataview) {
        const opCode      = dataview.getUint8(0, true);
        const requestCode = dataview.getUint8(1, true);
        const resultCode  = dataview.getUint8(2, true);

        return {
            opCode,
            requestCode,
            resultCode,
        };
    }

    function toString(decoded = {}) {
        const opCode  = hex(decoded.opCode);
        const request = requests[hex(decoded.requestCode)].msg;
        const result  = results[hex(decoded.resultCode)].msg;
        const str = `${request} - ${result}`;

        log(`:rx :ftms :response '${str}'`);

        return str;
    }

    return Object.freeze({
        results,
        requests,
        encode,
        decode,
        toString,
    });
}

const control = {
    powerTarget:          PowerTarget(),
    resistanceTarget:     ResistanceTarget(),
    simulationParameters: SimulationParameters(),
    wheelCircumference:   WheelCircumference(),
    requestControl:       RequestControl(),
    response:             Response(),
    reset:                Reset(),
};

export {
    control,
};

