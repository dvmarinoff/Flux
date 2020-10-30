let types = {
    fit_base_type: {'sint8': 0, 'uint8': 1, 'string': 7, 'sint16': 131, 'uint16': 132, 'float32': 136},
    message: {
        session: {global_field_number: 18,
                  fields: {
                      timestamp:          {field: 253, type: 'date_time', scale: null, offset: 0, units: 's' },
                      start_time:         {field: 2, type: 'date_time', scale: null, offset: 0, units: '' },
                      sport:              {field: 5, type: 'sport', scale: null, offset: 0, units: '' },
                      sub_sport:          {field: 6, type: 'sub_sport', scale: null, offset: 0, units: '' },
                      total_elapsed_time: {field: 7, type: 'uint32', scale: 1000, offset: 0, units: 's' },
                      total_timer_time:   {field: 8, type: 'uint32', scale: 1000, offset: 0, units: 's' },
                      total_distance:     {field: 9, type: 'uint32', scale: 100, offset: 0, units: 'm' },
                      first_lap_index:    {field: 25, type: 'uint16', scale: null, offset: 0, units: '' },
                      num_laps:           {field: 26, type: 'uint16', scale: null, offset: 0, units: '' },
                  }},
        lap: {global_field_number: 19,
              fields: {
                  timestamp:          {field: 253, type: 'date_time', scale: null, offset: 0, units: 's' },
                  start_time:         {field: 2, type: 'date_time', scale: null, offset: 0, units: '' },
                  total_elapsed_time: {field: 7, type: 'uint32', scale: 1000, offset: 0, units: 's' },
                  total_timer_time:   {field: 8, type: 'uint32', scale: 1000, offset: 0, units: 's' },

              }},
        record: {global_field_number: 20,
                 fields: {
                     timestamp:  {field: 253, type: 'date_time', scale: null, offset: 0, units: 's' },
                     heart_rate: {field: 3, type: 'uint8', scale: null, offset: 0, units: 'bpm' },
                     cadence:    {field: 4, type: 'uint8', scale: null, offset: 0, units: 'rpm' },
                     distance:   {field: 5, type: 'uint32', scale: 100, offset: 0, units: 'm' },
                     speed:      {field: 6, type: 'uint16', scale: 1000, offset: 0, units: 'm/s' },
                     power:      {field: 7, type: 'uint16', scale: null, offset: 0, units: 'watts' },
                 }},
        event: {global_field_number: 21,
                fields: {
                    timestamp:  {field: 253, type: 'date_time', scale: null, offset: '', units: 's' },
                    event:      {field: 0, type: 'event', scale: null, offset: '', units: '' },
                    event_type: {field: 1, type: 'event_type', scale: null, offset: '', units: '' },
                }},
        activity: {global_field_number: 34,
                   fields: {
                       timestamp:       {field: 253, type: 'date_time', scale: null, offset: 0, units: '' },
                       num_sessions:    {field: 1, type: 'uint16', scale: null, offset: 0, units: '' },
                       local_timestamp: {field: 5, type: 'local_date_time', scale: null, offset: 0, units: '' },
                   }},
        event:      {timer: 0, session: 8, lap: 9, activity: 26},
        event_type: {start: 0, stop: 1},
        sport:      {cycling: 2},
        subSport:   {indoorCycling: 6},
        activity_type:    {cycling: 2},
        activity_subtype: {indoorCycling: 6},
    }
};

let globalMsgNumbers = {
    product:   0, //?
    session:  18,
    lap:      19,
    record:   20,
    event:    21,
    activity: 34,
};

let basetypes  = {
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
    'sport':     {base_type_number:  7, base_type_field: 0x07, endian_ability: 0, size: 1, invalid_value: 0x00},
    'sub_sport': {base_type_number:  7, base_type_field: 0x07, endian_ability: 0, size: 1, invalid_value: 0x00},
};

let getBitField = (field, bit) => (field >> bit) & 1;
let readUint16  = (blob, start) => blob[start]+(blob[start+1] << 8);
let readUint32  = (blob, start) => blob[start]+ (blob[start+1] << 8) + (blob[start+2] << 16) + (blob[start+3] << 24);

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

let fieldDefinitions = {
    // id
    type:          FieldDefinition({number: 0, type: 'enum'}),   // 4 activity, 5 workout
    manufacturer:  FieldDefinition({number: 1, type: 'uint16'}), // 255 development, 15 dynastream, 0 0, zft 260
    product:       FieldDefinition({number: 2, type: 'uint16'}), // favero 0, grmn 1,
    serial_number: FieldDefinition({number: 3, type: 'uint32z'}), // originaly 'uint32z'
    time_created:  FieldDefinition({number: 4, type: 'date_time'}),
    product_name:  FieldDefinition({number: 8, type: 'string'}),

    // record
    timestamp:  FieldDefinition({number: 253, type: 'date_time'}),
    power:      FieldDefinition({number:   7, type: 'uint16'}),
    heart_rate: FieldDefinition({number:   3, type: 'uint8'}),
    cadence:    FieldDefinition({number:   4, type: 'uint8'}),
    speed:      FieldDefinition({number:   6, type: 'uint16'}),
    distance:   FieldDefinition({number:   5, type: 'uint32'}),

    //session
    start_time:         FieldDefinition({number:  2, type: 'date_time'}),
    sport:              FieldDefinition({number:  5, type: 'sport'}),
    sub_sport:          FieldDefinition({number:  6, type: 'sub_sport'}),
    total_elapsed_time: FieldDefinition({number:  7, type: 'uint32'}),
    total_timer_time:   FieldDefinition({number:  8, type: 'uint32'}),
    total_distance:     FieldDefinition({number:  9, type: 'uint32'}),
    first_lap_index:    FieldDefinition({number: 25, type: 'uint16'}),
    num_laps:           FieldDefinition({number: 26, type: 'uint16'}),

    // activity
    num_sessions:    FieldDefinition({number: 1, type: 'uint16'}),
    local_timestamp: FieldDefinition({number: 5, type: 'date_time'}),
};

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

function DataMsg(args) {
    let header    = DataMsgHeader();

    let buffer = new ArrayBuffer(7);
    let view   = new DataView(buffer);

    view.setUint8( 0, header,            true);
    view.setUint16(1, (args.power || 0), true);
    view.setUint32(3, args.timestamp,    true);

    return {view: view, buffer: buffer};
}

function FileIdMsg() {
    let header       = DataMsgHeader();
    let type         = 4;
    let manufacturer = 255; //15;
    let product      = 0;   //22;
    let serialNumber = 1234;
    let timeCreated  = 1603996083000;

    // let buffer = new ArrayBuffer(14);
    // let buffer = new ArrayBuffer(10);
    let buffer = new ArrayBuffer(6);
    let view   = new DataView(buffer);

    view.setUint8(  0, header,       true);
    view.setUint8(  1, type,         true);
    view.setUint16( 2, manufacturer, true);
    view.setUint16( 4, product,      true);
    // view.setUint32( 6, serialNumber, true);
    // view.setUint32(6, timeCreated,  true);
    // view.setUint32(10, timeCreated,  true);

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

function FitFileExample() {

    let data = [
        {power: 300, timestamp: 1603996083000},
        {power: 301, timestamp: 1603996084000},
        {power: 300, timestamp: 1603996085000},
        {power: 301, timestamp: 1603996086000},
    ];

    let record1 = DefinitionMsg({globalMsgNumber: 0,
                                 fields: [fieldDefinitions.type,
                                          fieldDefinitions.manufacturer,
                                          fieldDefinitions.product,
                                          // fieldDefinitions.serial_number,
                                          // fieldDefinitions.time_created,
                                         ]});
    let record2 = FileIdMsg();

    let record3 = DefinitionMsg({globalMsgNumber: 20,
                                 fields: [fieldDefinitions.power,
                                          fieldDefinitions.timestamp]});
    let record4 = DataMsg(data[0]);


    let len = 14 + record1.view.byteLength + record2.view.byteLength + record3.view.byteLength + record4.view.byteLength + 2;
    let buffer = new ArrayBuffer(len);
    let view   = new DataView(buffer);
    let header = FitFileHeader({size: len});
    let i = 0;

    let records = [header, record1, record2, record3, record4];

    for(let r= 0; r < records.length; r++) {
        for(let v= 0; v < records[r].view.byteLength; v++) {
            view.setUint8(i, records[r].view.getUint8(v), true);
            i++;
        }
    }
    let crc = calculateCRC(new Uint8Array(view.buffer.slice(14, len - 2)), 0, len-16);
    view.setUint16( i, crc, true);

    // console.log(header.buffer);
    // console.log(record1.buffer);
    // console.log(record2.buffer);
    // console.log(record3.buffer);
    // console.log(record4.buffer);
    // console.log(len);
    // console.log(crc);
    // console.log(view.buffer);

    var activity = view.buffer;

    var saveByteArray = (function () {
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        return function (data, name) {
            var blob = new Blob(data, {type: 'application/octet-stream'}),
                url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = name;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());

    // saveByteArray([activity], 'minexample.fit');
}

function Encode() {}

export { FitFileExample, Encode }
