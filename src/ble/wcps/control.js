import { uuids } from '../uuids.js';
import { Spec } from '../common.js';
import { existance, dataviewToArray } from '../../functions.js';

function PowerTarget() {
    // set ERG mode
    const opCode = 0x42; // 66
    const length = 3;

    function encode(args = {}) {
        // [0x42, 0xC8, 0x00]
        // [66, 200, 0]
        const power = existance(args.power);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, opCode, true);
        view.setUint16(1, power,  true);

        return view.buffer;
    }

    function decode(dataview) {
        const opCode = dataview.getUint8(0, true);
        const power  = dataview.getUint16(1, true);

        return { power };
    }

    return Object.freeze({
        opCode,
        length,
        encode,
        decode
    });
}

function SlopeTarget() {
    // set Sim Grade
    const opCode = 0x42; // 66
    const length = 3;


    // ????
    // let norm = UInt16((min(1, max(-1, grade)) + 1.0) * 65535 / 2.0)

    const definitions = {
        grade: {resolution: 0.01, unit: '%', size: 2, min: -40, max: 40, default: 0},
    };

    const spec = Spec({definitions});

    function encode(args = {}) {
        // [0x]
        const grade = spec.encodeField('grade', args.grade);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, opCode, true);
        view.setUint16(1, grade,  true);

        return view.buffer;
    }

    function decode(dataview) {
        const opCode = dataview.getUint8(0, true);
        const grade  = dataview.getUint16(1, true);

        return { opCode, grade };
    }

    return Object.freeze({
        opCode,
        length,
        encode,
        decode
    });
}

function SIM() {
    const opCode = 0x43; // 67
    const length = 7;

    const definitions = {
        weight: {
            resolution: 1, unit: 'kg', size: 2, min: 0, max: 65535, default: 75
        },
        crr: {
            resolution: 0.0001, unit: '', size: 2, min: 0, max: 65535, default: 0.004
        },
        windResistance: {
            resolution: 0.01, unit: 'kg/m', size: 2, min: 0, max: 1.86, default: 0.51
        },
    };

    const spec = Spec({definitions});

    function encode(args = {}) {
        // [0x]
        const weight         = spec.encodeField('weight', args.weight);
        const crr            = spec.encodeField('crr', args.crr);
        const windResistance = spec.encodeField('windResistance', args.windResistance);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, opCode,         true);
        view.setUint16(1, weight,         true);
        view.setUint16(3, crr,            true);
        view.setUint16(5, windResistance, true);

        return view.buffer;
    }

    function decode(dataview) {
        const opCode         = dataview.getUint8(0, true);
        const weight         = spec.decodeField('weight', dataview.getUint16(1, true));
        const crr            = spec.decodeField('crr', dataview.getUint16(1, true));
        const windResistance = spec.decodeField('windResistance', dataview.getUint16(1, true));

        return { opCode, weight, crr, windResistance };
    }

    return Object.freeze({
        opCode,
        length,
        encode,
        decode
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
    const opCode = 0x80;

    // Format:
    // ?

    const results = {
        '0x01': {definition: '', msg: ''},
    };

    const requests = {
        '0x00': {definition: '', msg: ''},
    };

    function encode(value) {
    }

    function decode(dataview) {
        const res = dataviewToArray(dataview);
        console.log(`:rx :wcps :response ${res}`);
        return res;
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
    powerTarget:    PowerTarget(),
    slopeTarget:    SlopeTarget(),
    sim:            SIM(),
    requestControl: RequestControl(),
    response:       Response(),
};

export { control };

