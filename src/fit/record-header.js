import {
    equals, isNumber, isObject, f, nthBit, setBit,
} from '../functions.js';

import {
    HeaderType, RecordType,
    ValueParser, identityParser,
} from './common.js';

function RecordHeader() {
    // NOTE: Supports only Normal Header Type
    // does not support Compressed Timestamp Header
    const size = 1;

    const headerType = ValueParser({
        encode: (type) => equals(type, HeaderType.normal) ? 0 : 1,
        decode: (code) => equals(code, 0) ? HeaderType.normal : HeaderType.timestamp,
    });

    const messageType = ValueParser({
        encode: (type) => equals(type, RecordType.definition) ? 1 : 0,
        decode: (code) => equals(code, 1) ? RecordType.definition : RecordType.data,
    });

    const messageTypeSpecific = ValueParser({
        encode: (byte) => 0,
        decode: (byte) => (
            equals(nthBit(byte, 6), 1) && equals(nthBit(byte, 5), 1)) ?
            'developer' :
            'reserved',
    });

    const bits = {
        // 0 normal header, 1 Compressed Timestamp Header
        'headerType':          {size: 1, default: 0, present: f.true, parser: headerType},
        // 0 data message, 1 definition message
        'messageType':         {size: 1, default: 0, present: f.true, parser: messageType},
        // if definition message and set to 1 the message contains extended definitions for developer data
        'messageTypeSpecific': {size: 1, default: 0, present: f.true, parser: identityParser},
        'reserved':            {size: 1, default: 0, present: f.true, parser: identityParser},
        // local message type/number
        'localMessageType':    {size: 4, default: 0, present: f.true, parser: identityParser},
    };

    const order = [
        'headerType',
        'messageType',
        'messageTypeSpecific',
        'reserved',
        'localMessageType',
    ];

    // {headerType: String, messageType: String, messageTypeSpecific: String, localMessageType: Int}
    // ->
    // Int,
    function encode(definition) {
        let byte = 0b00000000 + (definition.localMessageType ?? 0);
        if(equals(definition.headerType, HeaderType.timestamp)) {
            byte = setBit(7, byte);
        };
        if(equals(definition.messageType, RecordType.definition)) {
            byte = setBit(6, byte);
        }
        if(equals(definition.messageTypeSpecific, 'developer')) {
            byte = setBit(5, byte);
        }
        return byte;
    }

    // Int,
    // ->
    // {headerType: String, messageType: String, messageTypeSpecific: String, localMessageType: Int}
    function decode(byte) {
        return {
            headerType:          headerType.decode(nthBit(byte, 7)),
            messageType:         messageType.decode(nthBit(byte, 6)),
            messageTypeSpecific: messageTypeSpecific.decode(byte),
            localMessageType:    byte & 0b00001111,
        };
    }

    function isDefinition(header) {
        if(isNumber(header)) return equals(nthBit(header, 6), 0) ? true : false;
        if(isObject(header)) return equals(header.messageType, RecordType.definition) ? true : false;
        return false;
    }

    function isData(header) {
        if(isNumber(header)) return equals(nthBit(header, 6), 1) ? true : false;
        if(isObject(header)) return equals(header.messageType, RecordType.data) ? true : false;
        return false;
    }

    function isDeveloper(header) {
        if(isNumber(header)) return (equals(nthBit(header, 6), 1) && equals(nthBit(header, 5), 1)) ? true : false;
        if(isObject(header)) return (equals(header.messageTypeSpecific, 'developer')
                                     && equals(header.messageType, RecordType.data)) ? true : false;
        return false;
    }

    return Object.freeze({
        size,
        isDefinition,
        isData,
        isDeveloper,
        encode,
        decode,
    });
}

const recordHeader = RecordHeader();

export {
    RecordHeader,
    recordHeader,
};

