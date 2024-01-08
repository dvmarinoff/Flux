// App Data Input

// Records
const records = [
    {
        timestamp: 1669140869000,  // 1038075269, 133, 197, 223, 61,
        position_lat: -128450465,  // sint32, semicircles, 95, 0, 88, 248,
        position_long: 1978610201, // sint32, semicircles,  25, 50, 239, 117,
        altitude: 87,              // uint16, scale 5, offset 500, m, 2935, 119, 11,
        heart_rate: 90,            // uint8, bpm, 90
        cadence: 70,               // uint8, rpm, 70
        distance: 7.66,            // uint32, scale 100, m, 766, 254, 2, 0, 0,
        speed: 6.717,              // uint16, scale 1000, m/s, 6717, 61, 26,
        power: 160,                // uint16, w, 160, 0,
        grade: 0,                  // sint16, scale 100, %, 0, 0,
        device_index: 0,           // uint8, 0
    },
    {
        timestamp: 1669140870000,  // 1038075270, 134, 197, 223, 61,
        position_lat: -128449747,  // sint32, semicircles, 45, 3, 88, 248,
        position_long: 1978610154, // sint32, semicircles, 234, 49, 239, 117,
        altitude: 87,              // uint16, scale 5, offset 500, m, 2935, 119, 11,
        heart_rate: 91,            // uint8, bpm,
        cadence: 71,               // uint8, rpm
        distance: 14.36,           // uint32, scale 100, m, 156, 5, 0, 0,
        speed: 6.781,              // uint16, scale 1000, m/s, 6781, 125, 26,
        power: 161,                // uint16, w, 161, 0,
        grade: 0,                  // sint16, scale 100, %, 0, 0,
        device_index: 0,           // uint8, 0
    },
    {
        timestamp: 1669140871000,  // 1038075271, 135, 197, 223, 61,
        position_lat: -128449037,  // sint32, semicircles, 243, 5, 88, 248,
        position_long: 1978609898, // sint32, semicircles, 234, 48, 239, 117,
        altitude: 87,              // uint16, scale 5, offset 500, m, 2935, 119, 11,
        heart_rate: 92,            // uint8, bpm
        cadence: 72,               // uint8, rpm
        distance:	21.34,           // uint32, scale 100, m, 86, 8, 0, 0,
        speed: 7.08,               // uint16, scale 1000, m/s, 7080, 168, 27,
        power: 162,                // uint16, w, 162, 0,
        grade: 0,                  // sint16, scale 100, %, 0, 0,
        device_index: 0,           // uint8, 0
    },
    {
        timestamp: 1669140872000,  // 1038075272, 136, 197, 223, 61,
        position_lat: -128448324,  // sint32, semicircles, 188, 8, 88, 248,
        position_long: 1978609588, // sint32, semicircles, 180, 47, 239, 117,
        altitude: 87,              // uint16, scale 5, offset 500, m, 2935, 119, 11,
        heart_rate: 93,            // uint8, bpm
        cadence: 73,               // uint8, rpm
        distance:	28.56,           // uint32, scale 100, m, 40, 11, 0, 0,
        speed: 7.498,              // uint16, scale 1000, m/s, 7498, 74, 29,
        power: 163,                // uint16, w, 163, 0,
        grade: 0,                  // sint16, scale 100, %, 0, 0,
        device_index: 0,           // uint8, 0
    },
];

// Laps
const laps = [
    {
        start_time: 1669140869000, // start time
        timestamp: 1669140872000,  // end time
    },
];

const appData = {records, laps};
// END App Data



// Expected FITjs
function FITjs(args = {}) {
    const headerCRC = args.crc ? 40815 : 0;
    const fileCRC   = args.crc ? 14083 : undefined;

    return [
        // file header
        {
            type: 'header',
            length: 14,
            headerSize: 14,
            protocolVersion: '2.0',
            profileVersion: '21.40',
            dataSize: 383,
            dataType: '.FIT',
            crc: headerCRC,
        },
        // definition file_id
        {
            type: 'definition',
            name: 'file_id',
            architecture: 0,
            local_number: 0,
            length: 21,
            data_record_length: 12,
            fields: [
                {number: 4, size: 4, base_type: 'uint32'},
                {number: 1, size: 2, base_type: 'uint16'},
                {number: 2, size: 2, base_type: 'uint16'},
                {number: 5, size: 2, base_type: 'uint16'},
                {number: 0, size: 1, base_type: 'enum'},
            ]
        },
        // data file_id
        {
            type: 'data',
            name: 'file_id',
            local_number: 0,
            length: 12,
            fields: {
                time_created: 1669140872000,
                manufacturer: 255,
                product:      0,
                number:       0,
                type:         4,
            },
        },
        // definition record
        {
            type: 'definition',
            name: 'record',
            architecture: 0,
            local_number: 3,
            length: 39,
            data_record_length: 28,
            fields: [
                {number: 253, size: 4, base_type: 'uint32'}, // timestamp
                {number:   0, size: 4, base_type: 'sint32'}, // position_lat
                {number:   1, size: 4, base_type: 'sint32'}, // position_long
                {number:   2, size: 2, base_type: 'uint16'}, // altitude
                {number:   3, size: 1, base_type: 'uint8'},  // heart_rate
                {number:   4, size: 1, base_type: 'uint8'},  // cadence
                {number:   5, size: 4, base_type: 'uint32'}, // distance
                {number:   6, size: 2, base_type: 'uint16'}, // speed
                {number:   7, size: 2, base_type: 'uint16'}, // power
                {number:   9, size: 2, base_type: 'sint16'}, // grade
                {number:  62, size: 1, base_type: 'uint8'},  // device_index
            ]
        },
        // data record messages
        {
            type: 'data',
            name: 'record',
            local_number: 3,
            length: 28,
            fields: {
                timestamp: 1669140869000,  //
                position_lat: -128450465,  // sint32, semicircles
                position_long: 1978610201, // sint32, semicircles
                altitude: 87,              // uint16, scale 5, offset 500, m
                heart_rate: 90,            // uint8, bpm
                cadence: 70,               // uint8, rpm
                distance: 7.66,            // uint32, scale 100, m
                speed: 6.717,              // uint16, scale 1000, m/s
                power: 160,                // uint16, w
                grade: 0,                  // sint16, scale 100, %
                device_index: 0,           // uint8, 0
            }
        },
        {
            type: 'data',
            name: 'record',
            local_number: 3,
            length: 28,
            fields: {
                timestamp: 1669140870000,  //
                position_lat: -128449747,  // sint32, semicircles
                position_long: 1978610154, // sint32, semicircles
                altitude: 87,              // uint16, scale 5, offset 500, m
                heart_rate: 91,            // uint8, bpm
                cadence: 71,               // uint8, rpm
                distance: 14.36,           // uint32, scale 100, m
                speed: 6.781,              // uint16, scale 1000, m/s
                power: 161,                // uint16, w
                grade: 0,                  // sint16, scale 100, %
                device_index: 0,           // uint8, 0
            }
        },
        {
            type: 'data',
            name: 'record',
            local_number: 3,
            length: 28,
            fields: {
                timestamp: 1669140871000,  //
                position_lat: -128449037,  // sint32, semicircles
                position_long: 1978609898, // sint32, semicircles
                altitude: 87,              // uint16, scale 5, offset 500, m
                heart_rate: 92,            // uint8, bpm
                cadence: 72,               // uint8, rpm
                distance:	21.34,           // uint32, scale 100, m
                speed: 7.08,               // uint16, scale 1000, m/s
                power: 162,                // uint16, w
                grade: 0,                  // sint16, scale 100, %
                device_index: 0,           // uint8, 0
            }
        },
        {
            type: 'data',
            name: 'record',
            local_number: 3,
            length: 28,
            fields: {
                timestamp: 1669140872000,  //
                position_lat: -128448324,  // sint32, semicircles
                position_long: 1978609588, // sint32, semicircles
                altitude: 87,              // uint16, scale 5, offset 500, m
                heart_rate: 93,            // uint8, bpm
                cadence: 73,               // uint8, rpm
                distance:	28.56,           // uint32, scale 100, m
                speed: 7.498,              // uint16, scale 1000, m/s
                power: 163,                // uint16, w
                grade: 0,                  // sint16, scale 100, %
                device_index: 0,           // uint8, 0
            }
        },
        // definition lap
        {
            type: 'definition',
            name: 'lap',
            architecture: 0,
            local_number: 4,
            length: 27,
            data_record_length: 21,
            fields: [
                {number: 253, size: 4, base_type: 'uint32'}, // timestamp
                {number: 2,   size: 4, base_type: 'uint32'}, // start_time
                {number: 7,   size: 4, base_type: 'uint32'}, // total_elapsed_time
                {number: 8,   size: 4, base_type: 'uint32'}, // total_timer_time
                {number: 254, size: 2, base_type: 'uint16'}, // message_index
                {number: 0,   size: 1, base_type: 'enum'},   // event
                {number: 1,   size: 1, base_type: 'enum'},   // event_type
            ]
        },
        // data lap
        {
            type: 'data',
            name: 'lap',
            local_number: 4,
            length: 21,
            fields: {
                timestamp:  1669140872000,
                start_time: 1669140869000,
                total_elapsed_time: 3,
                total_timer_time: 3,
                message_index: 0,
                event: 9,
                event_type: 1,
            },
        },
        // definition session
        {
            type: 'definition',
            architecture: 0,
            name: 'session',
            local_number: 5,
            length: 63,
            data_record_length: 43,
            fields: [
                {number: 253, size: 4, base_type: 'uint32'}, // timestamp
                {number: 2,   size: 4, base_type: 'uint32'}, // start_time
                {number: 7,   size: 4, base_type: 'uint32'}, // total_elapsed_time
                {number: 8,   size: 4, base_type: 'uint32'}, // total_timer_time
                {number: 254, size: 2, base_type: 'uint16'}, // message_index
                {number: 5,   size: 1, base_type: 'enum'},   // sport
                {number: 6,   size: 1, base_type: 'enum'},   // sub_sport
                {number: 9,   size: 4, base_type: 'uint32'}, // total_distance
                {number: 11,  size: 2, base_type: 'uint16'}, // total_calories
                {number: 14,  size: 2, base_type: 'uint16'}, // avg_speed
                {number: 15,  size: 2, base_type: 'uint16'}, // max_speed
                {number: 16,  size: 1, base_type: 'uint8'},  // avg_heart_rate
                {number: 17,  size: 1, base_type: 'uint8'},  // max_heart_rate
                {number: 18,  size: 1, base_type: 'uint8'},  // avg_cadence
                {number: 19,  size: 1, base_type: 'uint8'},  // max_cadence
                {number: 20,  size: 2, base_type: 'uint16'}, // avg_power
                {number: 21,  size: 2, base_type: 'uint16'}, // max_power
                {number: 25,  size: 2, base_type: 'uint16'}, // first_lap_index
                {number: 26,  size: 2, base_type: 'uint16'}, // num_laps
            ]
        },
        // data session
        {
            type: 'data',
            name: 'session',
            local_number: 5,
            length: 43,
            fields: {
                timestamp:  1669140872000,
                start_time: 1669140869000,
                total_elapsed_time: 3,
                total_timer_time: 3,
                message_index: 0,
                sport: 2,
                sub_sport: 58,
                total_distance: 28.56,
                total_calories: 0, // 0.4845
                avg_speed: 7.019,
                max_speed: 7.498,
                avg_heart_rate: 91, // 91.5
                max_heart_rate: 93,
                avg_cadence: 71, // 71.5
                max_cadence: 73,
                avg_power: 161, // 161.5
                max_power: 163,
                first_lap_index: 0,
                num_laps: 1,
            }
        },
        // definition activity
        {
            type: 'definition',
            architecture: 0,
            name: 'activity',
            local_number: 6,
            length: 27,
            data_record_length: 18,
            fields: [
                {number: 253, size: 4, base_type: 'uint32'}, // timestamp
                {number: 0,   size: 4, base_type: 'uint32'}, // total_timer_time
                {number: 1,   size: 2, base_type: 'uint16'}, // num_sessions
                {number: 2,   size: 1, base_type: 'enum'},   // type
                {number: 3,   size: 1, base_type: 'enum'},   // event
                {number: 4,   size: 1, base_type: 'enum'},   // event_type
                // {number: 5,   size: 4, base_type: 'uint32'}, // local_timestamp
            ]
        },
        // data activity
        {
            type: 'data',
            name: 'activity',
            local_number: 6,
            length: 18,
            fields: {
                timestamp: 1669140872000,
                total_timer_time: 3,
                num_sessions: 1,
                type: 0,
                event: 26,
                event_type: 1,
                // local_timestamp: 1669140872000,
            }
        },
        // crc
        {
            type: 'crc',
            length: 2,
            crc: fileCRC,
        }
    ];
};
// END expected FITjs



// Expected FIT binary
const fitBinary = [
    // header
    [
        14,           // header length
        32,           // profile version
        92,8,         // protocol version
        127,1,0,0,    // data size (without header and crc)
        46,70,73,84,  // data type (ASCII for ".FIT")
        111, 159,     // header crc
    ],
    // definition file_id
    [
        0b01000000,  // header, 64, 0b01000000
        0,           // reserved
        0,           // architecture
        0, 0,        // global number
        5,           // number of fields
        4, 4, 134,   // time_created
        1, 2, 132,   // manufacturer
        2, 2, 132,   // product
        5, 2, 132,   // number
        0, 1, 0,     // type
    ],
    // data file_id
    [
        0b00000000,        // header, 0, 0b00000000
        136, 197, 223, 61, // time_created
        255, 0,            // manufacturer
        0, 0,              // product
        0, 0,              // number
        4,                 // type
    ],
    // definition record
    [
        0b01000011,  // header, 69, 0b01000101
        0,           // reserved
        0,           // architecture
        20, 0,       // global number
        11,          // number of fields
        253, 4, 134, // timestamp
          0, 4, 133, // position_lat
          1, 4, 133, // position_long
          2, 2, 132, // altitude 935
          3, 1,   2, // heart_rate
          4, 1,   2, // cadence
          5, 4, 134, // distance 10000
          6, 2, 132, // speed 6000
          7, 2, 132, // power
          9, 2, 131, // grade 140
         62, 1,   2, // device_index
    ],
    // data record
    [
        0b0000011,         // header
        133, 197, 223, 61, // timestamp
        95, 0, 88, 248,    // position_lat
        25, 50, 239, 117,  // position_long
        119, 11,           // altitude 2935
        90,                // heart_rate
        70,                // cadence
        254, 2, 0, 0,      // distance
        61, 26,            // speed
        160, 0,            // power
        0, 0,              // grade
        0,                 // device_index
    ],
    [
        0b0000011,         // header
        134, 197, 223, 61, // timestamp
        45, 3, 88, 248,    // position_lat
        234, 49, 239, 117, // position_long
        119, 11,           // altitude 2935
        91,                // heart_rate
        71,                // cadence
        156, 5, 0, 0,      // distance
        125, 26,           // speed
        161, 0,            // power
        0, 0,              // grade
        0,                 // device_index
    ],
    [
        0b0000011,         // header
        135, 197, 223, 61, // timestamp
        243, 5, 88, 248,   // position_lat
        234, 48, 239, 117, // position_long
        119, 11,           // altitude 2935
        92,                // heart_rate
        72,                // cadence
        86, 8, 0, 0,       // distance
        168, 27,           // speed
        162, 0,            // power
        0, 0,              // grade
        0,                 // device_index
    ],
    [
        0b0000011,         // header
        136, 197, 223, 61, // timestamp
        188, 8, 88, 248,   // position_lat
        180, 47, 239, 117, // position_long
        119, 11,           // altitude 2935
        93,                // heart_rate
        73,                // cadence
        40, 11, 0, 0,      // distance
        74, 29,            // speed
        163, 0,            // power
        0, 0,              // grade
        0,                 // device_index
    ],
    // definition lap
    [
        0b01000100,  // header, 68, 0b01000100
        0,           // reserved
        0,           // architecture
        19, 0,       // global number
        7,           // number of fields
        253, 4, 134, // timestamp
          2, 4, 134, // start_time
          7, 4, 134, // total_elapsed_time
          8, 4, 134, // total_timer_time
        254, 2, 132, // message_index
          0, 1,   0, // event
          1, 1,   0, // event_type
    ],
    // data lap
    [
        0b00000100,        // header, 68, 0b00001000
        136, 197, 223, 61, // timestamp
        133, 197, 223, 61, // start_time
        184, 11, 0, 0,     // total_elapsed_time
        184, 11, 0, 0,     // total_timer_time
        0, 0,              // message_index
        9,                 // event
        1,                 // event_type
    ],

    // definition session
    [
        0b01000101,  // header, 69, 0b01000101
        0,           // reserved
        0,           // architecture
        18, 0,       // global number
        19,          // number of fields
        253, 4, 134, // timestamp
          2, 4, 134, // start_time
          7, 4, 134, // total_elapsed_time
          8, 4, 134, // total_timer_time
        254, 2, 132, // message_index
          5, 1,   0, // sport
          6, 1,   0, // sub_sport
          9, 4, 134, // total_distance
         11, 2, 132, // total_calories
         14, 2, 132, // avg_speed
         15, 2, 132, // max_speed
         16, 1,   2, // avg_heart_rate
         17, 1,   2, // max_heart_rate
         18, 1,   2, // avg_cadence
         19, 1,   2, // max_cadence
         20, 2, 132, // avg_power
         21, 2, 132, // max_power
         25, 2, 132, // first_lap_index
         26, 2, 132, // num_laps
    ],
    // data session
    [
        0b00000101,        // header, 5, 0b00000101
        136, 197, 223, 61, // timestamp
        133, 197, 223, 61, // start_time
        184, 11, 0, 0,     // total_elapsed_time
        184, 11, 0, 0,     // total_timer_time
        0, 0,              // message_index
        2,                 // sport
        58,                // sub_sport
        40, 11, 0, 0,      // total_distance
        0, 0,              // total_calories
        107, 27,           // avg_speed
        74, 29,            // max_speed
        91,                // avg_heart_rate
        93,                // max_heart_rate
        71,                // avg_cadence
        73,                // max_cadence
        161, 0,            // avg_power
        163, 0,            // max_power
        0, 0,              // first_lap_index
        1, 0,              // num_laps
    ],
    // definition activity
    [
        0b01000110,  // header, 70, 0b01000110
        0,           // reserved
        0,           // architecture
        34, 0,       // global number
        7,           // number of fields
        253, 4, 134, // timestamp
          0, 4, 134, // total_timer_time
          1, 2, 132, // num sessions
          2, 1,   0, // type
          3, 1,   0, // event
          4, 1,   0, // event_type
          // 5, 4, 134, // local_timestamp
    ],
    // data activity
    [
        0b00000110,        // header, 6, 0b00000110
        136, 197, 223, 61, // timestamp
        184,  11,   0,  0, // total_timer_time
        1, 0,              // num sessions
        0,                 // type
        26,                // event
        1,                 // stop
        // 136, 197, 223, 61, // local_timestamp
    ],
    // crc, needs to be computed last evetytime when encoding to binary
    [
        3,
        55,
    ],
];

const flatFitBinary = fitBinary.flat();
// END Expected FIT binary

export {
    appData,
    FITjs,
    fitBinary,
    flatFitBinary,
};

