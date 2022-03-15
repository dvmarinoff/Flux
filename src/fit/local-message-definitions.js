
const localMessageDefinitions = {
    fileId: {
        type: 'definition',
        message: 'file_id',
        local_number: 0,
        length: 6+15,
        data_msg_length: 1+11,
        fields: [
            {field: 'time_created', number: 4, size: 4, base_type: 134},
            {field: 'manufacturer', number: 1, size: 2, base_type: 132},
            {field: 'product',      number: 2, size: 2, base_type: 132},
            {field: 'number',       number: 5, size: 2, base_type: 132},
            {field: 'type',         number: 0, size: 1, base_type: 0},
        ]
    },
    record: {
        type: 'definition',
        message: 'record',
        local_number: 3,
        length: 6+18+3+3,
        data_msg_length: 1+14+2+2,
        fields: [
            {field: 'timestamp',   number: 253, size: 4, base_type: 134},
            // {field: "position_lat", number: 0, size: 4, base_type: 133},
            // {field: "position_long", number: 1, size: 4, base_type: 133},
            {field: "distance", number: 5, size: 4, base_type: 134},
            {field: "heart_rate", number: 3, size: 1, base_type: 2},
            {field: "altitude", number: 2, size: 2, base_type: 132},
            {field: "speed", number: 6, size: 2, base_type: 132},
            {field: "power", number: 7, size: 2, base_type: 132},
            {field: "grade", number: 9, size: 2, base_type: 131},
            {field: "cadence", number: 4, size: 1, base_type: 2},
            // {field: "resistance", number: 10, size: 1, base_type: 2},
        ]
    },
    event: {
        type: 'definition',
        message: 'event',
        local_number: 2,
        length: 6+12,
        data_msg_length: 1+7,
        fields: [
            {field: 'timestamp',   number: 253, size: 4, base_type: 134},
            {field: 'event',       number:   0, size: 1, base_type: 0},
            {field: 'event_type',  number:   1, size: 1, base_type: 0},
            {field: 'event_group', number:   4, size: 1, base_type: 2},
        ]
    },
    lap: {
        type: 'definition',
        message: 'lap',
        local_number: 4,
        length: 6+21,
        data_msg_length: 1+20,
        fields: [
            {field: 'timestamp',          number: 253, size: 4, base_type: 134},
            {field: 'start_time',         number:   2, size: 4, base_type: 134},
            {field: 'total_elapsed_time', number:   7, size: 4, base_type: 134},
            {field: 'total_timer_time',   number:   8, size: 4, base_type: 134},
            {field: 'message_index',      number: 254, size: 2, base_type: 132},
            {field: 'event',              number:   0, size: 1, base_type: 0},
            {field: 'event_type',         number:   1, size: 1, base_type: 0},
        ]
    },
    session: {
        type: 'definition',
        message: 'session',
        local_number: 5,
        length: 6+(18*3),
        data_msg_length: 1+40,
        fields: [
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
            {field: 'total_distance',     number:    9, size: 4, base_type: 134},
        ]
    },
    activity: {
        type: 'definition',
        message: 'activity',
        local_number: 6,
        length: 6+(6*3),
        data_msg_length: 1+13,
        fields: [
            {field: 'timestamp',        number: 253, size: 4, base_type: 134},
            {field: 'local_timestamp',  number:   5, size: 4, base_type: 134},
            {field: 'num_sessions',     number:   1, size: 2, base_type: 132},
            {field: 'type',             number:   2, size: 1, base_type: 0},
            {field: 'event',            number:   3, size: 1, base_type: 0},
            {field: 'event_type',       number:   4, size: 1, base_type: 0},
        ]
    },
    course: {
        type: 'definition',
        message: 'course',
        local_number: 31,
        length: 6+(1*3),
        data_msg_length: 1+15,
        fields: [
            // {field: 'sport',        number: 4, size: 1, base_type: 0},
            {field: 'name',         number: 5, size: 1, base_type: 7},
            // {field: 'capabilities', number: 6, size: 1, base_type: 0}, // uint32z
            // {field: 'sport_sport',  number: 7, size: 1, base_type: 0},
        ]
    }
};

export { localMessageDefinitions };

