import { exists, empty, isUndefined,
         map, first, last, traverse,
         nthBitToBool, toUint8Array,
          } from '../functions.js';
import { calculateCRC, typeToAccessor } from '../utils.js';
import { messages, basetypes, appTypes } from './profiles.js';
import { localMessageDefinitions as lmd } from './local-message-definitions.js';



function FileHeader(args = {}) {
    const defaultSize = 14;
    const legacySize  = 12;
    const crcLength   = 2;

    function crcIndex(length) {
        return length - crcLength;
    }

    function readProtocolVersion(code) {
        if(code === 32) return '2.0';
        if(code === 16) return '1.0';
        return '1.0';
    }

    function readProfileVersion(code) {
        return (code / 100).toFixed(2);
    }

    function readFileType(view) {
        const charCodes = [
            view.getUint8( 8, true),
            view.getUint8( 9, true),
            view.getUint8(10, true),
            view.getUint8(11, true)];

        return charCodes.reduce((acc, n) => acc+String.fromCharCode(n), '');
    }

    function writeProtocolVersion(version) {
        if(isUndefined(version)) return 32;
        if(version === '2.0')    return 32;
        if(version === '1.0')    return 16;
        return 16;
    }

    function writeProfileVersion(version) {
        if(isUndefined(version)) return 2140;
        return parseInt(version) * 100;
    }

    function read(view) {
        const type                = 'header';
        const length              = view.getUint8( 0, true);
        const protocolVersionCode = view.getUint8( 1, true);
        const profileVersionCode  = view.getUint16(2, true);
        const dataRecordsLength   = view.getInt32( 4, true);
        const fileType            = readFileType(view);
        const crc                 = (length === defaultSize) ? view.getUint16(crcIndex(length), true) : false;

        const protocolVersion = readProtocolVersion(protocolVersionCode);
        const profileVersion  = readProfileVersion(profileVersionCode);

        return {
            type,
            protocolVersion,
            profileVersion,
            dataRecordsLength,
            fileType,
            crc,
            length
        };
    };

    function encode(args) {
        const length            = args.length || defaultSize;
        const dataRecordsLength = args.dataRecordsLength || 0;                // without header and crc
        const protocolVersion   = writeProtocolVersion(args.protocolVersion); // 16 v1, 32 v2
        const profileVersion    = writeProfileVersion(args.profileVersion);   // v21.40
        const dataTypeByte      = [46, 70, 73, 84];                           // ASCII values for ".FIT"
        let crc                 = 0x0000; // default value for optional crc of the header of bytes 0-11

        let buffer   = new ArrayBuffer(length);
        let view     = new DataView(buffer);

        view.setUint8( 0, length,            true);
        view.setUint8( 1, protocolVersion,   true);
        view.setUint16(2, profileVersion,    true);
        view.setInt32( 4, dataRecordsLength, true);
        view.setUint8( 8, dataTypeByte[0],   true);
        view.setUint8( 9, dataTypeByte[1],   true);
        view.setUint8(10, dataTypeByte[2],   true);
        view.setUint8(11, dataTypeByte[3],   true);

        crc = calculateCRC(new Uint8Array(view.buffer), 0, crcIndex(length));

        if(length === defaultSize) view.setUint16(crcIndex(length), crc, true);

        return new Uint8Array(buffer);
    };

    return Object.freeze({ read, encode });
}

function Header() {

    function getLocalNumber(header) {
        return header & 0b00001111;
    }

    function setLocalNumber(header, number) {
        return header + number;
    }

    function isDefinition(header) {
        return (header.type === 'definition');
    }

    function isData(header) {
        return (header.type === 'data');
    }

    function encode(args) {
        let header = setLocalNumber(0b00000000, args.local_number);
        if(args.type === 'definition') header |= 0b01000000;
        if(args.type === 'data')       header |= 0b00000000;
        return header;
    }

    function read(byte) {
        const header_type  = nthBitToBool(byte, 7) ? 'timestamp' : 'normal';
        const type         = nthBitToBool(byte, 6) ? 'definition' : 'data';
        const local_number = getLocalNumber(byte); // bits 0-3, value 0-15

        return { type, header_type, local_number };
    }

    return Object.freeze({ read, encode, isDefinition, isData });
}

function Definition(args = {}) {
    const headerLength       = 1;
    const fixedContentLength = 6;
    const fieldLength        = 3;
    const architecture       = 0;
    const type               = 'definition';

    function numberToMessage(number) {
        let res = Object.entries(messages)
                        .filter(x => x[1].global_number === number)[0];
        if(res === undefined) console.error(`message global number ${number} not found`);
        return res;
    }

    function messageToNumber(message) {
        let res = messages[message].global_number;
        if(res === undefined) console.error(`message name ${message} not found`);
        return res;
    }

    function getLength(numberOfFields) {
        return fixedContentLength + (numberOfFields * fieldLength);
    }

    function getDataMsgLength(fields) {
        return headerLength + fields.reduce((acc, x) => acc + x.size, 0);
    }

    function read(view, start = 0) {
        const header         = view.getUint8(start, true);
        const local_number   = header & 0b00001111;
        const architecture   = view.getUint8(start+2, true);
        const messageNumber  = view.getUint16(start+3, true);
        const message        = numberToMessage(messageNumber)[0];
        const numberOfFields = view.getUint8(start+5, true);
        const length         = getLength(numberOfFields);

        let fields = [];
        let i = start + fixedContentLength;

        for(let f=0; f < numberOfFields; f++) {
            let fieldView = new DataView(view.buffer.slice(i, i + fieldLength));
            fields.push(fit.fieldDefinition.read(fieldView, message));
            i += fieldLength;
        }

        const data_msg_length = getDataMsgLength(fields);

        return { type, message, local_number, fields, length, data_msg_length };
    }

    function encode(definition) {
        const header         = 64 + definition.local_number;
        const numberOfFields = definition.fields
                                         .reduce((acc, x) => acc+=1, 0);
        const globalNumber   = messageToNumber(definition.message);

        let length = fixedContentLength + (numberOfFields * fieldLength);
        let buffer = new ArrayBuffer(length);
        let view   = new DataView(buffer);

        view.setUint8( 0, header,         true);
        view.setUint8( 1, 0,              true);
        view.setUint8( 2, architecture,   true);
        view.setUint16(3, globalNumber,   true);
        view.setUint8( 5, numberOfFields, true);

        let i = fixedContentLength;
        definition.fields.forEach((field) => {
            view.setUint8(i,field.number,      true);
            view.setUint8(i+1,field.size,      true);
            view.setUint8(i+2,field.base_type, true);
            i += fieldLength;
        });

        return new Uint8Array(buffer);
    }

    return Object.freeze({ read, encode, numberToMessage, messageToNumber });
}

function FieldDefinition(args = {}) {

    function numberToField(message, number) {
        const messageFields = messages[message].fields;
        let res = Object.entries(messageFields)
                        .filter(x => x[1].number === number)[0];
        if(res === undefined) console.error(`field number ${number} on message ${message} not found`);
        return res;
    }

    function read(view, messageName) {
        let number    = view.getUint8(0, true);
        let size      = view.getUint8(1, true);
        let base_type = view.getUint8(2, true);
        let field     = numberToField(messageName, number)[0];

        return { field, number, size, base_type };
    }

    function encode(view, definition) {
        throw new Error('Not Implemented!');
    }

    return Object.freeze({ read, encode, numberToField });
}

function Data() {
    const headerLength = 1;
    const type         = 'data';

    function fieldsToLength(definition) {
        return definition.fields.reduce((acc, field) => acc+field.size, 0);
    }

    function encode(definition, values) {
        const fieldsLength = fieldsToLength(definition);
        const length       = headerLength + fieldsLength;

        let buffer = new ArrayBuffer(length);
        let view   = new DataView(buffer);

        let index    = 0;
        const header = 0 + definition.local_number;

        view.setUint8(index, header, true);
        index += headerLength;

        definition.fields.forEach((field) => {
            view[typeToAccessor(field.base_type, 'set')](index, values[field.field], true);
            index += field.size;
        });

        return new Uint8Array(buffer);
    }

    function read(definition, view, start = 0) {
        const header       = view.getUint8(start, true);
        const local_number = header & 0b00001111;
        const message      = definition.message;

        let index = start + headerLength;
        let fields = {};

        definition.fields.forEach((fieldDef) => {
            let value = view[typeToAccessor(fieldDef.base_type, 'get')](index, true);
            fields[fieldDef.field] = value;
            index += fieldDef.size;
        });

        return { type, message, local_number, fields };
    }

    return Object.freeze({ read, encode });
}

function CRC() {

    function read(view, i = 0) {
        let value = view.getUint16(i, true);
        return {type: 'crc', value: value};
    }

    return Object.freeze({ read });
}

function Activity() {
    const headerLength = 1;
    const fileHeaderLength = 14;
    const fileHeaderLegacyLength = 12;
    const crcLength = 2;

    function toDefinitions(activity) {
        return activity.reduce((acc, msg) => {
            if(msg.type === 'definition') {
                acc[msg.local_number] = msg;
                return acc;
            }
            return acc;
        }, {});
    }

    function toFileLength(activity, definitions) {
        const init = last(activity).type === 'crc' ? 0 : 2;

        const length = activity.reduce((acc, msg) => {
            if(msg.type === 'header') {
                return acc + msg.length;
            }
            if(msg.type === 'definition') {
                return acc + msg.length;
            }
            if(msg.type === 'data') {
                let definition = definitions[msg.local_number];
                return acc + definition.data_msg_length;
            }
            if(msg.type === 'crc') {
                return acc + crcLength;
            };
            return acc;
        }, init);

        return length;
    }

    function encode(activity) {
        const definitions       = toDefinitions(activity);
        const fileLength        = toFileLength(activity, definitions);
        const headerLength      = activity[0].length;
        const dataRecordsLength = fileLength - headerLength - crcLength;

        let uint8 = new Uint8Array(fileLength);
        let view  = new DataView(uint8.buffer);

        let offset = 0;

        activity.forEach((msg) => {
            if(msg.type === 'header') {
                const encoded = fit.fileHeader.encode(
                    Object.assign(msg, {dataRecordsLength: dataRecordsLength}));
                uint8.set(encoded, offset);
                offset+= encoded.byteLength;
            }
            if(msg.type === 'definition') {
                const encoded = fit.definition.encode(msg);
                uint8.set(encoded, offset);
                offset+= encoded.byteLength;
            }
            if(msg.type === 'data') {
                const encoded = fit.data.encode(definitions[msg.local_number], msg.fields);
                uint8.set(encoded, offset);
                offset+= encoded.byteLength;
            }
        });

        // calculate and write crc
        const crc = calculateCRC(uint8, 0, fileLength - crcLength);
        view.setUint16(fileLength - crcLength, crc, true);

        return uint8;
    }

    function read(view) {
        const fitFileHeader = fit.fileHeader.read(view);
        const fileLength    = view.byteLength;

        let i           = fitFileHeader.length;
        let records     = [fitFileHeader];
        let dataMsg     = {};
        let definitions = {};
        let definition  = {};

        function isLastMessage(header, i) {
            if(header.local_number in definitions) {
                let definition = definitions[header.local_number];
                return (i > (fileLength - definition.data_msg_length));
            }
            return (i >= (fileLength - 2));
        }

        function isCRC(i) {
            return (fileLength - i) === crcLength;
        }

        function getLocalDefinition(local_number) {
            let definition = Object.entries(lmd).filter(d => d[1].local_number === local_number)[0][1];
            return definition;
        }

        while(i < fileLength) {
            try {
                let currentByte = view.getUint8(i, true);
                let header = fit.header.read(currentByte);

                if(isLastMessage(header, i)) {
                    if(isCRC(i)) {
                        records.push(fit.crc.read(view, i));
                    } else {
                        console.warn(`break: ${i}/${fileLength}`);
                    }
                    break;
                }
                if(fit.header.isDefinition(header)) {
                    definition = fit.definition.read(view, i);
                    definitions[definition.local_number] = definition;
                    records.push(definition);
                    i += definition.length;
                }
                if(fit.header.isData(header)) {
                    definition = definitions[header.local_number];

                    if(isUndefined(definition)) {
                        definition = getLocalDefinition(header.local_number);
                        definitions[header.local_number] = definition;
                        records.push(definition);
                    }

                    dataMsg = fit.data.read(definition, view, i);
                    records.push(dataMsg);
                    i += definition.data_msg_length;
                }
            } catch(e) {
                console.error(`error ${i}/${fileLength}`, e);
                break;
            }
        }

        return records;
    }

    return Object.freeze({ read, encode, toDefinitions, toFileLength });
}

function Summary() {

    function isDataRecord(record) {
        if(exists(record.type) && exists(record.message)) {
            return (record.type === 'data') && (record.message === 'record');
        }
        return false;
    }

    function getDataRecords(records) {
        return records.filter(isDataRecord);
    }

    function format(v) {
        v.avg = Math.floor(v.avg);
        return v;
    }

    function accumulate(acc, record, _, { length }) {
        acc.power.avg     += record.fields.power / length;
        acc.cadence.avg   += record.fields.cadence / length;
        acc.speed.avg     += record.fields.speed / length;
        acc.heartRate.avg += record.fields.heart_rate / length;

        if(record.fields.power      > acc.power.max)     acc.power.max     = record.fields.power;
        if(record.fields.cadence    > acc.cadence.max)   acc.cadence.max   = record.fields.cadence;
        if(record.fields.speed      > acc.speed.max)     acc.speed.max     = record.fields.speed;
        if(record.fields.heart_rate > acc.heartRate.max) acc.heartRate.max = record.fields.heart_rate;

        return acc;
    }

    function accumulations(dataRecords) {
        let init = {power:     {avg: 0, max: 0},
                    cadence:   {avg: 0, max: 0},
                    speed:     {avg: 0, max: 0},
                    heartRate: {avg: 0, max: 0}};

        return map(dataRecords.reduce(accumulate, init), format);
    }

    function calculate(activity) {
        const dataRecords = getDataRecords(activity);

        let res = accumulations(dataRecords);

        if(empty(dataRecords)) {
            const file_id = activity.filter(m => m.type === 'data' && m.message === 'file_id')[0];
            return Object.assign(res, {
                distance: 0,
                timeStart: file_id.fields.timecreated,
                timeEnd: file_id.fields.timecreated,
                elapsed: 0});
        }

        res.distance  = last(dataRecords).fields.distance;
        res.timeStart = first(dataRecords).fields.timestamp;
        res.timeEnd   = last(dataRecords).fields.timestamp;
        res.elapsed   = (res.timeEnd - res.timeStart); // maybe * 1000;

        return res;
    }

    function toFooter(summary, check = false) {
        let footer = [];

        const eventStopAllData = {
            type: "data", message: "event", local_number: lmd.event.local_number, fields: {
                  timestamp: summary.timeEnd,
                  data: 0,
                  data16: 0,
                  event: appTypes.event.values.timer,
                  event_type: appTypes.event_type.values.stop_all,
                  event_group: 0,
            }};

        const lapData = {
            type: "data", message: "lap", local_number: lmd.lap.local_number, fields: {
                timestamp:          summary.timeEnd,
                start_time:         summary.timeStart,
                total_elapsed_time: summary.elapsed,
                total_timer_time:   summary.elapsed,
                message_index:      0,
                event:              appTypes.event.values.lap,
                event_type:         appTypes.event_type.values.stop,
                event_group:        0,
                lap_trigger:        appTypes.lap_trigger.values.manual}};

        const sessionData = {
            type: "data", message: "session", local_number: lmd.session.local_number, fields: {
                timestamp:          summary.timeEnd,
                start_time:         summary.timeStart,
                total_elapsed_time: summary.elapsed,
                total_timer_time:   summary.elapsed,
                message_index:      0,
                first_lap_index:    0,
                num_laps:           1,
                sport:              appTypes.sport.values.cycling,
                sub_sport:          appTypes.sub_sport.values.virtual_activity,
                avg_power:          summary.power.avg,
                max_power:          summary.power.max,
                avg_cadence:        summary.cadence.avg,
                max_cadence:        summary.cadence.max,
                avg_speed:          summary.speed.avg,
                max_speed:          summary.speed.max,
                avg_heart_rate:     summary.heartRate.avg,
                max_heart_rate:     summary.heartRate.max,
                total_distance:     summary.distance,
            }};

        const activityData = {
            type: "data", message: "activity", local_number: lmd.activity.local_number, fields: {
                  timestamp:       summary.timeEnd,
                  local_timestamp: summary.timeEnd,
                  num_sessions:    1,
                  type:            appTypes.activity.values.manual,
                  event:           appTypes.event.values.activity,
                  event_type:      appTypes.event_type.values.stop,
                  event_group:     0,
            }};


        if(check !== false) {
            if(!check.data.event.stop)      footer.push(eventStopAllData);
            if(!check.definitions.lap)      footer.push(lmd.lap);
            if(!check.data.lap)             footer.push(lapData);
            if(!check.definitions.session)  footer.push(lmd.session);
            if(!check.data.session)         footer.push(sessionData);
            if(!check.definitions.activity) footer.push(lmd.activity);
            if(!check.data.activity)        footer.push(activityData);
        } else {
            footer = [eventStopAllData, lmd.lap, lapData, lmd.session, sessionData, lmd.activity, activityData];
        }

        return footer;
    }

    return { calculate, toFooter, accumulations, getDataRecords, isDataRecord };
}


const fit = {
    fileHeader: FileHeader(),
    crc: CRC(),
    header: Header(),
    definition: Definition(),
    fieldDefinition: FieldDefinition(),
    data: Data(),
    summary: Summary(),
    activity: Activity(),
};

export { fit };

