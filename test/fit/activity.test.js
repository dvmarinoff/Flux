import { activity } from '../../src/fit/activity.js';



describe('constructs FITjs Data', () => {
    test('for Record', () => {
        const recordDefinition = {
            type: 'definition',
            message: 'record',
            local_number: 3,
            length: 6+0,
            data_msg_length: 1+0,
            fields: [
                {field: 'timestamp',  number: 253, size: 4, base_type: 134},
                {field: "heart_rate", number:   3, size: 1, base_type: 2},
                {field: "power",      number:   7, size: 2, base_type: 132},
                {field: "cadence",    number:   4, size: 1, base_type: 2},
            ]
        };

        let msg = activity.Data({
            values: {
                timestamp: 1630586303108,
                power: 180,
                cadence: 80,
            },
            transforms: { timestamp: activity.toFitTimestamp },
            definition: recordDefinition,
            defaults: {
                heart_rate: 0,
                power: 0,
                cadence: 0
            }
        });

        let res = {
            type: 'data',
            message: 'record',
            local_number: 3,
            fields: {
                timestamp: 999520703,
                heart_rate: 0,
                power: 180,
                cadence: 80,
            },
        };

        expect(msg).toEqual(res);
    });
});

describe('constructs FITjs Message', () => {

    test('File Id', () => {
        let msg = activity.FileId({time_created: 1630508400000});
        let res = {
            type: 'data',
            message: 'file_id',
            local_number: 0,
            fields: {
                time_created: 999442800,
                manufacturer: 255,
                product:      0,
                number:       0,
                type:         4
            },
        };

        expect(msg).toEqual(res);
    });

    test('Event', () => {
        let msg = activity.Event({timestamp: 1630508409000, event_type: 4});
        let res = {
            type: 'data',
            message: 'event',
            local_number: 2,
            fields: {
                timestamp: 999442809,
                event: 0,
                event_type: 4,
                event_group: 0,
            },
        };

        expect(msg).toEqual(res);
    });

    test('Record', () => {
        let msg = activity.Record({
            timestamp: 1630508400000,
            power: 180,
            cadence: 80,
            speed: 28.30,
            distance: 40.10,
        });
        let res = {
            type: 'data',
            message: 'record',
            local_number: 3,
            fields: {
                timestamp: 999442800,
                heart_rate: 0,
                power: 180,
                cadence: 80,
                speed: 7861,
                distance: 4010000,
            },
        };

        expect(msg).toEqual(res);
    });

    test('Lap', () => {
        let msg = activity.Lap({
            timestamp:  1630508409000,
            start_time: 1630508400000,
            message_index: 1,
        });
        let res = {
            type: 'data',
            message: 'lap',
            local_number: 4,
            fields: {
                timestamp:  999442809,
                start_time: 999442800,
                total_elapsed_time: 10000,
                total_timer_time:   10000,
                event: 9,
                event_type: 1,
                message_index: 1,
            },
        };

        expect(msg).toEqual(res);
    });

    test('Session', () => {
        let msg = activity.Session({
            timestamp:  1630508409000,
            start_time: 1630508400000,

            message_index: 0,
            num_laps: 1,

            avg_power: 180,
            max_power: 193,
            avg_cadence: 80,
            max_cadence: 83,
            avg_speed: 30, // km/h
            max_speed: 31, // km/h
            avg_heart_rate: 144,
            max_heart_rate: 160,
            total_distance: 5.000, // km
        });
        let res = {
            type: 'data',
            message: 'session',
            local_number: 5,
            fields: {
                timestamp:  999442809,
                start_time: 999442800,
                total_elapsed_time: 10000,
                total_timer_time:   10000,

                message_index: 0,
                first_lap_index: 0,
                num_laps: 1,
                sport: 2,
                sub_sport: 58,

                avg_power: 180,
                max_power: 193,
                avg_cadence: 80,
                max_cadence: 83,
                avg_speed: 8333,
                max_speed: 8611,
                avg_heart_rate: 144,
                max_heart_rate: 160,
                total_distance: 500000,
            },
        };

        expect(msg).toEqual(res);
    });

    test('Activity', () => {
        let msg = activity.Activity({
            timestamp: 1630586903108,
        });
        let res = {
            type: 'data',
            message: 'activity',
            local_number: 6,
            fields: {
                timestamp: 999521303,
                local_timestamp: 0,
                num_sessions: 1,
                type: 0,
                event: 26,
                event_type: 1,
            },
        };

        expect(msg).toEqual(res);
    });
});

describe('construct FITjs Activity', () => {
    test('', () => {
        const data = {
            records: [
                {timestamp: 1630508400000, power: 180, speed: 27.00, cadence: 80, heart_rate: 135, distance: 0.0075},
                {timestamp: 1630508401000, power: 183, speed: 27.00, cadence: 81, heart_rate: 135, distance: 0.0150},
                {timestamp: 1630508402000, power: 178, speed: 27.00, cadence: 82, heart_rate: 135, distance: 0.0225},
                {timestamp: 1630508403000, power: 179, speed: 27.00, cadence: 81, heart_rate: 135, distance: 0.0300},

                {timestamp: 1630508404000, power: 179, speed: 27.00, cadence: 81, heart_rate: 135, distance: 0.0375},
                {timestamp: 1630508405000, power: 179, speed: 27.00, cadence: 81, heart_rate: 135, distance: 0.0450},
                {timestamp: 1630508406000, power: 180, speed: 27.00, cadence: 83, heart_rate: 135, distance: 0.0525},
                {timestamp: 1630508407000, power: 180, speed: 27.00, cadence: 80, heart_rate: 135, distance: 0.0600},
            ],
            laps: [
                {timestamp: 1630508403000, startTime: 1630508400000},
                {timestamp: 1630508407000, startTime: 1630508404000},
            ],
            now: 1630508407000,
        };
        const fitjsActivity = activity.encode(data);
        const res = [
            {type: 'header', length: 14, protocolVersion: '2.0', profileVersion: '21.40', dataRecordsLength: undefined},
            {type: 'definition', message: 'file_id', local_number: 0, length: 6+15, data_msg_length: 1+11, fields: [
                {field: 'time_created', number: 4, size: 4, base_type: 134},
                {field: 'manufacturer', number: 1, size: 2, base_type: 132},
                {field: 'product',      number: 2, size: 2, base_type: 132},
                {field: 'number',       number: 5, size: 2, base_type: 132},
                {field: 'type',         number: 0, size: 1, base_type: 0},]
            },
            {type: "data", message: "file_id", local_number: 0,
             fields: {manufacturer: 255, number: 0, product: 0, time_created: 999442800, type: 4,}
            },
            {type: 'definition', message: 'event', local_number: 2, length: 6+12, data_msg_length: 1+7, fields: [
                {field: 'timestamp',   number: 253, size: 4, base_type: 134},
                {field: 'event',       number:   0, size: 1, base_type: 0},
                {field: 'event_type',  number:   1, size: 1, base_type: 0},
                {field: 'event_group', number:   4, size: 1, base_type: 2},]
            },
            {type: 'data', message: 'event', local_number: 2, fields: {
                timestamp: 999442800, event: 0, event_type: 0, event_group: 0,},
            },

            // Records
            {type: 'definition', message: 'record', local_number: 3, length: 6+18, data_msg_length: 1+14, fields: [
                {field: 'timestamp',  number: 253, size: 4, base_type: 134},
                {field: "distance",   number: 5, size: 4, base_type: 134},
                {field: "heart_rate", number: 3, size: 1, base_type: 2},
                {field: "speed",      number: 6, size: 2, base_type: 132},
                {field: "power",      number: 7, size: 2, base_type: 132},
                {field: "cadence",    number: 4, size: 1, base_type: 2},]
            },

            {type: 'data', message: 'record', local_number: 3, fields: {
                timestamp: 999442800, heart_rate: 135, power: 180, cadence: 80, speed: 7500, distance: 750,},
            },
            {type: 'data', message: 'record', local_number: 3, fields: {
                timestamp: 999442801, heart_rate: 135, power: 183, cadence: 81, speed: 7500, distance: 1500,},
            },
            {type: 'data', message: 'record', local_number: 3, fields: {
                timestamp: 999442802, heart_rate: 135, power: 178, cadence: 82, speed: 7500, distance: 2250,},
            },
            {type: 'data', message: 'record', local_number: 3, fields: {
                timestamp: 999442803, heart_rate: 135, power: 179, cadence: 81, speed: 7500, distance: 3000,},
            },

            {type: 'data', message: 'record', local_number: 3, fields: {
                timestamp: 999442804, heart_rate: 135, power: 179, cadence: 81, speed: 7500, distance: 3750,},
            },
            {type: 'data', message: 'record', local_number: 3, fields: {
                timestamp: 999442805, heart_rate: 135, power: 179, cadence: 81, speed: 7500, distance: 4500,},
            },
            {type: 'data', message: 'record', local_number: 3, fields: {
                timestamp: 999442806, heart_rate: 135, power: 180, cadence: 83, speed: 7500, distance: 5250,},
            },
            {type: 'data', message: 'record', local_number: 3, fields: {
                timestamp: 999442807, heart_rate: 135, power: 180, cadence: 80, speed: 7500, distance: 6000,},
            },
            // End Records

            {type: 'data', message: 'event', local_number: 2, fields: {
                timestamp: 999442807, event: 0, event_type: 4, event_group: 0,},
            },

            // Laps
            {type: 'definition', message: 'lap', local_number: 4, length: 6+21, data_msg_length: 1+20, fields: [
                {field: 'timestamp',          number: 253, size: 4, base_type: 134},
                {field: 'start_time',         number:   2, size: 4, base_type: 134},
                {field: 'total_elapsed_time', number:   7, size: 4, base_type: 134},
                {field: 'total_timer_time',   number:   8, size: 4, base_type: 134},
                {field: 'message_index',      number: 254, size: 2, base_type: 132},
                {field: 'event',              number:   0, size: 1, base_type: 0},
                {field: 'event_type',         number:   1, size: 1, base_type: 0},]
            },
            {type: 'data', message: 'lap', local_number: 4, fields: {
                timestamp: 999442803, start_time: 999442800, total_elapsed_time: 4000, total_timer_time: 4000, event: 9, event_type: 1, message_index: 0,},
            },
            {type: 'data', message: 'lap', local_number: 4, fields: {
                timestamp: 999442807, start_time: 999442804, total_elapsed_time: 4000, total_timer_time: 4000, event: 9, event_type: 1, message_index: 1,},
            },
            // End Laps

            {type: 'definition', message: 'session', local_number: 5, length: 6+(18*3), data_msg_length: 1+40, fields: [
                {field: 'timestamp',          number: 253, size: 4, base_type: 134},
                {field: 'start_time',         number:   2, size: 4, base_type: 134},
                {field: 'total_elapsed_time', number:   7, size: 4, base_type: 134},
                {field: 'total_timer_time',   number:   8, size: 4, base_type: 134},

                {field: 'message_index',      number: 254, size: 2, base_type: 132},
                {field: 'first_lap_index',    number:  25, size: 2, base_type: 132},
                {field: 'num_laps',           number:  26, size: 2, base_type: 132},
                {field: 'sport',              number:   5, size: 1, base_type: 0},
                {field: 'sub_sport',          number:   6, size: 1, base_type: 0},

                {field: 'avg_power',          number:   20, size: 2, base_type: 132},
                {field: 'max_power',          number:   21, size: 2, base_type: 132},
                {field: 'avg_cadence',        number:   18, size: 1, base_type: 2},
                {field: 'max_cadence',        number:   19, size: 1, base_type: 2},
                {field: 'avg_speed',          number:   14, size: 2, base_type: 132},
                {field: 'max_speed',          number:   15, size: 2, base_type: 132},
                {field: 'avg_heart_rate',     number:   16, size: 1, base_type: 2},
                {field: 'max_heart_rate',     number:   17, size: 1, base_type: 2},
                {field: 'total_distance',     number:    9, size: 4, base_type: 134},]
            },
            {type: 'data', message: 'session', local_number: 5, fields: {
                timestamp: 999442807,
                start_time: 999442800,
                total_elapsed_time: 8000,
                total_timer_time:   8000,
                message_index: 0,
                first_lap_index: 0,
                num_laps: 1,
                sport: 2,
                sub_sport: 58,
                avg_power: 179, // 179.75
                max_power: 183,
                avg_cadence: 81, // 81.125
                max_cadence: 83,
                avg_speed: 7500,
                max_speed: 7500,
                avg_heart_rate: 135,
                max_heart_rate: 135,
                total_distance: 6000,},
            },
            {type: 'definition', message: 'activity', local_number: 6, length: 6+(6*3), data_msg_length: 1+13, fields: [
                {field: 'timestamp',        number: 253, size: 4, base_type: 134},
                {field: 'local_timestamp',  number:   5, size: 4, base_type: 134},
                {field: 'num_sessions',     number:   1, size: 2, base_type: 132},
                {field: 'type',             number:   2, size: 1, base_type: 0},
                {field: 'event',            number:   3, size: 1, base_type: 0},
                {field: 'event_type',       number:   4, size: 1, base_type: 0},]
            },
            {type: 'data', message: 'activity', local_number: 6, fields: {
                timestamp: 999442807, local_timestamp: 0, num_sessions: 1, type: 0, event: 26, event_type: 1,},
            }
        ];

        expect(fitjsActivity).toStrictEqual(res);
    });
});

// describe('', () => {
//     test('', () => {
//         expect().toBe();
//     });
// });
