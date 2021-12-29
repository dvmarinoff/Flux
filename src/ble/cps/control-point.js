import { existance, dataviewToArray }  from '../../functions.js';

const logs = true;

function log(msg) {
    if(logs) {
        console.log(msg);
    }
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
    // Format:
    // ?

    const results = {
        '0x01': {definition: 'success',          msg: 'success'},
        '0x02': {definition: 'notSupported',     msg: 'not supported'},
        '0x03': {definition: 'invalidParameter', msg: 'invalid parameter'},
        '0x04': {definition: 'operationFail',    msg: 'operation fail'},
        '0x05': {definition: 'notPermitted',     msg: 'not permitted'},
    };

    function encode(value) {
    }

    function decode(dataview) {
        return dataviewToArray(dataview);
    }

    function toString(decoded = {}) {
        const str = decoded.join(', ');

        log(`:rx :cps :response '${str}'`);

        return str;
    }

    return Object.freeze({
        results,
        encode,
        decode,
        toString,
    });
}

const control = {
    requestControl: RequestControl(),
    response:       Response(),
};

export { control };

