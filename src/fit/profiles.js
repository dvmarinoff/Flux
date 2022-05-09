import { first, second, third, } from '../functions.js';

const global_message_definitions = [
    ['file_id', 0, {
        message: 'file_id',
        global_number: 0,
        fields: [
            ['type', 0, {field: 'type', number: 0, base_type: 2}],
            ['manufacturer', 1, {field: 'manufacturer', number: 1, base_type: 132}],
            ['product', 2, {field: 'product', number: 2, base_type: 132}],
            ['serial_number', 3, {field: 'serial_number', number: 3, base_type: 140}],
            ['time_created', 4, {field: 'time_created', number: 4, base_type: 134}], // the same as first record timestamp
            ['number', 5, {field: 'number', number: 5, base_type: 132}], // Only set for files that are not created/erased.
            ['product_name', 8, {field: 'product_name', number: 8, base_type: 7}],
        ]}],
    ['device_info', 23, {
        message: 'device_info',
        global_number: 23,
        fields: [
            ['timestamp', 253, {field: 'timestamp', number: 253, base_type: 134}],
            ['serial_number', 3, {field: 'serial_number', number:   3, base_type: 140}],
            ['cum_operating_time', 7, {field: 'cum_operating_time', number:   7, base_type: 134}],
            ['manufacturer', 2, {field: 'manufacturer', number:   2, base_type: 132}],
            ['product', 4, {field: 'product', number:   4, base_type: 132}],
            ['software_version', 5, {field: 'software_version', number:   5, base_type: 132}],
            ['battery_voltage', 10, {field: 'battery_voltage', number:  10, base_type: 132}],
            ['device_index', 0, {field: 'device_index', number:   0, base_type: 2}],
            ['device_type', 1, {field: 'device_type', number:   1, base_type: 2}],
            ['hardware_version', 6, {field: 'hardware_version', number:   6, base_type: 2}],
            ['battery_status', 11, {field: 'battery_status', number:  11, base_type: 2}],
            ['descriptor', 19, {field: 'descriptor', number:  19, base_type: 7}],
            ['product_name', 27, {field: 'product_name', number:  27, base_type: 7}],
        ],
    }],
    ['record', 20, {
        message: 'record',
        global_number: 20,
        fields: [
            // uint8 2, uint16 132, uint32 134, sint8 1, sint16 131, sint32 133, enum 0, string 7, byte: 13
            ['timestamp', 253, {field: 'timestamp', number: 253, base_type: 134}],
            ['position_lat', 0, {field: 'position_lat', number:   0, base_type: 133}], // semicircles
            ['position_long', 1, {field: 'position_long', number:   1, base_type: 133}], // semicircles
            ['distance', 5, {field: 'distance', number:   5, base_type: 134}], // scale 100, m
            ['time_from_course', 11, {field: 'time_from_course', number:  11, base_type: 133}], // 0x7FFFFFFF, 2147483647
            ['compressed_speed_distance', 8, {field: 'compressed_speed_distance', number:   8, base_type: 13}],  // 255
            ['heart_rate', 3, {field: 'heart_rate', number:   3, base_type: 2}],
            ['altitude', 2, {field: 'altitude', number:   2, base_type: 132}], // scale 5, offset 500
            ['speed', 6, {field: 'speed', number:   6, base_type: 132}], // scale 1000, m/s
            ['power', 7, {field: 'power', number:   7, base_type: 132}],
            ['grade', 9, {field: 'grade', number:   9, base_type: 131}], // 0b111111111111111, 32767
            ['cadence', 4, {field: 'cadence', number:   4, base_type: 2}],
            ['resistance', 10, {field: 'resistance', number:  10, base_type: 2}],   // 255
            ['cycle_length', 12, {field: 'cycle_length', number:  12, base_type: 2}],   // 255
            ['temperature', 13, {field: 'temperature', number:  13, base_type: 1}],   // 0b1111111, 127
            ['enhanced_altitude', 78, {field: 'enhanced_altitude', number:  78, base_type: 134}], // non
            ['enhanced_speed', 73, {field: 'enhanced_speed', number:  73, base_type: 134}], // non
        ]
    }],
    ['event', 21, {
        message: 'event',
        global_number: 21,
        fields: [
            ['timestamp', 253, {field: 'timestamp', number: 253, base_type: 134}],
            ['data', 3, {field: 'data', number: 3,   base_type: 134}],
            ['data16', 2, {field: 'data16', number: 2,   base_type: 132}],
            ['event', 0, {field: 'event', number: 0,   base_type: 0}],
            ['event_type', 1, {field: 'event_type', number: 1,   base_type: 0}],
            ['event_group', 4, {field: 'event_group', number: 4,   base_type: 2}],
        ]
    }],
    ['lap', 19, {
        message: 'lap',
        global_number: 19,
        fields: [
            ['timestamp', 253, {field: 'timestamp', number: 253, base_type: 134}],
	          ['start_time', 2, {field: 'start_time', number:   2, base_type: 134}],
	          ['start_position_lat', 3, {field: 'start_position_lat', number:   3, base_type: 133}], // 0.0
            ['start_position_long', 4, {field: 'start_position_long', number:   4, base_type: 133}], // 0.0
	          ['end_position_lat', 5, {field: 'end_position_lat', number:   5, base_type: 133}], // 0.0
	          ['end_position_long', 6, {field: 'end_position_long', number:   6, base_type: 133}], // 0.0
	          ['total_elapsed_time', 7, {field: 'total_elapsed_time', number:   7, base_type: 134}],
            ['total_timer_time', 8, {field: 'total_timer_time', number:   8, base_type: 134}], // Exclude pauses
	          ['total_distance', 9, {field: 'total_distance', number:   9, base_type: 134}],
	          ['total_cycles', 10, {field: 'total_cycles', number:  10, base_type: 134}], // 0
            ['message_index', 254, {field: 'message_index', number: 254, base_type: 132}],
	          ['total_calories', 11, {field: 'total_calories', number:  11, base_type: 132}], // 0
	          ['total_fat_calories', 12, {field: 'total_fat_calories', number:  12, base_type: 132}], // 0
	          ['avg_speed', 13, {field: 'avg_speed', number:  13, base_type: 132}], // m/s
	          ['max_speed', 14, {field: 'max_speed', number:  14, base_type: 132}],
	          ['avg_power', 19, {field: 'avg_power', number:  19, base_type: 132}],
	          ['max_power', 20, {field: 'max_power', number:  20, base_type: 132}],
            ['total_ascent', 21, {field: 'total_ascent', number:  21, base_type: 132}], // 0
            ['total_descent', 22, {field: 'total_descent', number:  22, base_type: 132}], // 0
            ['event', 0, {field: 'event', number:   0, base_type: 0}],
            ['event_type', 1, {field: 'event_type', number:   1, base_type: 0}],
            ['avg_heart_rate', 15, {field: 'avg_heart_rate', number:  15, base_type: 2}],
            ['max_heart_rate', 16, {field: 'max_heart_rate', number:  16, base_type: 2}],
            ['avg_cadence', 17, {field: 'avg_cadence', number:  17, base_type: 2}],
            ['max_cadence', 18, {field: 'max_cadence', number:  18, base_type: 2}],
            ['intensity', 23, {field: 'intensity', number:  23, base_type: 0}],
            ['lap_trigger', 24, {field: 'lap_trigger', number:  24, base_type: 0}],
            ['sport', 25, {field: 'sport', number:  25, base_type: 0}],
            ['event_group', 26, {field: 'event_group', number:  26, base_type: 2}],
        ]
    }],
    ['session', 18, {
        message: 'session',
        global_number: 18,
        fields: [
            ['timestamp', 253, {field: 'timestamp', number: 253, base_type: 134}],
            ['start_time', 2, {field: 'start_time', number:   2, base_type: 134}],
            ['start_position_lat', 3, {field: 'start_position_lat', number:   3, base_type: 133}],
            ['start_position_long', 4, {field: 'start_position_long', number:   4, base_type: 133}],
            ['total_elapsed_time', 7, {field: 'total_elapsed_time', number:   7, base_type: 134}],
            ['total_timer_time', 8, {field: 'total_timer_time', number:   8, base_type: 134}],
            ['total_distance', 9, {field: 'total_distance', number:   9, base_type: 134}],
            ['total_cycles', 10, {field: 'total_cycles', number:  10, base_type: 134}],
            ['nec_lat', 29, {field: 'nec_lat', number:  29, base_type: 133}],
            ['nec_long', 30, {field: 'nec_long', number:  30, base_type: 133}],
            ['swc_lat', 31, {field: 'swc_lat', number:  31, base_type: 133}],
            ['swc_long', 32, {field: 'swc_long', number:  32, base_type: 133}],
            ['message_index', 254, {field: 'message_index', number: 254, base_type: 132}],
            ['total_calories', 11, {field: 'total_calories', number:  11, base_type: 132}],
            ['total_fat_calories', 13, {field: 'total_fat_calories', number:  13, base_type: 132}],
            ['avg_speed', 14, {field: 'avg_speed', number:  14, base_type: 132}],
            ['max_speed', 15, {field: 'max_speed', number:  15, base_type: 132}],
            ['avg_power', 20, {field: 'avg_power', number:  20, base_type: 132}],
            ['max_power', 21, {field: 'max_power', number:  21, base_type: 132}],
            ['total_ascent', 22, {field: 'total_ascent', number:  22, base_type: 132}],
            ['total_descent', 23, {field: 'total_descent', number:  23, base_type: 132}],
            ['first_lap_index', 25, {field: 'first_lap_index', number:  25, base_type: 132}],
            ['num_laps', 26, {field: 'num_laps', number:  26, base_type: 132}],
            ['event', 0, {field: 'event', number:   0, base_type: 0}],
            ['event_type', 1, {field: 'event_type', number:   1, base_type: 0}],
            ['sport', 5, {field: 'sport', number:   5, base_type: 0}],
            ['sub_sport', 6, {field: 'sub_sport', number:   6, base_type: 0}],
            ['avg_heart_rate', 16, {field: 'avg_heart_rate', number:  16, base_type: 2}],
            ['max_heart_rate', 17, {field: 'max_heart_rate', number:  17, base_type: 2}],
            ['avg_cadence', 18, {field: 'avg_cadence', number:  18, base_type: 2}],
            ['max_cadence', 19, {field: 'max_cadence', number:  19, base_type: 2}],
            ['total_training_effect', 24, {field: 'total_training_effect', number:  24, base_type: 2}],
            ['event_group', 27, {field: 'event_group', number:  27, base_type: 2}],
            ['trigger', 28, {field: 'trigger', number:  28, base_type: 0}]
        ]
    }],
    ['activity', 34, {
        message: 'activity',
        global_number: 34,
        fields: [
            ['timestamp', 253, {field: 'timestamp', number: 253, base_type: 134}],
            ['total_timer_time', 0, {field: 'total_timer_time', number:   0, base_type: 134}], // Exclude pauses
            ['num_sessions', 1, {field: 'num_sessions', number:   1, base_type: 132}],
            ['type', 2, {field: 'type', number:   2, base_type: 0}],
            ['event', 3, {field: 'event', number:   3, base_type: 0}],
            ['event_type', 4, {field: 'event_type', number:   4, base_type: 0}],
            ['local_timestamp', 5, {field: 'local_timestamp', number:   5, base_type: 134}],
            ['event_group', 6, {field: 'event_group', number:   6, base_type: 2}],
        ],
    }],
    ['workout', 26, {
        message: 'workout',
        global_number: 26,
        fields: [],
    }],
    ['workout_step', 27, {
        message: 'workout_step',
        global_number: 27,
        fields: [],
    }],
    ['course', 31, {
        message: 'course',
        global_number: 31,
        fields: [
            ['sport', 4, {field: 'sport', number: 4, base_type: 0}],
            ['name', 5, {field: 'name', number: 5, base_type: 7}],
            ['capabilities', 6, {field: 'capabilities', number: 6, base_type: 140}],
            ['sport_sport', 7, {field: 'sport_sport', number: 7, base_type: 0}],
        ]
    }],
    ['course_point', 32, {
        message: 'course_point',
        global_number: 32,
        fields: [
            ['message_index', 254, {field: 'message_index', number: 254, base_type: 132}],
            ['timestamp', 1, {field: 'timestamp', number:   1, base_type: 134}],
            ['position_lat', 2, {field: 'position_lat', number:   2, base_type: 133}], // semicircles
            ['position_long', 3, {field: 'position_long', number:   3, base_type: 133}], // semicircles
            ['distance', 4, {field: 'distance', number:   4, base_type: 134}], // scale 100, m
            ['type', 5, {field: 'type', number:   5, base_type: 0}],   // course_point
            ['name', 6, {field: 'name', number:   6, base_type: 7}],   // string
            ['favorite', 8, {field: 'favorite', number:   8, base_type: 0}],   // bool
        ]
    }],
    ['file_creator', 49, {
        message: 'file_creator',
        global_number: 49,
        fields: [
            ['software_version', 0, {field: 'software_version', number: 0, base_type: 132}], // uint16
            ['hardware_version', 1, {field: 'hardware_version', number: 1, base_type: 1}],   // uint8
        ],
    }],

    ['field_description', 206, {
        message: 'field_description',
        global_number: 206,
        fields: [
            ['developer_data_index', 0, {field: 'developer_data_index', number: 0, base_type: 2}],
            ['field_definition_number', 1, {field: 'field_definition_number', number: 1, base_type: 2}],
            ['fit_base_type_id', 2, {field: 'fit_base_type_id', number: 2, base_type: 2}], // 'fit_base_type'
            ['field_name', 3, {field: 'field_name', number: 3, base_type: 7}],
            ['array', 4, {field: 'array', number: 4, base_type: 2}],
            ['components', 5, {field: 'components', number: 5, base_type: 7}],
            ['scale', 6, {field: 'scale', number: 6, base_type: 2}],
            ['offset', 7, {field: 'offset', number: 7, base_type: 1}],
            ['units', 8, {field: 'units', number: 8, base_type: 7}],
            ['bits', 9, {field: 'bits', number: 9, base_type: 7}],
            ['accumulate', 10, {field: 'accumulate', number: 10, base_type: 7}],
            ['fit_base_unit_id', 13, {field: 'fit_base_unit_id', number: 13, base_type: 132}], // 'fit_base_unit'
            ['native_mesg_num', 14, {field: 'native_mesg_num', number: 14, base_type: 132}], // 'mesg_num'
            ['native_field_num', 15, {field: 'native_field_num', number: 15, base_type: 2}],
        ],
    }],
    ['developer_data_id', 207, {
        message: 'developer_data_id',
        global_number: 207,
        fields: [
            ['developer_id', 0, {field: 'developer_id', number: 0, base_type: 13}],
            ['application_id', 1, {field: 'application_id', number: 1, base_type: 13}],
            ['manufacturer_id', 2, {field: 'manufacturer_id', number: 2, base_type: 132}], // 'manufacturer'
            ['developer_data_index', 3, {field: 'developer_data_index', number: 3, base_type: 2}],
            ['application_version', 4, {field: 'application_version', number: 4, base_type: 134}],
        ],
    }],
];

const messages = new Map();

global_message_definitions.forEach(definition => {
    const fields = new Map();

    third(definition).fields.forEach(field => {
        fields.set(first(field),  third(field));
        fields.set(second(field), third(field));
    });

    third(definition).fields = fields;

    messages.set(first(definition),  third(definition));
    messages.set(second(definition), third(definition));
});

// uint8 2, uint16 132, uint32 134, sint8 1, sint16 131, sint32 133, enum 0, string 7, byte: 13
const basetypes  = {
      0: {name: 'enum',    base_type_field: 0x00, endian_ability: 0, size: 1, invalid_value: 0xFF},
      1: {name: 'sint8',   base_type_field: 0x01, endian_ability: 0, size: 1, invalid_value: 0x7F},
      2: {name: 'uint8',   base_type_field: 0x02, endian_ability: 0, size: 1, invalid_value: 0xFF},
    131: {name: 'sint16',  base_type_field: 0x83, endian_ability: 0, size: 2, invalid_value: 0x7FFF},
    132: {name: 'uint16',  base_type_field: 0x84, endian_ability: 0, size: 2, invalid_value: 0xFFFF},
    133: {name: 'sint32',  base_type_field: 0x85, endian_ability: 0, size: 4, invalid_value: 0x7FFFFFFF},
    134: {name: 'uint32',  base_type_field: 0x86, endian_ability: 0, size: 4, invalid_value: 0xFFFFFFFF},
      7: {name: 'string',  base_type_field: 0x07, endian_ability: 0, size: 1, invalid_value: 0x00},
    136: {name: 'float32', base_type_field: 0x88, endian_ability: 0, size: 4, invalid_value: 0xFFFFFFFF},
    137: {name: 'float64', base_type_field: 0x89, endian_ability: 0, size: 8, invalid_value: 0xFFFFFFFFFFFFFFFF},
     10: {name: 'uint8z',  base_type_field: 0x0A, endian_ability: 0, size: 1, invalid_value: 0x00},
    139: {name: 'uint16z', base_type_field: 0x8B, endian_ability: 0, size: 2, invalid_value: 0x0000},
    140: {name: 'uint32z', base_type_field: 0x8C, endian_ability: 0, size: 4, invalid_value: 0x00000000},
     13: {name: 'byte',    base_type_field: 0x0D, endian_ability: 0, size: 1, invalid_value: 0xFF},
    142: {name: 'sint64',  base_type_field: 0x8E, endian_ability: 0, size: 8, invalid_value: 0x7FFFFFFFFFFFFFFF},
    143: {name: 'uint64',  base_type_field: 0x8F, endian_ability: 0, size: 8, invalid_value: 0xFFFFFFFFFFFFFFFF},
    144: {name: 'uint64z', base_type_field: 0x90, endian_ability: 0, size: 8, invalid_value: 0x0000000000000000},
};

const appTypes = {
    'data_time':       {basetype: 134, values: false},
    'message_index':   {basetype: 132, values: false},
    'event':           {basetype: 0,
                        values: {timer: 0, workout: 3, workout_step: 4, power_down:	5, power_up:	6,
                                 off_course:	7, session: 8, lap: 9, course_point:	10, battery: 11,
                                 virtual_partner_pace:	12, hr_high_alert: 13, hr_low_alert:	14,
                                 speed_high_alert:	15, speed_low_alert: 16, cad_high_alert: 17,
                                 cad_low_alert: 18, power_high_alert: 19, power_low_alert: 20,
                                 recovery_hr: 21, battery_low: 22, time_duration_alert: 23,
                                 distance_duration_alert: 24, calorie_duration_alert: 25,
                                 activity: 26, fitness_equipment: 27, length: 28, user_marker: 32,
                                 sport_point: 33, calibration: 36, front_gear_change: 42, rear_gear_change: 43,
                                 rider_position_change: 44, elev_high_alert: 45, elev_low_alert: 46,
                                 comm_timeout: 47, radar_threat_alert: 75}},
    'event_type':      {basetype: 0,
                        values: {start: 0, stop: 1, consecutive_depreciated: 2, marker: 3,
                                 stop_all: 4, begin_depreciated: 5, end_depreciated: 6,
                                 end_all_depreciated: 7, stop_disable: 8, stop_disable_all: 9,}},
    'intensity':       {basetype: 0, values: {active: 0, rest: 1, warmup: 2, cooldown: 3}},
    'lap_trigger':     {basetype: 0,
                        values: {manual: 0, time: 1, distance: 2, position_start: 3, position_lap:	4,
                                position_waypoint: 5, position_marked: 6, session_end: 7, fitness_equipment: 8}},
    'session_trigger': {basetype: 0,
                        values: {activity_end: 0, manual: 1, auto_multi_sport: 2, fitness_equipment: 3}},
    'sport':           {basetype: 0, values: {cycling: 2}},
    'sub_sport':       {basetype: 0,
                        values: {indoor_cycling: 6, road: 7, mountain: 8, cyclocross: 11,
                                 track_cycling: 13, gravel_cycling: 46, mixed_surface: 49,
                                 virtual_activity: 58}},
    'activity':        {basetype: 0, values: {manual: 0, auto_multi_sport: 1}},
    'local_datatime':  {basetype: 134, values: false},
    'device_index':    {basetype: 2, values: false}, // Creator of the file is always device index 0
    'battery_status':  {basetype: 2,
                        values: {new: 1, good: 2, ok: 3, low: 4, critical: 5, charging: 6, unknown: 7}},
    'course_point': {basetype: 0,
                     values: {generic: 0, summit: 1, valley: 2, water: 3, food: 4, danger: 5, left: 6, right: 7, straight: 8, first_aid: 9, fourth_category: 10, third_category: 11, second_category: 12, first_category: 13, hors_category: 14, sprint: 15, left_fork: 16, right_fork: 17, middle_fork: 18, slight_left: 19, sharp_left: 20, slight_right: 21, sharp_right: 22, u_turn: 23, segment_start: 24, segment_end: 25}},
    'fit_base_unit': {basetype: 132,
                      values: {other: 0, kilogram: 1, pound: 2,}},
};

export {
    messages,
    basetypes,
    appTypes,
}

