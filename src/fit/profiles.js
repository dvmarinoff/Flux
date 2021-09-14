
const messages = {
    'file_id': {
        global_number: 0,
        fields: {
            type:          {number: 0, base_type: 2},
            manufacturer:  {number: 1, base_type: 132},
            product:       {number: 2, base_type: 132},
            serial_number: {number: 3, base_type: 140},
            time_created:  {number: 4, base_type: 134}, // the same as first record timestamp
            number:        {number: 5, base_type: 132}, // Only set for files that are not created/erased.
            product_name:  {number: 8, base_type: 7},
        }
    },
    'device_info': {
        global_number: 23,
        fields: {
            timestamp:          {number: 253, base_type: 134},
            serial_number:      {number:   3, base_type: 140},
            cum_operating_time: {number:   7, base_type: 134},
            manufacturer:       {number:   2, base_type: 132},
            product:            {number:   4, base_type: 132},
	          software_version:   {number:   5, base_type: 132},
	          battery_voltage:    {number:  10, base_type: 132},
	          device_index:       {number:   0, base_type: 2},
	          device_type:        {number:   1, base_type: 2},
	          hardware_version:   {number:   6, base_type: 2},
	          battery_status:     {number:  11, base_type: 2},
        }
    },
    'record': {
        global_number: 20,
        fields: {
            // uint8 2, uint16 132, uint32 134, sint8 1, sint16 131, sint32 133, enum 0, string 7, byte: 13
            timestamp:                 {number: 253, base_type: 134},
            position_lat:              {number:   0, base_type: 133}, // semicircles
            position_long:             {number:   1, base_type: 133}, // semicircles
            distance:                  {number:   5, base_type: 134}, // scale 100, m
            time_from_course:          {number:  11, base_type: 133}, // 0x7FFFFFFF, 2147483647
            compressed_speed_distance: {number:   8, base_type: 13},  // 255
            heart_rate:                {number:   3, base_type: 2},
            altitude:                  {number:   2, base_type: 132}, // scale 5, offset 500
            speed:                     {number:   6, base_type: 132}, // scale 1000, m/s
            power:                     {number:   7, base_type: 132},
            grade:                     {number:   9, base_type: 131}, // 0b111111111111111, 32767
            cadence:                   {number:   4, base_type: 2},
            resistance:                {number:  10, base_type: 2},   // 255
            cycle_length:              {number:  12, base_type: 2},   // 255
            temperature:               {number:  13, base_type: 1},   // 0b1111111, 127
            enhanced_altitude:         {number:  78, base_type: 134}, // non
            enhanced_speed:            {number:  73, base_type: 134}, // non
        }
    },
    'event': {
        global_number: 21,
        fields: {
            timestamp:          {number: 253, base_type: 134},
            data:               {number: 3,   base_type: 134},
            data16:             {number: 2,   base_type: 132},
            event:              {number: 0,   base_type: 0},
            event_type:         {number: 1,   base_type: 0},
            event_group:        {number: 4,   base_type: 2},
        }
    },
    'lap': {
        global_number: 19,
        fields: {
            timestamp:           {number: 253, base_type: 134},
	          start_time:	         {number:   2, base_type: 134},
	          start_position_lat:  {number:   3, base_type: 133}, // 0.0
            start_position_long: {number:   4, base_type: 133}, // 0.0
	          end_position_lat:	   {number:   5, base_type: 133}, // 0.0
	          end_position_long:	 {number:   6, base_type: 133}, // 0.0
	          total_elapsed_time:  {number:   7, base_type: 134},
            total_timer_time:    {number:   8, base_type: 134}, // Exclude pauses
	          total_distance:	     {number:   9, base_type: 134},
	          total_cycles:	       {number:  10, base_type: 134}, // 0
            message_index:       {number: 254, base_type: 132},
	          total_calories:	     {number:  11, base_type: 132}, // 0
	          total_fat_calories:  {number:  12, base_type: 132}, // 0
	          avg_speed:	         {number:  13, base_type: 132}, // m/s
	          max_speed:           {number:  14, base_type: 132},
	          avg_power:	         {number:  19, base_type: 132},
	          max_power:	         {number:  20, base_type: 132},
            total_ascent:        {number:  21, base_type: 132}, // 0
            total_descent:       {number:  22, base_type: 132}, // 0
            event:               {number:   0, base_type: 0},
            event_type:          {number:   1, base_type: 0},
            avg_heart_rate:      {number:  15, base_type: 2},
            max_heart_rate:      {number:  16, base_type: 2},
            avg_cadence:         {number:  17, base_type: 2},
            max_cadence:         {number:  18, base_type: 2},
            intensity:           {number:  23, base_type: 0},
            lap_trigger:         {number:  24, base_type: 0},
            sport:               {number:  25, base_type: 0},
            event_group:         {number:  26, base_type: 2},
        }
    },
    'session': {
        global_number: 18,
        fields: {
            timestamp:             {number: 253, base_type: 134},
            start_time:	           {number:   2, base_type: 134},
            start_position_lat:    {number:   3, base_type: 133},
            start_position_long:   {number:   4, base_type: 133},
            total_elapsed_time:	   {number:   7, base_type: 134},
            total_timer_time:      {number:   8, base_type: 134},
            total_distance:        {number:   9, base_type: 134},
            total_cycles:	         {number:  10, base_type: 134},
            nec_lat:               {number:  29, base_type: 133},
            nec_long:              {number:  30, base_type: 133},
            swc_lat:               {number:  31, base_type: 133},
            swc_long:              {number:  32, base_type: 133},
            message_index:         {number: 254, base_type: 132},
            total_calories:        {number:  11, base_type: 132},
            total_fat_calories:    {number:  13, base_type: 132},
            avg_speed:             {number:  14, base_type: 132},
            max_speed:             {number:  15, base_type: 132},
            avg_power:             {number:  20, base_type: 132},
            max_power:             {number:  21, base_type: 132},
            total_ascent:          {number:  22, base_type: 132},
            total_descent:         {number:  23, base_type: 132},
            first_lap_index:       {number:  25, base_type: 132},
            num_laps:              {number:  26, base_type: 132},
            event:                 {number:   0, base_type: 0},
            event_type:            {number:   1, base_type: 0},
            sport:                 {number:   5, base_type: 0},
            sub_sport:             {number:   6, base_type: 0},
            avg_heart_rate:        {number:  16, base_type: 2},
            max_heart_rate:        {number:  17, base_type: 2},
            avg_cadence:           {number:  18, base_type: 2},
            max_cadence:           {number:  19, base_type: 2},
            total_training_effect: {number:  24, base_type: 2},
            event_group:           {number:  27, base_type: 2},
            trigger:               {number:  28, base_type: 0}
        }
    },
    'activity': {
        global_number: 34,
        fields: {
            timestamp:        {number: 253, base_type: 134},
            total_timer_time: {number:   0, base_type: 134}, // Exclude pauses
            num_sessions:     {number:   1, base_type: 132},
            type:             {number:   2, base_type: 0},
            event:            {number:   3, base_type: 0},
            event_type:       {number:   4, base_type: 0},
            local_timestamp:  {number:   5, base_type: 134},
            event_group:      {number:   6, base_type: 2},
        },
    },
    'workout': {
        global_number: 26,
    },
    'workout_step': {
        global_number: 27,
    }
};

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
                        values: {new: 1, good: 2, ok: 3, low: 4, critical: 5, charging: 6, unknown: 7}}
};

export {
    messages,
    basetypes,
    appTypes,
}
