import { nth, f, } from '../functions.js';

import {
    HeaderType, RecordType,
    ValueParser, identityParser,
} from './common.js';
import { profiles } from './profiles/profiles.js';
import { recordHeader } from './record-header.js';
import { fieldDefinition } from './field-definition.js';

function DefinitionRecord(args = {}) {
    const _type               = RecordType.definition;
    const headerSize          = recordHeader.size;
    const fixedContentLength  = 6;
    const fieldLength         = 3;
    const architecture        = (args.architecture ?? true) ? 0 : 1;
    const numberOfFieldsIndex = 5;

    function numberToMessageName(number) {
        return profiles.numberToMessageName(number);
    }

    function messageNameToNumber(messageName) {
        return profiles.messageNameToNumber(messageName);
    }

    function getDefinitionRecordLength(view, start = 0) {
        const numberOfFields    = readNumberOfFields(view, start);
        const numberOfDevFields = readNumberOfDevFields(view, start);

        return fixedContentLength +
            (numberOfFields * fieldLength) +
            (numberOfDevFields > 0 ? 1 : 0) +
            (numberOfDevFields * fieldLength);
    }

    function getDataRecordLength(fields) {
        return headerSize + fields.reduce((acc, x) => acc + x.size, 0);
    }

    function readNumberOfFields(view, start = 0) {
        return view.getUint8(start + numberOfFieldsIndex, true);
    }

    function readNumberOfDevFields(view, start = 0) {
        const header = recordHeader.decode(view.getUint8(start, true));
        if(recordHeader.isDeveloper(header)) {
            const numberOfFields = readNumberOfFields(view, start);
            const index = start + fixedContentLength + (numberOfFields * fieldLength);

            return view.getUint8(index, true);
        }
        return 0;
    }

    // {
    //     type: RecordType,
    //     name: String,
    //     local_number: Int,
    //     architecture: Int,
    //     length: Int,
    //     data_record_length: Int,
    //     fields: [{number: Int, size: Int, base_type: BaseType}]
    //     dev_fields?: [{number: Int, size: Int, base_type: BaseType}]?
    // }
    // -> DataView
    function encode(definition, view, i = 0) {
        const header = recordHeader.encode({
            messageType:      _type,
            localMessageType: definition.local_number,
        });
        const numberOfFields = definition.fields.length;
        const globalNumber   = messageNameToNumber(definition.name);

        const length = fixedContentLength + (numberOfFields * fieldLength);

        view.setUint8( i+0, header,         true);
        view.setUint8( i+1, 0,              true);
        view.setUint8( i+2, architecture,   true);
        view.setUint16(i+3, globalNumber,   true);
        view.setUint8( i+5, numberOfFields, true);

        i += fixedContentLength;
        definition.fields.forEach((field) => {
            fieldDefinition.encode(field, view, i);
            i += fieldLength;
        });

        // TODO:
        // if developer fields are defined
        // write # developer fields
        // write developer fields definitions
        if('dev_fields' in definition) {

            const numberOfDeveloperFields = definition.dev_fields.length;

            view.setUint8(i, numberOfDeveloperFields, true);
            i += 1;

            definition.dev_fields.forEach((field) => {
                fieldDefinition.encode(field, view, i);
                i += fieldLength;
            });
        }

        return view;
    }

    // DataView,
    // Int
    // ->
    // {
    //     type: RecordType
    //     name: String,
    //     architecture: Int,
    //     local_number: Int,
    //     length: Int,
    //     data_record_length: Int,
    //     fields:      [{number: Int, size: Int, base_type: BaseTypes}],
    //     dev_fields?: [{number: Int, size: Int, base_type: BaseTypes}]?
    // }
    function decode(view, start = 0) {
        const header            = recordHeader.decode(view.getUint8(start, true));
        const local_number      = header.localMessageType;
        const architecture      = view.getUint8(start+2, true);
        const littleEndian      = !architecture;
        const messageNumber     = view.getUint16(start+3, littleEndian);
        const messageName       = numberToMessageName(messageNumber);
        const numberOfFields    = readNumberOfFields(view, start);
        const numberOfDevFields = readNumberOfDevFields(view, start);

        // i  is the dataview index
        // f  is the current field index
        // df is the current developer field index
        let i = start + fixedContentLength;
        let fields = [];

        for(let f=0; f < numberOfFields; f++) {
            fields.push(fieldDefinition.decode(messageName, view, i,));
            i += fieldLength;
        }

        i+=1; // add the 'number of dev fields' field

        let dev_fields = [];
        for(let df=0; df < numberOfDevFields; df++) {
            dev_fields.push(fieldDefinition.decode(messageName, view, i,));
            i += fieldLength;
        }

        const length             = getDefinitionRecordLength(view, start);
        const data_record_length = getDataRecordLength(fields.concat(dev_fields));

        return {
            type: _type,
            architecture,
            name: messageName,
            local_number,
            length,
            data_record_length,
            fields,
            dev_fields,
        };
    }

    // ['message_name', ['field_name'], Int]
    // ->
    // {
    //     type: RecordType
    //     architecture: Int,
    //     name: String,
    //     local_number: Int,
    //     length: Int,
    //     data_record_length: Int,
    //     fields: [{number: Int, size: Int, base_type: base_type}]
    // }
    function toFITjs(productMessageDefinition = ['', []]) {
        const messageName    = nth(0, productMessageDefinition);
        const fieldNames     = nth(1, productMessageDefinition);
        const local_number   = nth(2, productMessageDefinition);
        const numberOfFields = fieldNames.length;
        const length         = fixedContentLength + (numberOfFields * fieldLength);

        return fieldNames.reduce(function(acc, fieldName) {
            const number    = profiles.fieldNameToNumber(messageName, fieldName);
            const size      = profiles.fieldNameToSize(fieldName);
            const base_type = profiles.fieldNameToBaseType(fieldName);

            acc.data_record_length += size;
            acc.fields.push({number, size, base_type});

            return acc;
        }, {
            type: _type,
            architecture,
            name: messageName,
            local_number,
            length,
            data_record_length: 1,
            fields: [],
        });
    }

    return Object.freeze({
        getDefinitionRecordLength,
        getDataRecordLength,
        encode,
        decode,
        toFITjs,
    });
}

const definitionRecord = DefinitionRecord();

export {
    DefinitionRecord,
    definitionRecord,
};

