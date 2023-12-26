//
// FITjs
//

import { equals, first, f, dataviewToArray } from '../functions.js';

import { CRC } from './crc.js';
import { HeaderType, RecordType } from './common.js';
import { fileHeader } from './file-header.js';
import { recordHeader } from './record-header.js';
import { definitionRecord } from './definition-record.js';
import { dataRecord } from './data-record.js';

function FitRecord() {
    function isHeader(record) {
        return equals(RecordType.header, record.type);
    }
    function isDefinition(record) {
        return equals(RecordType.definition, record.type);
    }
    function isData(record) {
        return equals(RecordType.data, record.type);
    }
    function isCRC(record) {
        return equals(RecordType.crc, record.type);
    }

    const definitions = {};

    // RecordJS, Value{}, DataView, Int -> DataView
    function encode(recordJS, view, i = 0) {
        if(isHeader(recordJS)) {
            return fileHeader.encode(recordJS, view, i);
        }
        if(isDefinition(recordJS)) {
            definitions[recordJS.name] = recordJS;
            return definitionRecord.encode(recordJS, view, i);
        }
        if(isData(recordJS)) {
            const definition = definitions[recordJS.name];
            return dataRecord.encode(definition, recordJS, view, i);
        }
        if(isCRC(recordJS)) {
            const crc = CRC.calculateCRC(view, 0, i);
            return CRC.encode(crc, view, i);
        }

        console.warn(`Unknown RecordType ${recordJS.type}`, recordJS);
        return view;
    }

    // DataView, Int, Map -> FitRecord
    function decode(view, i = 0, definitions = new Map()) {
        const header = recordHeader.decode(view.getUint8(i, true));

        if(CRC.isCRC(view, i)) {
            return CRC.decode(view, i);
        }
        if(fileHeader.isFileHeader(view, i)) {
            return fileHeader.decode(view, i);
        }
        if(recordHeader.isDefinition(header)) {
            const definition = definitionRecord.decode(view, i);
            definitions.set(header.localMessageType, definition);
            return definition;
        }
        if(recordHeader.isData(header)) {
            const definition = definitions.get(header.localMessageType);
            return dataRecord.decode(definition, view, i);
        }
        return {};
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function FITjsParser() {
    const fitRecord = FitRecord();

    // [FITjs] -> Dataview
    function encode(fitJS) {
        const header = first(fitJS);
        const dataSize = header.dataSize;
        const viewSize = header.dataSize + header.length + CRC.size;

        const view = new DataView(new Uint8Array(viewSize).buffer);

        fitJS.reduce(function(acc, recordJS) {
            if((acc.i + recordJS.length) > viewSize) {
                console.log(
                    `LocalActivity encode view size error: ${viewSize}/${acc.i}, ${recordJS.name}:${recordJS.length}`);
                return acc;
            }

            fitRecord.encode(recordJS, acc.view, acc.i);

            acc.i += recordJS.length;
            return acc;
        }, {view, i: 0});

        return view;
    }

    // Dataview -> [FITjs]
    function decode(dataview) {
        // Note:
        // - RGT uses the same local_number 0 for all definitions
        // - Zwift often produces unfinished files with broken file headers

        // read fileHeader
        // compare dataview and declared file length
        // reduce the dataview to FITjs definition and data msgs
        // handle unfinished files
        // handle same local msg number

        // config
        const architecture = true;
        // end config

        const fileHeaderJS = fileHeader.decode(dataview, 0);
        const byteLength = dataview.byteLength;
        const dataSize = fileHeaderJS.dataSize;
        const headerLength = fileHeaderJS.length;
        const isFileFinished = byteLength === (dataSize + headerLength + 2);

        console.log(`:headerLegth ${headerLength} :dataSize ${dataSize} :byteLength ${byteLength} :isFileFinished ${isFileFinished}`);

        let i = headerLength;

        // state
        let records = [fileHeaderJS];
        let definitions = new Map();
        let definition = {};
        let data = {};
        let currentDefinition = {};
        let byte;
        let currentRecordHeader;
        let crc = 0;
        // end state

        while(i < byteLength) {
            // DataView, Int, Map -> FitRecord
            var record = fitRecord.decode(dataview, i, definitions);
            records.push(record);
            i += record.length;

            /*
            try {
                byte = dataview.getUint8(i, architecture);
                currentRecordHeader = recordHeader.decode(byte);

                // TODO: handle unfinished files
                if(CRC.isCRC(dataview, i)) {
                    console.log(`crc ${i} + 2 = ${i + 2}`);
                    crc = CRC.decode(dataview, i);
                    console.log(crc);
                    records.push(crc);
                    break;
                }

                if(recordHeader.isDefinition(currentRecordHeader)) {
                    definition = definitionRecord.decode(dataview, i);
                    definitions.set(currentRecordHeader.localMessageType, definition);
                    records.push(definition);

                    console.log(`definition ${definition.name} ${i} + ${definition.length} = ${i + definition.length}`);
                    console.log(definition);

                    i += definition.length;
                }

                if(recordHeader.isData(currentRecordHeader)) {
                    currentDefinition = definitions.get(currentRecordHeader.localMessageType);
                    data = dataRecord.decode(currentDefinition, dataview, i);
                    records.push(data);

                    console.log(`data ${data.name} ${i} + ${currentDefinition.data_record_length} = ${i + currentDefinition.data_record_length}`);
                    console.log(data);

                    i += currentDefinition.data_record_length;
                }
            } catch(e) {
                console.error(`:fit could not parse at ${i}/${byteLength}`);
                break;
            }
            */
        }

        return records;
    }

    return Object.freeze({
        encode,
        decode,
    });
}

const FITjs = FITjsParser();

export {
    FITjs,
    FitRecord,
};

