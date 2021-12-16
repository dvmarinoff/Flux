//
// 4.13 Supported Resistance Level Range (characteristic)
// 4.14 Supported Power Range (characteristic)
//

import { existance }  from '../../functions.js';

function supportedResistanceLevelRange(dataview) {
    // (0x) 00-00-E8-03-01-00
    let min = dataview.getUint16(0, dataview, true);
    let max = dataview.getUint16(2, dataview, true);
    let inc = dataview.getUint16(4, dataview, true);

    return { min, max, inc };
}

function PowerRange() {
    const length = 6;

    function encode(args = {}) {
        const min = existance(args.min);
        const max = existance(args.max);
        const inc = existance(args.inc);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint16(0, min, true);
        view.setUint16(2, max, true);
        view.setUint16(4, inc, true);

        return view.buffer;
    }

    function decode(dataview) {
        // (0x) 00-00-20-03-01-00
        // (10) [0, 0, 32, 3, 1, 0]
        // 0, 800, 1
        const min = dataview.getUint16(0, dataview, true);
        const max = dataview.getUint16(2, dataview, true);
        const inc = dataview.getUint16(4, dataview, true);

        return { min, max, inc };
    }

    return Object.freeze({
        length,
        encode,
        decode
    });
}

function ResistanceRange() {
    const length = 6;

    function encode(args = {}) {
        const min = existance(args.min);
        const max = existance(args.max);
        const inc = existance(args.inc);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint16(0, min, true);
        view.setUint16(2, max, true);
        view.setUint16(4, inc, true);

        return view.buffer;
    }

    function decode(dataview) {
        // (0x) 00-00-E8-03-01-00
        // (10) [0, 0, 232, 3, 1, 0]
        // 0, 1000, 1
        const min = dataview.getUint16(0, dataview, true);
        const max = dataview.getUint16(2, dataview, true);
        const inc = dataview.getUint16(4, dataview, true);

        return { min, max, inc };
    }

    return Object.freeze({
        length,
        encode,
        decode
    });
}

const supported = {
    powerRange:      PowerRange(),
    resistanceRange: ResistanceRange(),
};

export {
    supported
};
