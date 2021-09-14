
const activity = [
    {type: "header", protocolVersion: "1.0", profileVersion: "1.00", dataRecordsLength: 161521, length: 12, crc: false},
    {type: "definition", message: "file_id", local_number: 0, length: 24, data_msg_length: 16,
     fields: [
         {field: 'time_created', number: 4, size: 4, base_type: 134},
         {field: 'manufacturer', number: 1, size: 2, base_type: 132},
         {field: 'product',      number: 2, size: 2, base_type: 132},
         {field: 'number',       number: 5, size: 2, base_type: 132},
         {field: 'type',         number: 0, size: 1, base_type: 0},
     ]},
    {type: "data", message: "file_id", local_number: 0,
     fields: {
         manufacturer: 260, number: 0, product: 0, serial_number: 0, time_created: 992483978, type: 4,
    }},
    {type: "definition", message: "device_info", local_number: 1, length: 39, data_msg_length: 25,
     fields: [
         {field: "timestamp", number: 253, size: 4, base_type: 134},
         {field: "serial_number", number: 3, size: 4, base_type: 140},
         {field: "cum_operating_time", number: 7, size: 4, base_type: 134},
         {field: "manufacturer", number: 2, size: 2, base_type: 132},
         {field: "product", number: 4, size: 2, base_type: 132},
         {field: "software_version", number: 5, size: 2, base_type: 132},
         {field: "battery_voltage", number: 10, size: 2, base_type: 132},
         {field: "device_index", number: 0, size: 1, base_type: 2},
         {field: "device_type", number: 1, size: 1, base_type: 2},
         {field: "hardware_version", number: 6, size: 1, base_type: 2},
         {field: "battery_status", number: 11, size: 1, base_type: 2},
     ]},
    {type: "data", message: "device_info", local_number: 1,
     fields: {
         battery_status: 0, battery_voltage: 0, cum_operating_time: 0, device_index: 0,
         device_type: 0, hardware_version: 0, manufacturer: 260, product: 0,
         serial_number: 3825981698, software_version: 562, timestamp: 789516505,
     }},
    {type: "definition", message: "record", local_number: 3, length: 51, data_msg_length: 37,
     fields: [
         {field: "timestamp", number: 253, size: 4, base_type: 134},
         {field: "position_lat", number: 0, size: 4, base_type: 133},
         {field: "position_long", number: 1, size: 4, base_type: 133},
         {field: "distance", number: 5, size: 4, base_type: 134},
         {field: "time_from_course", number: 11, size: 4, base_type: 133},
         {field: "compressed_speed_distance", number: 8, size: 3, base_type: 13},
         {field: "heart_rate", number: 3, size: 1, base_type: 2},
         {field: "altitude", number: 2, size: 2, base_type: 132},
         {field: "speed", number: 6, size: 2, base_type: 132},
         {field: "power", number: 7, size: 2, base_type: 132},
         {field: "grade", number: 9, size: 2, base_type: 131},
         {field: "cadence", number: 4, size: 1, base_type: 2},
         {field: "resistance", number: 10, size: 1, base_type: 2},
         {field: "cycle_length", number: 12, size: 1, base_type: 2},
         {field: "temperature", number: 13, size: 1, base_type: 1},
     ]},
    {type: "definition", message: "event", local_number: 2, length: 24, data_msg_length: 14,
     fields: [
         {field: 'timestamp',   number: 253, size: 4, base_type: 134},
         {field: 'data',        number:   3, size: 4, base_type: 134},
         {field: 'data16',      number:   2, size: 2, base_type: 132},
         {field: 'event',       number:   0, size: 1, base_type: 0},
         {field: 'event_type',  number:   1, size: 1, base_type: 0},
         {field: 'event_group', number:   4, size: 1, base_type: 2},
     ]},
    {type: "data", message: "event", local_number: 2, fields: {
        timestamp: 992484147, data: 0, data16: 0, event: 0, event_group: 0, event_type: 0,
    }},
    {type: "data", message: "record", local_number: 3, fields: {
        timestamp: 965747728, power: 287, cadence: 83, speed: 8908, heart_rate: 150, distance: 103, altitude: 2565,
        position_lat: -138807946, position_long: 1992069714, compressed_speed_distance: 255, cycle_length: 255,
        grade: 32767, resistance: 255, temperature: 127, time_from_course: 2147483647}},

    {type: "data", message: "record", local_number: 3, fields: {
        timestamp: 965747729, power: 291, cadence: 85, speed: 9159, heart_rate: 150, distance: 1094, altitude: 2565,
        position_lat: -138808926, position_long: 1992070093, compressed_speed_distance: 255, cycle_length: 255,
        grade: 32767, resistance: 255, temperature: 127, time_from_course: 2147483647}},

    {type: "data", message: "record", local_number: 3, fields: {
        timestamp: 965747730, power: 290, cadence: 85, speed: 9379, heart_rate: 150, distance: 2014, altitude: 2565,
        position_lat: -138809856, position_long:  1992070426, compressed_speed_distance: 255, cycle_length: 255,
        grade: 32767, resistance: 255, temperature: 127, time_from_course: 2147483647}},

    {type: "data", message: "record", local_number: 3, fields: {
        timestamp: 965747731, power: 300, cadence: 86, speed: 9589, heart_rate: 150, distance: 2941, altitude: 2565,
        position_lat: -138810762, position_long: 1992070836, compressed_speed_distance: 255, cycle_length: 255,
        grade: 32767, resistance: 255, temperature: 127, time_from_course: 2147483647}},
];

const activity3R = [
    //
    // just the first 4 records from 3R_Sand_and_Sequoias_Race_C_.fit, as FITjs
    //
    {type: "header", protocolVersion: "1.0", profileVersion: "1.00", dataRecordsLength: 161521,
     fileType: ".FIT", length: 12, crc: false},
    {type: "definition", message: "file_id", local_number: 0, length: 24, data_msg_length: 16,
     fields: [
         {field: "serial_number", number: 3, size: 4, base_type: 140},
         {field: "time_created", number: 4, size: 4, base_type: 134},
         {field: "manufacturer", number: 1, size: 2, base_type: 132},
         {field: "product", number: 2, size: 2, base_type: 132},
         {field: "number", number: 5, size: 2, base_type: 132},
         {field: "type", number: 0, size: 1, base_type: 0},
     ]},
    {type: "data", message: "file_id", local_number: 0,
     fields: {
         manufacturer: 260, number: 0, product: 0, serial_number: 0, time_created: 965747493, type: 4,
     }},
    {type: "definition", message: "device_info", local_number: 1, length: 39, data_msg_length: 25,
     fields: [
         {field: "timestamp", number: 253, size: 4, base_type: 134},
         {field: "serial_number", number: 3, size: 4, base_type: 140},
         {field: "cum_operating_time", number: 7, size: 4, base_type: 134},
         {field: "manufacturer", number: 2, size: 2, base_type: 132},
         {field: "product", number: 4, size: 2, base_type: 132},
         {field: "software_version", number: 5, size: 2, base_type: 132},
         {field: "battery_voltage", number: 10, size: 2, base_type: 132},
         {field: "device_index", number: 0, size: 1, base_type: 2},
         {field: "device_type", number: 1, size: 1, base_type: 2},
         {field: "hardware_version", number: 6, size: 1, base_type: 2},
         {field: "battery_status", number: 11, size: 1, base_type: 2},
     ]},
    {type: "data", message: "device_info", local_number: 1,
     fields: {
         battery_status: 0, battery_voltage: 0, cum_operating_time: 0, device_index: 0,
         device_type: 0, hardware_version: 0, manufacturer: 260, product: 0,
         serial_number: 3825981698, software_version: 562, timestamp: 789516505,
     }},
    {type: "definition", message: "record", local_number: 3, length: 51, data_msg_length: 37,
     fields: [
         {field: "timestamp", number: 253, size: 4, base_type: 134},
         {field: "position_lat", number: 0, size: 4, base_type: 133},
         {field: "position_long", number: 1, size: 4, base_type: 133},
         {field: "distance", number: 5, size: 4, base_type: 134},
         {field: "time_from_course", number: 11, size: 4, base_type: 133},
         {field: "compressed_speed_distance", number: 8, size: 3, base_type: 13},
         {field: "heart_rate", number: 3, size: 1, base_type: 2},
         {field: "altitude", number: 2, size: 2, base_type: 132},
         {field: "speed", number: 6, size: 2, base_type: 132},
         {field: "power", number: 7, size: 2, base_type: 132},
         {field: "grade", number: 9, size: 2, base_type: 131},
         {field: "cadence", number: 4, size: 1, base_type: 2},
         {field: "resistance", number: 10, size: 1, base_type: 2},
         {field: "cycle_length", number: 12, size: 1, base_type: 2},
         {field: "temperature", number: 13, size: 1, base_type: 1},
     ]},
    {type: "definition", message: "event", local_number: 2, length: 24, data_msg_length: 14,
     fields: [
         {field: "timestamp", number: 253, size: 4, base_type: 134},
         {field: "data", number: 3, size: 4, base_type: 134},
         {field: "data16", number: 2, size: 2, base_type: 132},
         {field: "event", number: 0, size: 1, base_type: 0},
         {field: "event_type", number: 1, size: 1, base_type: 0},
         {field: "event_group", number: 4, size: 1, base_type: 2},
     ]},
    {type: "data", message: "event", local_number: 2,
     fields: {
         data: 0, data16: 0, event: 0, event_group: 0, event_type: 0, timestamp: 965747716,
     }},
    {type: "data", message: "record", local_number: 3,
     fields: {
         altitude: 2565, cadence: 83, compressed_speed_distance: 255, cycle_length: 255, distance: 103,
         grade: 32767, heart_rate: 150, position_lat: -138807946, position_long: 1992069714, power: 287,
         resistance: 255, speed: 8908, temperature: 127, time_from_course: 2147483647, timestamp: 965747728,
     }},
    {type: "data", message: "record", local_number: 3,
     fields: {
         altitude: 2565, cadence: 85, compressed_speed_distance: 255, cycle_length: 255, distance: 1094,
         grade: 32767, heart_rate: 150, position_lat: -138808926, position_long: 1992070093, power: 291,
         resistance: 255, speed: 9159, temperature: 127, time_from_course: 2147483647, timestamp: 965747729,
     }},
    {type: "data", message: "record", local_number: 3,
     fields: {
         altitude: 2565, cadence: 86, compressed_speed_distance: 255, cycle_length: 255, distance: 2014,
         grade: 32767, heart_rate: 150, position_lat: -138809856, position_long: 1992070426, power: 290,
         resistance: 255, speed: 9379, temperature: 127, time_from_course: 2147483647, timestamp: 965747730,
     }},
    {type: "data", message: "record", local_number: 3,
     fields: {
         altitude: 2565, cadence: 86, compressed_speed_distance: 255, cycle_length: 255, distance: 2941,
         grade: 32767, heart_rate: 150, position_lat: -138810762, position_long: 1992070836, power: 300,
         resistance: 255, speed: 9589, temperature: 127, time_from_course: 2147483647, timestamp: 965747731,
     }},
];

const footer = [
    // event
    2,  19,36,144,57,  0,0,0,0,  0,0,  0, 4, 0,
    // lap definition
    68, 0, 0, 19,0, 9,  253,4,134, 2,4,134, 7,4,134, 8,4,134, 254,2,132, 0,1,0, 1,1,0, 26,1,2, 24,1,2,
    // lap
    4,  19,36,144,57,  16,36,144,57,  3,0,0,0,  3,0,0,0,  0,0, 9, 1, 0, 0,
    // session definition
    69, 0, 0, 18,0, 18,  253,4,134, 2,4,134, 7,4,134, 8,4,134, 254,2,132, 25,2,132, 26,2,132,
    5,1,0, 6,1,0, 20,2,132, 21,2,132, 18,1,2, 19,1,2, 14,2,132, 15,2,132, 16,1,2, 17,1,2, 9,4,134,
    // session
    5,  19,36,144,57,  16,36,144,57,  3,0,0,0,  3,0,0,0,
    0,0,  0,0,  1,0,  2,  58,
    36,1,  44,1,  84, 86,  42,36,  117,37,  150, 150,  125,11,0,0,
    // activity definition
    70, 0, 0, 34,0, 7,  253,4,134, 5,4,134, 1,2,132, 2,1,0, 3,1,0, 4,1,0, 6,1,2,
    // activity
    6,  19,36,144,57,  19,36,144,57,  1,0,  0,  26,  1,  0,
];

const minimal = [
    // header
    12,  16,  100,0,  112,1,0,0,  46,70,73,84,
    // file id definition message
    64, 0, 0, 0,0, 5,  4,4,134,  1,2,132,  2,2,132,  5,2,132,  0,1,0,
    // file id data message
    0, 138, 26, 40, 59, 4, 1, 0, 0, 0, 0, 4,
    // device info definition message
    // ...
    // device info data message
    // ...
    // event definition message
    66, 0, 0, 21,0, 6,  253,4,134, 3,4,134, 2,2,132, 0,1,0, 1,1,0, 4,1,2,
    // event data message
    2,  19,36,144,57,  0,0,0,0,  0,0,  0, 0, 0,
    // record definition message
    //                   timestamp,  power, cadence, speed,   hr,   distance
    67, 0, 0, 20,0, 6,  253,4,134, 7,2,132, 4,1,2, 6,2,132, 3,1,2, 5,4,134,
    // record data message
    3, 16,36,144,57, 31,1, 83, 204,34, 150, 103,0,0,0,
    3, 17,36,144,57, 35,1, 85, 199,35, 150, 70,4,0,0,
    3, 18,36,144,57, 34,1, 86, 163,36, 150, 222,7,0,0,
    3, 19,36,144,57, 44,1, 86, 117,37, 150, 125,11,0,0,
    // event data message
    2,  19,36,144,57,  0,0,0,0,  0,0,  0, 4, 0,
    // lap definition message
    68, 0, 0, 19,0, 9,  253,4,134, 2,4,134, 7,4,134, 8,4,134, 254,2,132, 0,1,0, 1,1,0, 26,1,2, 24,1,2,
    // lap
    4,  19,36,144,57,  16,36,144,57,  3,0,0,0,  3,0,0,0,  0,0, 9, 1, 0, 0,
    // session definition message
    69, 0, 0, 18,0, 18,  253,4,134, 2,4,134, 7,4,134, 8,4,134, 254,2,132, 25,2,132, 26,2,132,
    5,1,0, 6,1,0, 20,2,132, 21,2,132, 18,1,2, 19,1,2, 14,2,132, 15,2,132, 16,1,2, 17,1,2, 9,4,134,
    // session data message
    5,  19,36,144,57,  16,36,144,57,  3,0,0,0,  3,0,0,0,
    0,0,  0,0,  1,0,  2,  58,
    36,1,  44,1,  85, 86,  42,36,  117,37,  150, 150,  125,11,0,0,
    // activity definition message
    70, 0, 0, 34,0, 7,  253,4,134, 5,4,134, 1,2,132, 2,1,0, 3,1,0, 4,1,0, 6,1,2,
    // activity data message
    6,  19,36,144,57,  19,36,144,57,  1,0,  0,  26,  1,  0,
    // crc
    // 112, 130
    226, 68
];

const data = {
    activity,
    activity3R,
    minimal,
};

export { data };
