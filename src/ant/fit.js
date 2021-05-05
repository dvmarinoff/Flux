import { avg, max, sum, first, last, timeDiff } from '../functions.js';

const global_msg_numbers = {
    file_id:      0,
    session:     18,
    lap:         19,
    record:      20,
    event:       21,
    device_info: 23,
    activity:    34,
};

const basetypes  = {
    'enum':    {base_type_number:  0, base_type_field: 0x00, endian_ability: 0, size: 1, invalid_value: 0xFF},
    'sint8':   {base_type_number:  1, base_type_field: 0x01, endian_ability: 0, size: 1, invalid_value: 0x7F},
    'uint8':   {base_type_number:  2, base_type_field: 0x02, endian_ability: 0, size: 1, invalid_value: 0xFF},
    'sint16':  {base_type_number:  3, base_type_field: 0x83, endian_ability: 0, size: 2, invalid_value: 0x7FFF},
    'uint16':  {base_type_number:  4, base_type_field: 0x84, endian_ability: 0, size: 2, invalid_value: 0xFFFF},
    'sint32':  {base_type_number:  5, base_type_field: 0x85, endian_ability: 0, size: 4, invalid_value: 0x7FFFFFFF},
    'uint32':  {base_type_number:  6, base_type_field: 0x86, endian_ability: 0, size: 4, invalid_value: 0xFFFFFFFF},
    'string':  {base_type_number:  7, base_type_field: 0x07, endian_ability: 0, size: 1, invalid_value: 0x00},
    'float32': {base_type_number:  8, base_type_field: 0x88, endian_ability: 0, size: 4, invalid_value: 0xFFFFFFFF},
    'float64': {base_type_number:  9, base_type_field: 0x89, endian_ability: 0, size: 8, invalid_value: 0xFFFFFFFFFFFFFFFF},
    'uint8z':  {base_type_number: 10, base_type_field: 0x0A, endian_ability: 0, size: 1, invalid_value: 0x00},
    'uint16z': {base_type_number: 11, base_type_field: 0x8B, endian_ability: 0, size: 2, invalid_value: 0x0000},
    'uint32z': {base_type_number: 12, base_type_field: 0x8C, endian_ability: 0, size: 4, invalid_value: 0x00000000},
    'byte':    {base_type_number: 13, base_type_field: 0x0D, endian_ability: 0, size: 1, invalid_value: 0xFF},
    'sint64':  {base_type_number: 14, base_type_field: 0x8E, endian_ability: 0, size: 8, invalid_value: 0x7FFFFFFFFFFFFFFF},
    'uint64':  {base_type_number: 15, base_type_field: 0x8F, endian_ability: 0, size: 8, invalid_value: 0xFFFFFFFFFFFFFFFF},
    'uint64z': {base_type_number: 16, base_type_field: 0x90, endian_ability: 0, size: 8, invalid_value: 0x0000000000000000},

    // SDK types
    'date_time': {base_type_number:  6, base_type_field: 0x86, endian_ability: 0, size: 4, invalid_value: 0xFFFFFFFF},

    // enum types
    'file':         {base_type_number:  0, base_type_field: 0x00, endian_ability: 0, size: 1, invalid_value: 0xFF},
    'type':         {base_type_number:  0, base_type_field: 0x00, endian_ability: 0, size: 1, invalid_value: 0xFF},
    'manufacturer': {base_type_number:  0, base_type_field: 0x00, endian_ability: 0, size: 1, invalid_value: 0xFF},
    'event':        {base_type_number:  0, base_type_field: 0x00, endian_ability: 0, size: 1, invalid_value: 0xFF},
    'event_type':   {base_type_number:  0, base_type_field: 0x00, endian_ability: 0, size: 1, invalid_value: 0xFF},
    'sport':        {base_type_number:  0, base_type_field: 0x00, endian_ability: 0, size: 1, invalid_value: 0xFF},
    'sub_sport':    {base_type_number:  0, base_type_field: 0x00, endian_ability: 0, size: 1, invalid_value: 0xFF},
};

const enums = {
    file:         {activity: 4, workout: 5},
    activity:     {manual: 0, auto_multi_sport: 1},
    manufacturer: {dynastream: 15, wahoo: 32, elite: 86, tacx: 89, development: 255, zwift: 260},
    product:      {},
    event:        {timer: 0, session: 8, lap: 9, activity: 26, calibration: 36}, // 0(start), 8 (stop), 9(stop)
    event_type:   {start: 0, stop: 1, stop_all: 4},
    event_group:  {default: 0, one: 1}, // ? maybe, can't seem to find the values
    sport:        {cycling: 2},
    sub_sport:    {indoor_cycling: 6},
};

const garmin_epoch = Date.parse('31 Dec 1989 00:00:00 GMT');

const toFitTimestamp = (timestamp) => Math.round((timestamp - garmin_epoch) / 1000);
const toJsTimestamp  = (fitTimestamp) => (fitTimestamp * 1000) + garmin_epoch;
const now            = _ => toFitTimestamp(Date.now());

const getBitField = (field, bit) => (field >> bit) & 1;
const readUint16  = (blob, start) => blob[start]+(blob[start+1] << 8);
const readUint32  = (blob, start) => blob[start]+ (blob[start+1] << 8) + (blob[start+2] << 16) + (blob[start+3] << 24);

function FieldDefinition(args) {
    let type      = args.type;   // type (from base type table)
    let number    = args.number; // Defined in the Global FIT profile
    let size      = basetypes[type].size;
    let base_type = basetypes[type].base_type_field;

    let buffer = new ArrayBuffer(3);
    let view   = new DataView(buffer);

    view.setUint8(0, number,    true);
    view.setUint8(1, size,      true);
    view.setUint8(2, base_type, true);

    return {view: view, buffer: buffer};
}

let field_definitions = {
    file_id: {
        type:          FieldDefinition({number: 0, type: 'file'}),
        manufacturer:  FieldDefinition({number: 1, type: 'uint16'}),
        product:       FieldDefinition({number: 2, type: 'uint16'}),
        serial_number: FieldDefinition({number: 3, type: 'uint32z'}),
        time_created:  FieldDefinition({number: 4, type: 'date_time'}),
        // number:        FieldDefinition({number: 5, type: 'uint16'}),  // only set for files not created
        product_name:  FieldDefinition({number: 8, type: 'string'}),
    },

    event: {
        timestamp:   FieldDefinition({number: 253, type: 'date_time'}),
        event:       FieldDefinition({number:   0, type: 'event'}),
        event_type:  FieldDefinition({number:   1, type: 'event_type'}),
        event_group: FieldDefinition({number:   4, type: 'uint8'}),
    },

    record: {
        timestamp:  FieldDefinition({number: 253, type: 'date_time'}),
        heart_rate: FieldDefinition({number:   3, type: 'uint8'}),
        cadence:    FieldDefinition({number:   4, type: 'uint8'}),
        distance:   FieldDefinition({number:   5, type: 'uint32'}),
        speed:      FieldDefinition({number:   6, type: 'uint16'}),
        power:      FieldDefinition({number:   7, type: 'uint16'}),
    },

    lap: {
        message_index:      FieldDefinition({number: 254, type: 'uint16'}),
        timestamp:          FieldDefinition({number: 253, type: 'date_time'}),
        event:              FieldDefinition({number:   0, type: 'event'}),
        event_type:         FieldDefinition({number:   1, type: 'event_type'}),
        start_time:         FieldDefinition({number:   2, type: 'date_time'}),
        total_elapsed_time: FieldDefinition({number:   7, type: 'uint32'}),
        total_timer_time:   FieldDefinition({number:   8, type: 'uint32'}),
        total_distance:     FieldDefinition({number:   9, type: 'uint32'}),
        avg_speed:          FieldDefinition({number:  13, type: 'uint16'}),
        max_speed:          FieldDefinition({number:  14, type: 'uint16'}),
        avg_heart_rate:     FieldDefinition({number:  15, type: 'uint8'}),
        max_heart_rate:     FieldDefinition({number:  16, type: 'uint8'}),
        avg_cadence:        FieldDefinition({number:  17, type: 'uint8'}),
        max_cadence:        FieldDefinition({number:  18, type: 'uint8'}),
        avg_power:          FieldDefinition({number:  19, type: 'uint16'}),
        max_power:          FieldDefinition({number:  20, type: 'uint16'}),
        event_group:        FieldDefinition({number:  26, type: 'uint8'}),
    },

    session: {
        timestamp:          FieldDefinition({number: 253, type: 'date_time'}),
        event:              FieldDefinition({number:   0, type: 'event'}),
        event_type:         FieldDefinition({number:   1, type: 'event_type'}),
        start_time:         FieldDefinition({number:   2, type: 'date_time'}),
        sport:              FieldDefinition({number:   5, type: 'sport'}),
        sub_sport:          FieldDefinition({number:   6, type: 'sub_sport'}),
        total_elapsed_time: FieldDefinition({number:   7, type: 'uint32'}),
        total_timer_time:   FieldDefinition({number:   8, type: 'uint32'}),
        total_distance:     FieldDefinition({number:   9, type: 'uint32'}),
        avg_speed:          FieldDefinition({number:  14, type: 'uint16'}),
        max_speed:          FieldDefinition({number:  15, type: 'uint16'}),
        avg_heart_rate:     FieldDefinition({number:  16, type: 'uint8'}),
        max_heart_rate:     FieldDefinition({number:  17, type: 'uint8'}),
        avg_cadence:        FieldDefinition({number:  18, type: 'uint8'}),
        max_cadence:        FieldDefinition({number:  19, type: 'uint8'}),
        avg_power:          FieldDefinition({number:  20, type: 'uint16'}),
        max_power:          FieldDefinition({number:  21, type: 'uint16'}),
        first_lap_index:    FieldDefinition({number:  25, type: 'uint16'}),
        num_laps:           FieldDefinition({number:  26, type: 'uint16'}),
        event_group:        FieldDefinition({number:  27, type: 'uint8'}),
    },

    activity: {
        timestamp:        FieldDefinition({number: 253, type: 'date_time'}),
        total_timer_time: FieldDefinition({number:   0, type: 'uint32'}),
        num_sessions:     FieldDefinition({number:   1, type: 'uint16'}),
        type:             FieldDefinition({number:   2, type: 'enum'}),
        event:            FieldDefinition({number:   3, type: 'event'}),
        event_type:       FieldDefinition({number:   4, type: 'event_type'}),
        local_timestamp:  FieldDefinition({number:   5, type: 'date_time'}),
        event_group:      FieldDefinition({number:   6, type: 'uint8'}),
    }
};

function FitFileHeader(args) {
    let headerSize      = 14;                         // size is 12(depricated) or 14
    let protocolVersion = 32;                         // 16 v1, 32 v2
    let profileVersion  = 2140;                       // v21.40
    let dataSize        = args.size - headerSize - 2; // without header and crc
    let dataTypeByte    = [46, 70, 73, 84];           // ASCII values for ".FIT"
    let crc             = 0x0000;                     // optional, crc of the header 0-11 bytes

    let buffer = new ArrayBuffer(headerSize); // size is 12 or 14
    let view   = new DataView(buffer);

    view.setUint8( 0, headerSize,      true);
    view.setUint8( 1, protocolVersion, true);
    view.setUint16(2, profileVersion,  true);
    view.setInt32( 4, dataSize,        true);
    view.setUint8( 8, dataTypeByte[0], true);
    view.setUint8( 9, dataTypeByte[1], true);
    view.setUint8(10, dataTypeByte[2], true);
    view.setUint8(11, dataTypeByte[3], true);

    crc = calculateCRC(new Uint8Array(buffer), 0, 12);

    view.setUint16(12, crc,            true);

    return {view: view, buffer: buffer};
}

function calculateCRC(blob, start, end) {
    const crcTable = [
        0x0000, 0xCC01, 0xD801, 0x1400, 0xF001, 0x3C00, 0x2800, 0xE401,
        0xA001, 0x6C00, 0x7800, 0xB401, 0x5000, 0x9C01, 0x8801, 0x4400,
    ];

    let crc = 0;
    for (let i = start; i < end; i++) {
        const byte = blob[i];
        let tmp = crcTable[crc & 0xF];
        crc = (crc >> 4) & 0x0FFF;
        crc = crc ^ tmp ^ crcTable[byte & 0xF];
        tmp = crcTable[crc & 0xF];
        crc = (crc >> 4) & 0x0FFF;
        crc = crc ^ tmp ^ crcTable[(byte >> 4) & 0xF];
    }

    return crc;
}

function MsgHeader(args) {
    let header          = 0b00000000;

    let normalHeader    = 0b00000000;  // bit 7 = 1
    let timestampHeader = 0b10000000;  // bit 7 = 0
    let definitionMsg   = 0b01000000;  // bit 6 = 1
    let dataMsg         = 0b00000000;  // bit 6 = 0
    let hasDevData      = 0b00100000;  // bit 5 = 0
    let noDevData       = 0b00000000;  // bit 5 = 0
    let localMsgType    = args.localMsgType || 0b00000000; // bit 3-0 values (0...15)

    header |= args.localMsgType;

    if(args.headerType === 'normal')    header |= normalHeader;
    if(args.headerType === 'timestamp') header |= timestampHeader;
    if(args.msgType === 'definition')   header |= definitionMsg;
    if(args.msgType === 'data')         header |= dataMsg;
    if(args.developerDataFlag)          header |= hasDevData;
    if(!args.developerDataFlag)         header |= noDevData;
    if(!args.developerDataFlag)         header |= noDevData;

    return header;
}
function DefinitionMsgHeader() {
    return MsgHeader({headerType: 'normal', msgType: 'definition', developerDataFlag: false});
}
function DataMsgHeader() {
    return MsgHeader({headerType: 'normal', msgType: 'data', developerDataFlag: false});
}



// Definition Message factory
function DefinitionMsg(args) {
    let header   = DefinitionMsgHeader(); // 0b01000000 = 64

    let architecture    = 0; // 0 LittleEndian, 1 BigEndian
    let globalMsgNumber = args.globalMsgNumber || 0;
    let numberOfFields  = args.fields.length;
    let fields          = args.fields;

    let i = 6;
    let fieldDefinitionLength = 3;
    let size = i + (numberOfFields * fieldDefinitionLength);

    let buffer = new ArrayBuffer(size);
    let view   = new DataView(buffer);

    view.setUint8( 0, header,          true);
    view.setUint8( 1, 0,               true); // reserved
    view.setUint8( 2, architecture,    true);
    view.setUint16(3, globalMsgNumber, true);
    view.setUint8( 5, numberOfFields,  true);

    for(let field=0; field < numberOfFields; field++) {
        for(let fdi=0; fdi < fieldDefinitionLength; fdi++) {
            view.setUint8(i, fields[field].view.getUint8(fdi), true);
            i++;
        }
    }

    return {view: view, buffer: buffer};
}



// Data Messages
function FileIdMsg() {
    let header        = DataMsgHeader();
    let type          = 4;
    let manufacturer  = 255; //15;
    let product       = 0;   //22;
    let serial_number = 1234;
    let time_created  = now();

    let buffer = new ArrayBuffer(14);
    // let buffer = new ArrayBuffer(6);
    let view   = new DataView(buffer);

    view.setUint8(  0, header,        true);
    view.setUint8(  1, type,          true);
    view.setUint16( 2, manufacturer,  true);
    view.setUint16( 4, product,       true);
    view.setUint32( 6, serial_number, true);
    view.setUint32(10, time_created,  true);

    return {view: view, buffer: buffer};
}


function EventMsg(args = {}) {
    let header      = DataMsgHeader();
    let timestamp   = args.timestamp   || now();
    let event       = args.event       || enums.event.timer;
    let event_type  = args.event_type  || enums.event_type.start;
    let event_group = args.event_group || enums.event_group.default;

    let buffer = new ArrayBuffer(8);
    let view   = new DataView(buffer);

    view.setUint8( 0, header,      true);
    view.setUint32(1, timestamp,   true);
    view.setUint8( 5, event,       true);
    view.setUint8( 6, event_type,  true);
    view.setUint8( 7, event_group, true);

    return {view: view, buffer: buffer};
}

function RecordMsg(args) {
    let header     = DataMsgHeader();
    let timestamp  = args.timestamp  || now();
    let power      = args.power      || 0;
    let speed      = args.speed      || 0;
    let cadence    = args.cadence    || 0;
    let heart_rate = args.heart_rate || 0;
    let distance   = args.distance   || 0;


    let buffer = new ArrayBuffer(15);
    let view   = new DataView(buffer);

    view.setUint8(  0, header,     true);
    view.setUint32( 1, timestamp,  true);
    view.setUint16( 5, power,      true);
    view.setUint16( 7, speed,      true);
    view.setUint8(  9, cadence,    true);
    view.setUint8( 10, heart_rate, true);
    view.setUint32(11, distance,   true);

    return {view: view, buffer: buffer};
}

function LapMsg(args = {}) {
    let header      = DataMsgHeader();
    let timestamp   = args.timestamp   || now();
    let event       = args.event       || enums.event.lap;
    let event_type  = args.event_type  || enums.event_type.stop;
    let event_group = args.event_group || enums.event_group.default;
    let start_time  = args.start_time  || now();
    let total_elapsed_time = args.total_elapsed_time || 0;
    let avg_power   = args.avg_power   || 0;
    let max_power   = args.max_power   || 0;

    let buffer = new ArrayBuffer(20);
    let view   = new DataView(buffer);

    view.setUint8(  0, header,             true);
    view.setUint32( 1, timestamp,          true);
    view.setUint8(  5, event,              true);
    view.setUint8(  6, event_type,         true);
    view.setUint8(  7, event_group,        true);
    view.setUint32( 8, start_time,         true);
    view.setUint32(12, total_elapsed_time, true);
    view.setUint16(16, avg_power,          true);
    view.setUint16(18, max_power,          true);

    return {view: view, buffer: buffer};
}

function SessionMsg(args = {}) {
    let header    = DataMsgHeader();
    let timestamp   = args.timestamp   || now();
    let event       = args.event       || enums.event.session;
    let event_type  = args.event_type  || enums.event_type.stop;
    let event_group = args.event_group || enums.event_type.default;
    let start_time  = args.start_time  || now();
    let total_timer_time   = args.total_timer_time   || 0;
    let total_elapsed_time = args.total_elapsed_time || 0;
    let first_lap_index    = args.first_lap_index    || 0;
    let num_laps    = args.num_laps    || 1;
    let avg_power   = args.avg_power   || 0;
    let max_power   = args.max_power   || 0;
    let sport       = args.sport       || enums.sport.cycling;
    let sub_sport   = args.sub_sport   || enums.sub_sport.indoor_cycling;

    // let buffer = new ArrayBuffer(30);
    let buffer = new ArrayBuffer(26);
    let view   = new DataView(buffer);

    view.setUint8(  0, header,             true);
    view.setUint32( 1, timestamp,          true);
    view.setUint8(  5, event,              true);
    view.setUint8(  6, event_type,         true);
    view.setUint8(  7, event_group,        true);
    view.setUint32( 8, start_time,         true);
    view.setUint32(12, total_elapsed_time, true);
    view.setUint32(16, total_timer_time,   true);
    view.setUint16(20, first_lap_index,    true);
    view.setUint16(22, num_laps,           true);
    view.setUint8( 24, sport,              true);
    view.setUint8( 25, sub_sport,          true);
    // view.setUint16(26, avg_power,          true);
    // view.setUint16(28, max_power,          true);

    return {view: view, buffer: buffer};
}

function ActivityMsg(args = {}) {
    let header           = DataMsgHeader();
    let timestamp        = args.timestamp        || now();
    let local_timestamp  = args.local_timestamp  || now();
    let event            = args.event            || enums.event.activity;
    let event_type       = args.event_type       || enums.event_type.stop;
    let event_group      = args.event_group      || enums.event_type.default;
    let type             = args.type             || enums.activity.manual;
    let total_timer_time = args.total_timer_time || 0;
    let num_sessions     = args.num_sessions     || 1;

    let buffer = new ArrayBuffer(19);
    let view   = new DataView(buffer);

    view.setUint8(  0, header,           true);
    view.setUint32( 1, timestamp,        true);
    view.setUint32( 5, local_timestamp,  true);
    view.setUint8(  9, event,            true);
    view.setUint8( 10, event_type,       true);
    view.setUint8( 11, event_group,      true);
    view.setUint8( 12, type,             true);
    view.setUint32(13, total_timer_time, true);
    view.setUint16(17, num_sessions,     true);

    return {view: view, buffer: buffer};
}

let definitionMsgs = {
    fileId: DefinitionMsg({globalMsgNumber: global_msg_numbers.file_id,
                           fields: [field_definitions.file_id.type,
                                    field_definitions.file_id.manufacturer,
                                    field_definitions.file_id.product,
                                    field_definitions.file_id.serial_number,
                                    field_definitions.file_id.time_created,
                                   ]}),

    event:  DefinitionMsg({globalMsgNumber: global_msg_numbers.event,
                           fields: [field_definitions.event.timestamp,
                                    field_definitions.event.event,
                                    field_definitions.event.event_type,
                                    field_definitions.event.event_group,
                                   ]}),

    record: DefinitionMsg({globalMsgNumber: global_msg_numbers.record,
                           fields: [field_definitions.record.timestamp,
                                    field_definitions.record.power,
                                    field_definitions.record.speed,
                                    field_definitions.record.cadence,
                                    field_definitions.record.heart_rate,
                                    field_definitions.record.distance,
                                   ]}),

    lap:    DefinitionMsg({globalMsgNumber: global_msg_numbers.lap,
                           fields: [field_definitions.lap.timestamp,
                                    field_definitions.lap.event,
                                    field_definitions.lap.event_type,
                                    field_definitions.lap.event_group,
                                    field_definitions.lap.start_time,
                                    field_definitions.lap.total_elapsed_time,
                                    field_definitions.lap.avg_power,
                                    field_definitions.lap.max_power,
                                   ]}),

    session: DefinitionMsg({globalMsgNumber: global_msg_numbers.session,
                            fields: [field_definitions.session.timestamp,
                                     field_definitions.session.event,
                                     field_definitions.session.event_type,
                                     field_definitions.session.event_group,
                                     field_definitions.session.start_time,
                                     field_definitions.session.total_elapsed_time,
                                     field_definitions.session.total_timer_time,
                                     field_definitions.session.first_lap_index,
                                     field_definitions.session.num_laps,
                                     field_definitions.session.sport,
                                     field_definitions.session.sub_sport,
                                     // field_definitions.session.avg_power,
                                     // field_definitions.session.max_power,
                                    ]}),

    activity: DefinitionMsg({globalMsgNumber: global_msg_numbers.activity,
                             fields: [field_definitions.activity.timestamp,
                                      field_definitions.activity.local_timestamp,
                                      field_definitions.activity.event,
                                      field_definitions.activity.event_type,
                                      field_definitions.activity.event_group,
                                      field_definitions.activity.type,
                                      field_definitions.activity.total_timer_time,
                                      field_definitions.activity.num_sessions,
                                    ]}),
};

function calculateFileByteLength(args) {
    const data     = args.data.length || 1;
    const laps     = args.laps ? args.laps.length : 1;
    const header   = 14;
    const crc      = 2;
    const record   = RecordMsg(first(args.data)).view.byteLength;
    const fileId   = FileIdMsg().view.byteLength;
    const event    = EventMsg().view.byteLength;
    const lap      = LapMsg().view.byteLength;
    const session  = SessionMsg().view.byteLength;
    const activity = ActivityMsg().view.byteLength;

    const fileIdDefinition   = definitionMsgs.fileId.view.byteLength;
    const eventDefinition    = definitionMsgs.event.view.byteLength;
    const recordDefinition   = definitionMsgs.record.view.byteLength;
    const lapDefinition      = definitionMsgs.lap.view.byteLength;
    const sessionDefinition  = definitionMsgs.session.view.byteLength;
    const activityDefinition = definitionMsgs.activity.view.byteLength;

    return sum([
        header,

        fileIdDefinition,   fileId,
        eventDefinition,    event,
        recordDefinition,   record * data,
        eventDefinition,    event,
        lapDefinition,      lap * laps,
        sessionDefinition,  session,
        activityDefinition, activity,

        crc
    ]);
}

function dataToRecords(args) {
    let header = args.header;
    let data = args.data;
    let laps = args.laps;

    let avgPower = Math.round(avg(data, 'power'));
    let maxPower = max(data, 'power');
    let elapsed  = timeDiff(first(data).timestamp, last(data).timestamp) * 1000;
    let timer    = elapsed + 1000;

    let timeStart    = toFitTimestamp(first(data).timestamp);
    let timeEnd      = toFitTimestamp(last(data).timestamp);
    let timeEndLocal = timeEnd;

    let records = [];

    records[0] = header;
    records[1] = definitionMsgs.fileId;
    records[2] = FileIdMsg();
    records[3] = definitionMsgs.event;
    records[4] = EventMsg({timestamp:  timeStart,
                           event_type: enums.event_type.start});

    records[5] = definitionMsgs.record;

    for(let d=0; d < data.length; d++) {
        records.push(RecordMsg({timestamp:  toFitTimestamp(data[d].timestamp),
                                power:      data[d].power,
                                speed:      (data[d].speed / 3.6) * 1000,
                                cadence:    data[d].cadence,
                                heart_rate: data[d].hr,
                                distance:   data[d].distance * 100,
                               }));
    }

    records.push(definitionMsgs.event);
    records.push(EventMsg({timestamp:  timeEnd,
                           event_type: enums.event_type.stop_all}));
    records.push(definitionMsgs.lap);

    for(let l=0; l < laps.length; l++) {
        records.push(LapMsg({timestamp:          toFitTimestamp(laps[l].timestamp),
                             start_time:         toFitTimestamp(laps[l].startTime),
                             total_elapsed_time: laps[l].totalElapsedTime * 1000,
                             avg_power:          laps[l].avgPower,
                             max_power:          laps[l].maxPower,
                             message_index:      l}));
    }

    records.push(definitionMsgs.session);
    records.push(SessionMsg({timestamp:          timeEnd,
                             start_time:         timeStart,
                             total_elapsed_time: elapsed,
                             total_timer_time:   timer,
                             first_lap_index:    0,
                             num_laps:           laps.length,
                             avg_power:          avgPower,
                             max_power:          maxPower,
                             message_index:      0}));

    records.push(definitionMsgs.activity);
    records.push(ActivityMsg({timestamp:        timeEnd,
                              local_timestamp:  timeEndLocal,
                              total_timer_time: timer,
                              num_sessions:     1}));
    return records;
}

function Encode(args) {
    let data = args.data;
    let laps = args.laps;

    let fileByteLength = calculateFileByteLength({data: data, laps: laps});
    let dataByteLength = (fileByteLength - 14) - 2;
    let header  = FitFileHeader({size: fileByteLength});
    let records = dataToRecords({header: header, data: data, laps: laps});
    let buffer  = new ArrayBuffer(fileByteLength);
    let view    = new DataView(buffer);

    let i = 0;
    for(let r= 0; r < records.length; r++) {
        for(let v= 0; v < records[r].view.byteLength; v++) {
            view.setUint8(i, records[r].view.getUint8(v), true);
            i++;
        }
    }

    let crc = calculateCRC(new Uint8Array(view.buffer.slice(14, fileByteLength - 2)), 0, dataByteLength);
    view.setUint16( i, crc, true);

    let activity = view.buffer;
    // console.log(laps);
    // console.log(records);
    console.log(fileByteLength);

    // downloadActivity(activity);
    return activity;
}
export { Encode }
