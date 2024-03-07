import { equals, exists, Spec, hex, dataviewToArray } from '../../functions.js';

function Grade() {
    // set Sim Grade
    const opCode = 0x46; // 70
    const length = 3;

    // Format ????
    // let norm = UInt16((min(1, max(-1, grade)) + 1.0) * 65535 / 2.0)
    // int value = (gradient / 100.0 + 1.0) * 32768;
    // Math.min(1, Math.max(-1, grade) + 1) * 32768

    const definitions = {
        grade: {
            resolution: 1,
            unit: '%',
            size: 2,
            min: applyOffset(-100),
            max: applyOffset(100),
            default: applyOffset(0)
        },
    };

    const spec = Spec({definitions});

    function applyOffset(value) {
        return (value / 100 + 1) * 32768;
    }

    function removeOffset(prop, value) {
        return format((((value / 32768) - 1) * 100), 10);
    }

    function encode(args = {}) {
        const grade = spec.encodeField('grade', args.grade, applyOffset);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, opCode, true);
        view.setUint16(1, grade,  true);

        console.log(`${Date.now()} :tx :wcps :grade ${grade}`);

        return view.buffer;
    }

    function decode(dataview) {
        const opCode = dataview.getUint8(0, true);
        const grade  = spec.decodeField('grade', dataview.getUint16(1, true), removeOffset);

        return { grade };
    }

    return Object.freeze({
        opCode,
        length,
        definitions,
        encode,
        decode
    });
}

function WindSpeed() {
    // set Wind Speed
    const opCode = 0x47; // 71
    const length = 3;

    // Format ????
    // int value = (int)((windSpeed + 32.768) * 1000.0);

    const definitions = {
        windSpeed: {
            resolution: 1,
            unit: 'mps',
            size: 2,
            min: applyOffset(-35.56),
            max: applyOffset(35.56),
            default: applyOffset(0)
        },
    };

    const spec = Spec({definitions});

    function applyOffset(value) {
        return (value + 32.768) * 1000;
    }

    function removeOffset(prop, value) {
        return format(((value / 1000) - 32.768), 100);
    }

    function encode(args = {}) {
        const windSpeed = spec.encodeField('windSpeed', args.windSpeed, applyOffset);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, opCode, true);
        view.setUint16(1, windSpeed, true);

        console.log(`${Date.now()} :tx :wcps :windSpeed ${windSpeed}`);

        return view.buffer;
    }

    function decode(dataview) {
        const opCode = dataview.getUint8(0, true);
        const windSpeed = spec.decodeField('windSpeed', dataview.getUint16(1, true), removeOffset);

        return { windSpeed };
    }

    return Object.freeze({
        opCode,
        length,
        definitions,
        encode,
        decode
    });
}

function SIM() {
    const opCode = 0x43; // 67
    const length = 7;

    const definitions = {
        weight: {
            resolution: 0.01, unit: 'kg', size: 2, min: 0, max: 655.35, default: 75
        },
        crr: {
            resolution: 0.0001, unit: '', size: 2, min: 0, max: 6.5535, default: 0.004
        },
        windResistance: {
            resolution: 0.001, unit: 'kg/m', size: 2, min: 0, max: 65.535, default: 0.51
        },
    };

    const spec = Spec({definitions});

    function encode(args = {}) {
        const weight         = spec.encodeField('weight', args.weight);
        const crr            = spec.encodeField('crr', args.crr);
        const windResistance = spec.encodeField('windResistance', args.windResistance);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, opCode,         true);
        view.setUint16(1, weight,         true);
        view.setUint16(3, crr,            true);
        view.setUint16(5, windResistance, true);

        console.log(`${Date.now()} :tx :wcps :sim ${weight}, ${crr}, ${windResistance}`);

        return view.buffer;
    }

    function decode(dataview) {
        const opCode         = dataview.getUint8(0, true);
        const weight         = spec.decodeField('weight', dataview.getUint16(1, true));
        const crr            = spec.decodeField('crr', dataview.getUint16(3, true));
        const windResistance = spec.decodeField('windResistance', dataview.getUint16(5, true));

        return { weight, crr, windResistance };
    }

    return Object.freeze({
        opCode,
        length,
        definitions,
        encode,
        decode
    });
}

function WheelCircumference() {
    // set Wind Speed
    const opCode = 0x48; // 72
    const length = 3;

    // Format ????
    // int value = (int)(wheelSize * 10.0);

    const definitions = {
        circumference: {
            resolution: 0.1,
            unit: 'mm',
            size: 2,
            min: 0,
            max: 6553.4,
            default: 2136,
        },
    };

    const spec = Spec({definitions});

    function encode(args = {}) {
        const circumference = spec.encodeField('circumference', args.circumference);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, opCode, true);
        view.setUint16(1, circumference, true);

        console.log(`${Date.now()} :tx :wcps :circumference ${circumference}`);

        return view.buffer;
    }

    function decode(dataview) {
        const opCode = dataview.getUint8(0, true);
        const circumference = spec.decodeField('circumference', dataview.getUint16(1, true));

        return { circumference };
    }

    return Object.freeze({
        opCode,
        length,
        definitions,
        encode,
        decode
    });
}

function SetERG() {
    const opCode = 0x42;
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
        view.setUint16(0, power,  true);

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
    const opCode = 0x20; // 32
    const length = 3;
    const unlockCode = [0xEE, 0xFC];

    function encode() {
        // [0x20, 0xEE, 0xFC]
        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);
        view.setUint8(0, opCode,        true);
        view.setUint8(1, unlockCode[0], true);
        view.setUint8(2, unlockCode[1], true);

        return view.buffer;
    }

    function decode(dataview) {
        const opCode = dataview.getUint8(0, true);
        const unlockCode = [
            dataview.getUint8(1, true),
            dataview.getUint8(2, true),
        ];
        return { opCode, unlockCode };
    }

    return Object.freeze({
        opCode,
        length,
        encode,
        decode
    });
}

function Response() {
    // Format:
    //
    // Example 1:
    // msg:      [66, 50, 0],
    // response: [1, 66, 1, 0, 50, 0]
    //
    // status - op code - ? - value
    // 1        66        1   50
    //
    // 0b01 status === success
    //
    // Example 2:
    // msg:      [32],
    // response: [1, 32, 2]
    //
    // status - op code - ?
    // 1        32        2
    //
    // Responses:
    // [   1,   67,    1,    0], setSimMode success
    // [0x01, 0x43, 0x01, 0x00],
    //
    // [   1,   70,    1,    0,    0,  128], setSlopeTarget success
    // [0x01, 0x46, 0x01, 0x00, 0x00, 0x80],
    //

    const results = {
        '1': {definition: 'success', msg: 'success'},
        '0': {definition: 'fail',    msg: 'fail'},    // maybe just a guess
    };

    const requests = {
        '0x20': {definition: 'unlock', msg: 'unlock'},                           // 32
        '0x40': {definition: 'setResistanceTarget', msg: 'setResistanceTarget'}, // 64
        '0x41': {definition: 'setStandardMode', msg: 'setStandardMode'},         // 65
        '0x42': {definition: 'setPowerTarget', msg: 'setPowerTarget'},           // 66
        '0x43': {definition: 'setSimMode', msg: 'setSimMode'},                   // 67
        '0x44': {definition: 'setCrr', msg: 'setCrr'},                           // 68
        '0x45': {definition: 'setWindResistance', msg: 'setWindResistance'},     // 69
        '0x46': {definition: 'setSlopeTarget', msg: 'setSlopeTarget'},           // 70
        '0x47': {definition: 'setWindSpeed', msg: 'setWindSpeed'},               // 71
        '0x48': {definition: 'setWheelCircumference', msg: 'setWheelCircumference'}, // 72
    };

    function decodeStatus(value) {
        if(equals(value, 0)) return 'fail';
        if(equals(value, 1)) return 'success';
        return ':unknown';
    }
    function decodeRequest(value) {
        const hexValue = hex(value);
        if(exists(requests[hexValue])) {
            return requests[hexValue]?.msg ?? '';
        }
        return ':unknown';
    }

    function encode(value) {
    }

    function decode(dataview) {
        const raw = dataviewToArray(dataview).slice(dataview.byteOffset);
        const res = {};

        res.status  = decodeStatus(dataview.getUint8(0, true));
        res.request = decodeRequest(dataview.getUint8(1, true));

        if(dataview.byteLength > 5) {
            res.value = dataview.getUint16(4, true);
        }

        console.log(`${Date.now()} :rx :wcps :status ${res.status} :request ${res.request} ${raw}`);

        return res;
    }

    return Object.freeze({
        results,
        requests,
        encode,
        decode,
    });
}

function format(v) {
    v.avg = Math.floor(v.avg);
    return v;
}

const control = {
    grade:              Grade(),
    windSpeed:          WindSpeed(),
    sim:                SIM(),
    wheelCircumference: WheelCircumference(),
    setERG:             SetERG(),
    requestControl:     RequestControl(),
    response:           Response(),
};

export {
    control,
};

