import { empty, isObject, nthBit } from '../../src/functions.js';

import {getUint16, getUint32,
         calculateCRC, typeToAccessor } from '../../src/utils.js';

import { appTypes } from '../../src/fit/profiles.js';
import { localMessageDefinitions as lmd } from './local-message-definitions.js';
import { data } from './data.js';
import { fit } from '../../src/fit/fit.js';
import { activity } from '../../src/fit/activity.js';



describe('reads fit file header', () => {

    describe('default header', () => {
        let headerBuffer = new Uint8Array([14, 32, 92,8,  39,0,0,0,  46,70,73,84,  123,197]).buffer;
        let view         = new DataView(headerBuffer);

        let header = fit.fileHeader.read(view);
        //  header = {type: 'header', length: 14, protocolVersion: '2.0', profileVersion: '21.40', dataRecordsLength: 39}

        test('reads header', () => {
            expect(header).toEqual({
                type: 'header',
                length: 14,
                protocolVersion: '2.0',
                profileVersion: '21.40',
                dataRecordsLength: 39,
                fileType: '.FIT',
                crc: 50555}); // getUint16(new Uint8Array([123, 197]))

        });
    });

    describe('Zwift (legacy) header', () => {
        let headerBuffer = new Uint8Array([12, 16, 100,0,  241,118,2,0,  46,70,73,84]).buffer;
        let view         = new DataView(headerBuffer);

        let header = fit.fileHeader.read(view);

        expect(header).toEqual({
            type: 'header',
            length: 12,
            protocolVersion: '1.0',
            profileVersion: '1.00',
            dataRecordsLength: 161521,
            fileType: '.FIT',
            crc: false});
    });

    describe('Zwift (legacy) unfinished header', () => {
        let headerBuffer = new Uint8Array([12, 16, 100,0,  0,0,0,0,  46,70,73,84]).buffer;
        let view         = new DataView(headerBuffer);

        let header = fit.fileHeader.read(view);

        expect(header).toEqual({
            type: 'header',
            length: 12,
            protocolVersion: '1.0',
            profileVersion: '1.00',
            dataRecordsLength: 0,
            fileType: '.FIT',
            crc: false});
    });
});

describe('encodes fit file header', () => {
    let FITjs = {
        type: "header",
        protocolVersion: "1",
        profileVersion: "1.00",
        dataRecordsLength: 434544,
        fileType: ".FIT",
        length: 12,
        crc: false,
    };

    let header = fit.fileHeader.encode({dataRecordsLength: 100});
    let legacy = fit.fileHeader.encode(FITjs);

    test('default header', () => {
        expect(Array.from(header)).toStrictEqual([14, 32, 92,8,  100,0,0,0,  46,70,73,84,  63,224]);
    });

    test('legacy header from FIT js', () => {
        expect(Array.from(legacy)).toStrictEqual([12, 16, 100,0,  112,161,6,0,  46,70,73,84]);
    });
});

describe('reads message header', () => {

    describe('definition header', () => {
        let header               = fit.header.read(64); // 0b01000000
        let deviceInfoDefinition = fit.header.read(65); // 0b01000001
        let lapDefinition        = fit.header.read(68); // 0b01000100
        let eventData            = fit.header.read(2);  // 0b00000010
        let lapData              = fit.header.read(4);  // 0b00000100

        test('reads type', () => {
            expect(header).toEqual({type: 'definition', header_type: 'normal', local_number: 0});
        });

        test('header of definition', () => {
            expect(deviceInfoDefinition).toEqual({type: 'definition', header_type: 'normal', local_number: 1});
        });
        test('header of data', () => {
            expect(eventData).toEqual({type: 'data', header_type: 'normal', local_number: 2});
            expect(lapData).toEqual({type: 'data', header_type: 'normal', local_number: 4});
        });

    });

    describe('data header', () => {
        let header  = fit.header.read(0); // 0b00000000
        let header1 = fit.header.read(1); // 0b00000001

        test('reads type', () => {
            expect(header).toEqual({type: 'data', header_type: 'normal', local_number: 0});
        });

        test('reads local message number', () => {
            expect(header1).toEqual({type: 'data', header_type: 'normal', local_number: 1});
        });
    });
});

describe('reads File Id definition message', () => {
    let buffer = new Uint8Array([64, 0, 0, 0,0, 5,  4,4,134  , 1,2,132  , 2,2,132  , 5,2,132  , 0,1,0]).buffer;
    let view = new DataView(buffer);

    let res = fit.definition.read(view);

    test('type', () => {
        expect(res.type).toBe('definition');
    });
    test('message', () => {
        expect(res.message).toBe('file_id');
    });
    test('local message number', () => {
        expect(res.local_number).toBe(0);
    });

    test('field time created', () => {
        expect(res.fields[0]).toEqual({field: 'time_created', number: 4, size: 4, base_type: 134});
    });
    test('field manufacturer', () => {
        expect(res.fields[1]).toEqual({field: 'manufacturer', number: 1, size: 2, base_type: 132});
    });
    test('field product', () => {
        expect(res.fields[2]).toEqual({field: 'product', number: 2, size: 2, base_type: 132});
    });
    test('field number', () => {
        expect(res.fields[3]).toEqual({field: 'number', number: 5, size: 2, base_type: 132});
    });
    test('field type', () => {
        expect(res.fields[4]).toEqual({field: 'type', number: 0, size: 1, base_type: 0});
    });

    test('reads File id', () => {
        expect(res).toEqual({
            type: 'definition',
            message: 'file_id',
            local_number: 0,
            length: 21,
            data_msg_length: 12,
            fields: [
                {field: 'time_created', number: 4, size: 4, base_type: 134},
                {field: 'manufacturer', number: 1, size: 2, base_type: 132},
                {field: 'product',      number: 2, size: 2, base_type: 132},
                {field: 'number',       number: 5, size: 2, base_type: 132},
                {field: 'type',         number: 0, size: 1, base_type: 0}
            ]
        });
    });

});

describe('encodes File Id definition message', () => {
    let res = fit.definition.encode(lmd.fileId);
    //  res = new Uint8Array([64, 0, 0, 0,0, 5,  4,4,134  , 1,2,132  , 2,2,132  , 5,2,132  , 0,1,0]);

    describe('definition messege header (byte 0)', () => {
        test('is normal header (bit 7 = 0)', () => {
            expect(nthBit(res[0], 7)).toBe(0);
        });
        test('is definition message header (bit 6 = 1)', () => {
            expect(nthBit(res[0], 6)).toBe(1);
        });
        test('local message number is 0 (bit 0-3 = 0)', () => {
            expect(res[0] & 0b00001111).toBe(0);
        });
    });

    test('reserved byte (byte 1)', () => {
        expect(res[1]).toBe(0);
    });
    test('architecture 0 (byte 2)', () => {
        expect(res[2]).toBe(0);
    });
    test('global message number (byte 3-5)', () => {
        expect(getUint16(res.slice(3, 5))).toBe(0);
    });
    test('number of fields (byte 5)', () => {
        expect(res[5]).toBe(5);
    });

    describe('field time created (byte 6-8)', () => {
        test('field definition number (byte 6)', () => {
            expect(res[6]).toBe(4);
        });
        test('field size (byte 7)', () => {
            expect(res[7]).toBe(4);
        });
        test('field base type (byte 8)', () => {
            expect(res[8]).toBe(134);
        });
    });

});

describe('reads File Id data message', () => {
    let uint8Array = new Uint8Array([0, 138, 26, 40, 59, 4, 1, 0, 0, 0, 0, 4]);
    let view = new DataView(uint8Array.buffer);

    let res = fit.data.read(lmd.fileId, view);
    //  res = {
    //     type: 'data',
    //     message: 'file_id',
    //     local_number: 0,
    //     fields: {
    //         time_created: 992483978,
    //         manufacturer: 260,
    //         product:      0,
    //         number:       0,
    //         type:         4
    //     }
    // };

    describe('data messege result object', () => {
        test('type', () => {
            expect(res.type).toBe('data');
        });
        test('message', () => {
            expect(res.message).toBe('file_id');
        });
        test('local number', () => {
            expect(res.local_number).toBe(0);
        });
        test('field time created', () => {
            expect(res.fields.time_created).toBe(992483978);
        });
        test('field manufacturer', () => {
            expect(res.fields.manufacturer).toBe(260);
        });
        test('field product', () => {
            expect(res.fields.product).toBe(0);
        });
        test('field number', () => {
            expect(res.fields.number).toBe(0);
        });
        test('field type', () => {
            expect(res.fields.type).toBe(4);
        });
    });
});

describe('encodes File Id data message', () => {
    const values = {
        time_created: 992483978,
        manufacturer: 260,
        product:      0,
        number:       0,
        type:         4
    };

    let FITjs = {
        type: "data",
        message: "file_id",
        local_number: 0,
        fields: {
            manufacturer: 260, number: 0, product: 0, serial_number: 0, time_created: 992483978, type: 4,
        }
    };

    let res = fit.data.encode(lmd.fileId, values);
    //  res = new Uint8Array([0, 138, 26, 40, 59, 4, 1, 0, 0, 0, 0, 4]);

    describe('data messege header (byte 0)', () => {
        test('is normal header (bit 7 = 0)', () => {
            expect(nthBit(res[0], 7)).toBe(0);
        });
        test('is data message header (bit 6 = 0)', () => {
            expect(nthBit(res[0], 6)).toBe(0);
        });
        test('local message number is 0 (bit 0-3 = 0)', () => {
            expect(res[0] & 0b00001111).toBe(0);
        });
    });

    describe('data record content', () => {
        test('time created (byte 1-4)', () => {
            expect(getUint32(res.slice(1,5))).toBe(values.time_created);
        });
        test('manufacturer (byte 5-6)', () => {
            expect(getUint16(res.slice(5,7))).toBe(values.manufacturer);
        });
        test('product (byte 7-8)', () => {
            expect(getUint16(res.slice(7,9))).toBe(values.product);
        });
        test('number (byte 9-10)', () => {
            expect(getUint16(res.slice(9,11))).toBe(values.number);
        });
        test('type (byte 11)', () => {
            expect(res[11]).toBe(values.type);
        });
    });

    test('correct length', () => {
        expect(res.byteLength).toBe(12);
    });

    test('from FIT js', () => {
        let res = fit.data.encode(lmd.fileId, FITjs.fields);
        expect(Array.from(res)).toStrictEqual([0, 138, 26, 40, 59, 4, 1, 0, 0, 0, 0, 4]);
    });
});

describe('reads Event definition message', () => {
    let buffer = new Uint8Array([
        66, 0, 0, 21,0, 6,  253,4,134, 3,4,134, 2,2,132, 0,1,0, 1,1,0, 4,1,2,
    ]).buffer;
    let view = new DataView(buffer);

    let res = fit.definition.read(view);

    test('Lap definition', () => {
        expect(res).toEqual({
            type: 'definition',
            message: 'event',
            local_number: 2,
            length: 6+18,
            data_msg_length: 1+13,
            fields: [
                {field: 'timestamp',   number: 253, size: 4, base_type: 134},
                {field: 'data',        number:   3, size: 4, base_type: 134},
                {field: 'data16',      number:   2, size: 2, base_type: 132},
                {field: 'event',       number:   0, size: 1, base_type: 0},
                {field: 'event_type',  number:   1, size: 1, base_type: 0},
                {field: 'event_group', number:   4, size: 1, base_type: 2},
            ]
        });
    });
});

describe('reads Lap definition message', () => {
    let buffer = new Uint8Array([
        68, 0, 0, 19,0, 9, 253,4,134, 2,4,134, 7,4,134, 8,4,134, 254,2,132, 0,1,0, 1,1,0, 26,1,2, 24,1,2,
    ]).buffer;
    let view = new DataView(buffer);

    let res = fit.definition.read(view);

    test('Lap definition', () => {
        expect(res).toEqual({
            type: 'definition',
            message: 'lap',
            local_number: 4,
            length: 6+27,
            data_msg_length: 1+22,
            fields: [
                {field: 'timestamp',          number: 253, size: 4, base_type: 134},
                {field: 'start_time',         number:   2, size: 4, base_type: 134},
                {field: 'total_elapsed_time', number:   7, size: 4, base_type: 134},
                {field: 'total_timer_time',   number:   8, size: 4, base_type: 134},
                {field: 'message_index',      number: 254, size: 2, base_type: 132},
                {field: 'event',              number:   0, size: 1, base_type: 0},
                {field: 'event_type',         number:   1, size: 1, base_type: 0},
                {field: 'event_group',        number:  26, size: 1, base_type: 2},
                {field: 'lap_trigger',        number:  24, size: 1, base_type: 2},
            ]
        });
    });
});

describe('encodes footer messages', () => {
    const summary = {
        power:     {avg:  292, max: 300},
        cadence:   {avg:   84, max: 86},
        speed:     {avg: 9258, max: 9589},
        heartRate: {avg:  150, max: 150},
        distance:  2941,
        timeStart: 965747728,
        timeEnd:   965747731,
        elapsed:   3,
    };

    const values = {
        event: {
            timestamp:   summary.timeEnd,
            event:       appTypes.event.values.timer,
            event_type:  appTypes.event_type.values.stop_all,
            event_group: 0,
        },
        lap: {
            timestamp:          summary.timeEnd,
            start_time:         summary.timeStart,
            total_elapsed_time: summary.elapsed,
            total_timer_time:   summary.elapsed,
            message_index:      0,
            event:              appTypes.event.values.lap,
            event_type:         appTypes.event_type.values.stop,
            event_group:        0,
            lap_trigger:        appTypes.lap_trigger.values.manual,
        },
        session: {
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
        },
        activity: {
            timestamp:       summary.timeEnd,
            local_timestamp: summary.timeEnd,
            num_sessions:    1,
            type:            appTypes.activity.values.manual,
            event:           appTypes.event.values.activity,
            event_type:      appTypes.event_type.values.stop,
            event_group:     0,
        }
    };

    describe('encodes event data message', () => {
        let event = fit.data.encode(lmd.event, values.event);

        let res = [2,  19,36,144,57,  0,0,0,0,  0,0,  0, 4, 0];
        let view = new DataView(event.buffer);

        test('event message', () => {
            expect(Array.from(event)).toStrictEqual(res);
            expect(view.getUint32(1, true)).toBe(965747731);
            expect(view.getUint32(5, true)).toBe(0);
            expect(view.getUint16(9, true)).toBe(0);
            expect(view.getUint8(11, true)).toBe(0);
            expect(view.getUint8(12, true)).toBe(4);
            expect(view.getUint8(13, true)).toBe(0);
        });
    });

    describe('encodes lap definition message', () => {
        let definition = fit.definition.encode(lmd.lap);
        let res = [68, 0, 0, 19,0, 9,  253,4,134, 2,4,134, 7,4,134, 8,4,134, 254,2,132, 0,1,0, 1,1,0, 26,1,2, 24,1,2];

        test('lap definition', () => {
            expect(Array.from(definition)).toStrictEqual(res);
        });
    });

    describe('encodes lap data message', () => {
        let lap = fit.data.encode(lmd.lap, values.lap);

        let res = [4,  19,36,144,57,  16,36,144,57,  3,0,0,0,  3,0,0,0,  0,0, 9, 1, 0, 0];
        let view = new DataView(lap.buffer);

        test('lap data', () => {
            expect(Array.from(lap)).toStrictEqual(res);
            expect(view.getUint32(1, true)).toBe(965747731);
            expect(view.getUint32(5, true)).toBe(965747728);
            expect(view.getUint32(9, true)).toBe(3);
            expect(view.getUint32(13, true)).toBe(3);
            expect(view.getUint16(17, true)).toBe(0);
            expect(view.getUint8(19, true)).toBe(9);
            expect(view.getUint8(20, true)).toBe(1);
            expect(view.getUint8(21, true)).toBe(0);
            expect(view.getUint8(22, true)).toBe(0);
        });
    });

    describe('encodes session definition message', () => {
        let definition = fit.definition.encode(lmd.session);
        let res = [69, 0, 0, 18,0, 18,  253,4,134, 2,4,134, 7,4,134, 8,4,134, 254,2,132, 25,2,132, 26,2,132,
                   5,1,0, 6,1,0, 20,2,132, 21,2,132, 18,1,2, 19,1,2, 14,2,132, 15,2,132, 16,1,2, 17,1,2, 9,4,134];
        test('session definition', () => {
            expect(Array.from(definition)).toStrictEqual(res);
        });
    });

    describe('encodes session data message', () => {
        let session = fit.data.encode(lmd.session, values.session);

        let res = [5,  19,36,144,57,  16,36,144,57,  3,0,0,0,  3,0,0,0,
                   0,0,  0,0,  1,0,  2,  58,
                   36,1,  44,1,  84, 86,  42,36,  117,37,  150, 150,  125,11,0,0];
        let view = new DataView(session.buffer);

        test('session message', () => {
            expect(Array.from(session)).toStrictEqual(res);

            expect(view.getUint32( 1, true)).toBe(965747731); // timestamp
            expect(view.getUint32( 5, true)).toBe(965747728); // start time
            expect(view.getUint32( 9, true)).toBe(3);         // total elapsed time
            expect(view.getUint32(13, true)).toBe(3);         // total timer time
            expect(view.getUint16(17, true)).toBe(0);         // message index
            expect(view.getUint16(19, true)).toBe(0);         // first lap index
            expect(view.getUint16(21, true)).toBe(1);         // num laps
            expect(view.getUint8( 23, true)).toBe(2);         // sport
            expect(view.getUint8( 24, true)).toBe(58);        // sub sport
            expect(view.getUint16(25, true)).toBe(292);       // power avg
            expect(view.getUint16(27, true)).toBe(300);       // power max
            expect(view.getUint8( 29, true)).toBe(84);        // cadence avg
            expect(view.getUint8( 30, true)).toBe(86);        // cadence max
            expect(view.getUint16(31, true)).toBe(9258);      // speed avg
            expect(view.getUint16(33, true)).toBe(9589);      // speed max
            expect(view.getUint8( 35, true)).toBe(150);       // heart rate avg
            expect(view.getUint8( 36, true)).toBe(150);       // heart rate max
            expect(view.getUint32(37, true)).toBe(2941);      // distance
        });
    });

    describe('encodes activity definition message', () => {
        let definition = fit.definition.encode(lmd.activity);
        let res = [70, 0, 0, 34,0, 7,  253,4,134, 5,4,134, 1,2,132, 2,1,0, 3,1,0, 4,1,0, 6,1,2];
        test('activity definition', () => {
            expect(Array.from(definition)).toStrictEqual(res);
        });
    });

    describe('encodes activity data message', () => {
        let activity = fit.data.encode(lmd.activity, values.activity);
        let res = [6,  19,36,144,57,  19,36,144,57,  1,0,  0,  26,  1,  0];

        test('activity message', () => {
            expect(Array.from(activity)).toStrictEqual(res);
        });
    });
});

describe('reads Minimal FIT file', () => {
    const records = [
        // header
        [14, 32, 92,8,  52,0,0,0,  46,70,73,84,  123,197],
        // definition file id
        [64, 0, 0, 0,0, 5,  4,4,134  , 1,2,132  , 2,2,132  , 5,2,132  , 0,1,0],
        // data file id
        [0, 138,26,40,59,  4,1,  0,0,  0,0,  4],
        // definition record
        [65, 0, 0, 20,0, 2,  253,4,134, 7,2,132],
        // data record
        [1, 138,26,40,59,  44,1],
        // crc
        [242, 7]
    ];
    let recordsLength = records.flat().length;

    let buffer = new Uint8Array([...records.flat()]).buffer;
    let view   = new DataView(buffer);

    let activity = fit.activity.read(view);

    describe('correct input', () => {
        test('length', () => {
            expect(view.byteLength).toBe(68);
        });
    });

    describe('activity length', () => {
        test('length', () => {
            expect(activity.length).toBe(6);
        });
    });

    describe('reads minimal activity', () => {
        test('header', () => {
            expect(activity[0]).toEqual({
                type: 'header',
                length: 14,
                protocolVersion: '2.0',
                profileVersion: '21.40',
                dataRecordsLength: 52,
                fileType: '.FIT',
                crc: 50555});
        });
        test('definition file id', () => {
            expect(activity[1]).toEqual({
                type: 'definition', message: 'file_id', local_number: 0,
                length: 21, data_msg_length: 12, fields: [
                    {field: 'time_created', number: 4, size: 4, base_type: 134},
                    {field: 'manufacturer', number: 1, size: 2, base_type: 132},
                    {field: 'product',      number: 2, size: 2, base_type: 132},
                    {field: 'number',       number: 5, size: 2, base_type: 132},
                    {field: 'type',         number: 0, size: 1, base_type: 0},]});
        });
        test('data file id', () => {
            expect(activity[2]).toEqual({
                type: 'data', message: 'file_id', local_number: 0, fields: {
                    time_created: 992483978,
                    manufacturer: 260,
                    product:      0,
                    number:       0,
                    type:         4
                }});
        });
        test('crc', () => {
            expect(activity[5]).toEqual({type: 'crc', value: 2034});
        });
    });
});

describe('makes summary', () => {
    const activity = data.activity;
    const summary  = fit.summary.calculate(activity);

    test('is data records', () => {
        expect(fit.summary.isDataRecord({})).toBe(false);
        expect(fit.summary.isDataRecord([])).toBe(false);
        expect(fit.summary.isDataRecord({type: 'definition', message: 'record'})).toBe(false);
        expect(fit.summary.isDataRecord({type: 'data', message: 'event'})).toBe(false);
        expect(fit.summary.isDataRecord({type: 'data', message: 'record'})).toBe(true);
    });

    test('filters data records', () => {
        expect(fit.summary.getDataRecords(activity).length).toBe(4);
    });

    test('calculates accumulated values', () => {
        let dataRecords = fit.summary.getDataRecords(activity);

        let res = {power:     {avg:  292, max: 300},
                   cadence:   {avg:   84, max: 86},
                   speed:     {avg: 9258, max: 9589},
                   heartRate: {avg:  150, max: 150}};

        expect(fit.summary.accumulations(dataRecords)).toEqual(res);
    });

    test('calculates summary object', () => {

        let res = {
            power:     {avg:  292, max: 300},
            cadence:   {avg:   84, max: 86},
            speed:     {avg: 9258, max: 9589},
            heartRate: {avg:  150, max: 150},
            distance:  2941,
            timeStart: 965747728,
            timeEnd:   965747731,
            elapsed:   3,
        };

        expect(summary).toEqual(res);
    });

    describe('summary object to FITjs footer', () => {
        let footer = fit.summary.toFooter(summary, false);

        test('footer length', () => {
            expect(footer.length).toBe(7);
        });
        test('footer structure', () => {
            expect(footer[0].type).toBe('data');
            expect(footer[0].message).toBe('event');

            expect(footer[1].type).toBe('definition');
            expect(footer[1].message).toBe('lap');
            expect(footer[2].type).toBe('data');
            expect(footer[2].message).toBe('lap');

            expect(footer[3].type).toBe('definition');
            expect(footer[3].message).toBe('session');
            expect(footer[4].type).toBe('data');
            expect(footer[4].message).toBe('session');

            expect(footer[5].type).toBe('definition');
            expect(footer[5].message).toBe('activity');
            expect(footer[6].type).toBe('data');
            expect(footer[6].message).toBe('activity');
        });
    });
});

describe('encodes FIT activity file', () => {

    let definitions = fit.activity.toDefinitions(data.activity);
    let fileLength  = fit.activity.toFileLength(data.activity, definitions);

    let encoded = fit.activity.encode(data.activity3R);
    let decoded = fit.activity.read(new DataView(encoded.buffer));

    describe('to message definitions collection', () => {
        test('definitions', () => {
            expect(definitions).toEqual({
                0: data.activity[1],
                1: data.activity[3],
                3: data.activity[5],
                2: data.activity[6]
            });
        });
    });

    describe('to fit file length', () => {
        test('length', () => {
            expect(fileLength).toBe(12+24+16+39+25+51+24+14+(4*37)+2);
        });
    });

    describe('encode', () => {
        test('adds crc if missing', () => {
            data.activity3R.push({type: 'crc', value: 7609});
            expect(decoded).toEqual(data.activity3R);
        });
    });
});

