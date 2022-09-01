import { equals, existance, curry2, clamp } from '../functions.js';

function DataPage(args = {}) {
    const defaults = {
        length: 8,
    };

    const length      = existance(args.length, defaults.length);
    const definitions = existance(args.definitions);

    const applyResolution = curry2((prop, value) => {
        return value / definitions[prop].resolution;
    });

    const removeResolution = curry2((prop, value) => {
        return value * definitions[prop].resolution;
    });

    const applyOffset = curry2((prop, value) => {
        return (applyResolution(prop, definitions[prop].offset)) +
               (applyResolution(prop, value));
    });

    const removeOffset = curry2((prop, value) => {
        return (removeResolution(prop, value)) - (definitions[prop].offset);
    });

    function encodeField(prop, input, transform = applyResolution) {
        const invalid = definitions[prop].invalid;
        const min     = transform(prop, definitions[prop].min);
        const max     = transform(prop, definitions[prop].max);
        const value   = existance(input, definitions[prop].default);

        if(equals(value, invalid)) {
            return value;
        } else {
            return Math.floor(clamp(min, max, transform(prop, value)));
        }
    }

    function decodeField(prop, input, transform = removeResolution) {
        if(equals(input, definitions[prop].invalid)) return undefined;
        return transform(prop, input);
    }

    return {
        length,
        applyResolution,
        removeResolution,
        applyOffset,
        removeOffset,
        encodeField,
        decodeField,
    };
}

function CommonPage70(args = {}) {
    // Common Page 70 (0x46) – Request Data Page
    const number = 70;

    const definitions = {
        // ...
    };

    const data   = DataPage({definitions});
    const length = data.length;

    function encode(args = {}) {
        const slaveSerialNumber     = args.slaveSerialNumber ?? 0xFF;
        const descriptor            = args.descriptor ?? 0xFFFF;
        const requestedTransmission = args.requestedTransmission ?? 0b00000001;
        const requestedPageNumber   = args.requestedPageNumber ?? 0x47;
        const commandType           = args.commandType ?? 0x01;

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, number, true);
        view.setUint16(1, slaveSerialNumber, true);
        view.setUint16(3, descriptor, true);
        view.setUint8( 5, requestedTransmission, true);
        view.setUint8( 6, requestedPageNumber, true);
        view.setUint8( 7, commandType, true);

        return view;
    }

    function decode(dataview) {
        const dataPage              = dataview.getUint8( 0, true);
        const slaveSerialNumber     = dataview.getUint16(1, true);
        const descriptor            = dataview.getUint16(3, true);
        const requestedTransmission = dataview.getUint8( 5, true);
        const requestedPageNumber   = dataview.getUint8( 6, true);
        const commandType           = dataview.getUint8( 7, true);

        return {
            dataPage,
            slaveSerialNumber,
            descriptor,
            requestedTransmission,
            requestedPageNumber,
            commandType,
        };
    }

    return Object.freeze({
        number,
        length,
        definitions,
        encode,
        decode,
    });
}

function CommonPage71(args = {}) {
    // Common Page 71 (0x47) – Command Status
    const number = 71;

    const definitions = {
        // ...
    };

    const data   = DataPage({definitions});
    const length = data.length;

    function encode(args = {}) {
        const lastCommandId = args.lastCommandId;
        const sequenceNumber = args.sequenceNumber ?? 0;
        const status = args.status ?? 255;
        const data = args.data ?? 0;

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, number, true);
        view.setUint8( 1, lastCommandId, true);
        view.setUint8( 2, sequenceNumber, true);
        view.setUint8( 3, status, true);
        view.setUint32(4, data, true);

        return view;
    }

    function decode(dataview) {
        const dataPage       = dataview.getUint8( 0, true);
        const lastCommandId  = dataview.getUint8( 1, true);
        const sequenceNumber = dataview.getUint8( 2, true);
        const status         = dataview.getUint8( 3, true);
        const data           = dataview.getUint32(4, true);

        return {
            dataPage,
            lastCommandId,
            sequenceNumber,
            status,
            data,
        };
    }

    return Object.freeze({
        number,
        length,
        definitions,
        encode,
        decode,
    });
}

const common = {
    commonPage70: CommonPage70(),
    commonPage71: CommonPage71(),
};

export { DataPage, common };
