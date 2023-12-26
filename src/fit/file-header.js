import { exists, equals, f, } from '../functions.js';

import {
    HeaderType, RecordType,
    getView, setView,
    ValueParser, identityParser,
} from './common.js';

import { CRC } from './crc.js';

function FileHeader(args = {}) {
    const _type = RecordType.header;
    const architecture = args.architecture ?? true;

    const protocolVersion = ValueParser({
        encode: function(version) {
            if(equals(version, '2.0')) return 32;
            if(equals(version, '1.0')) return 16;
            return 16;
        },
        decode: function(code) {
            if(equals(code, 32)) return '2.0';
            if(equals(code, 16)) return '1.0';
            return '1.0';
        },
    });

    const profileVersion = ValueParser({
        encode: function(version) {
            if(!exists(version)) return 2140;
            return parseInt(parseFloat(version) * 100);
        },
        decode: function(code) {
            return (code / 100).toFixed(2);
        },
    });

    const dataType = ValueParser({
        encode: function(str) {
            let code = 0;
            for(let i = 0; i < fields.dataType.size; i++) {
                code += str.charCodeAt(i) << 8*i;
            }
            return code;
        },
        decode: function(code) {
            let str = '';
            for(let i = 0; i < fields.dataType.size; i++) {
                str += String.fromCharCode((code & (0xFF << 8*i)) >> 8*i);
            }
            return str;
        },
    });

    const headerCRC = ValueParser({
        encode: (_, view) => CRC.calculateCRC(view, 0, 11),
    });

    const crcPresent = (headerSize) => equals(headerSize, 14) ? true : false;

    const fields = {
        // Indicates the length of this file header including header size.
        // Minimum size is 12. This may be increased in future to add additional
        // optional information
        headerSize:      { size: 1, type: 'Uint8',  default: 14,      present: f.true, parser: identityParser,},
        protocolVersion: { size: 1, type: 'Uint8',  default: '2.0',   present: f.true, parser: protocolVersion,},
        profileVersion:  { size: 2, type: 'Uint16', default: '21.40', present: f.true, parser: profileVersion,},
        // Length of the Data Records section in bytesDoes not include Header or CRC
        dataSize:        { size: 4, type: 'Uint32', default: 0,       present: f.true, parser: identityParser,},
        // ASCII values for ".FIT", [46, 70, 73, 84], 1414088238
        dataType:        { size: 4, type: 'Uint32', default: '.FIT',  present: f.true, parser: dataType,},
        // Contains the value of the CRC of Bytes 0 through 11 or may be set to 0x0000. Optional.
        crc:             { size: 2, type: 'Uint16', default: 0x0000,  present: crcPresent, parser: headerCRC,},
    };

    const order = [
        'headerSize', // acts as flags
        'protocolVersion',
        'profileVersion',
        'dataSize',
        'dataType',
        'crc',
    ];

    // FitRecord{
    //  type: Record.header,
    //  length: Int,
    //  headerSize: Int,
    //  protocolVersion: String,
    //  profileVersion: String,
    //  dataSize: Int,
    //  dataType: String,
    //  crc: Int
    // },
    // DataView,
    // Int,
    // -> DataView
    function encode(definition, view, i = 0) {
        return order.reduce(function(acc, fieldName) {
            const field = fields[fieldName];
            if(field.present(definition.headerSize)) {
                const value = field.parser.encode(definition[fieldName], acc.view);
                setView(field.type, value, acc.view, acc.i, architecture, false);
                acc.i += field.size;
            }
            return acc;
        }, {i: 0, view: view}).view;
    };

    // DataView
    //->
    // FitRecord{
    //  type: Record.header,
    //  length: Int,
    //  headerSize: Int,
    //  protocolVersion: String,
    //  profileVersion: String,
    //  dataSize: Int,
    //  dataType: String,
    //  crc: Int
    // }
    function decode(view, start = 0) {
        return order.reduce(function(acc, fieldName) {
            const field = fields[fieldName];
            if(field.present(acc?.data?.headerSize)) {
                const value = getView(field.type, view, acc.i, architecture, false);
                acc.data[fieldName] = field.parser.decode(value);
                acc.i += field.size;
                acc.data.length += field.size;
            }
            return acc;
        }, {i: start, data: {type: _type, length: 0}}).data;
    };

    function isFileHeader(view, start = 0) {
        return equals(start, 0);
    }

    function toFITjs(args = {}) {
        const headerSize = args.headerSize ?? 14;
        const length = headerSize;
        const crc = equals(headerSize, 14) ? (args.crc ?? 0) : undefined;

        return {
            type: _type,
            length,
            headerSize,
            protocolVersion: args.protocolVersion ?? '2.0',
            profileVersion: args.profileVersion ?? '21.40',
            dataSize: args.dataSize ?? 0,
            dataType: '.FIT',
            crc,
        };
    }

    return Object.freeze({
        type: _type,
        encode,
        decode,
        isFileHeader,
        toFITjs,
    });
}

const fileHeader = FileHeader();

export {
    FileHeader,
    fileHeader,
};

