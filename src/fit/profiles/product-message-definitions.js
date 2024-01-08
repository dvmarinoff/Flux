//
// Product/App Message Definitions
//
// this is the subset of definitions of messages and message fields
// that the product/app fit file encoder whats to use

const productMessageDefinitions = [
    ['file_id', [
        'time_created',
        'manufacturer',
        'product',
        'serial_number',
        'number',
        'type',
    ], 0],
    ['file_creator', [
        'software_version',
    ], 1],
    ['event', [
        'timestamp',
        'event',
        'event_type',
        'event_group',
    ], 2],
    ['record', [
        'timestamp',
        'position_lat',
        'position_long',
        'altitude',
        'heart_rate',
        'cadence',
        'distance',
        'speed',
        'power',
        'grade',
        'device_index',
        'total_hemoglobin_conc',
        'saturated_hemoglobin_percent',
    ], 3],
    ['lap', [
        'timestamp',
        'start_time',
        'total_elapsed_time',
        'total_timer_time',
        'message_index',
        'event',
        'event_type',
    ], 4],
    ['session', [
        'timestamp',
        'start_time',
        'total_elapsed_time',
        'total_timer_time',
        'message_index',
        'sport',
        'sub_sport',
        'total_distance',
        'total_calories',
        'avg_speed',
        'max_speed',
        'avg_heart_rate',
        'max_heart_rate',
        'avg_cadence',
        'max_cadence',
        'avg_power',
        'max_power',
        'first_lap_index',
        'num_laps',
    ], 5],
    ['activity', [
        'timestamp',
        'total_timer_time',
        'num_sessions',
        'type',
        'event',
        'event_type',
        // 'local_timestamp',
    ], 6],
    ['course', [
        'name',
    ], 7],
    // ['field_description', [
    //     'developer_data_index',
    //     'field_definition_number',
    //     'fit_base_type_id',
    //     'field_name',
    //     'scale',
    //     'offset',
    //     'units',
    //     'fit_base_unit_id',
    //     'native_mesg_num',
    //     'native_field_num',
    // ], 1],
];

export default productMessageDefinitions;

