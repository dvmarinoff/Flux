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

function SessionMsg() {
    let globalMessageNumber = 18;
}
function LapMsg() {
    let globalMessageNumber = 19;
}
function RecordMsg(args) {
    let globalMessageNumber = 20;
    let { timeStamp, hr, cad, distance, spd, pwr } = args;
    return {timeStamp: timeStamp,
            hr: hr,
            cad: cad,
            distance: distance,
            spd: spd,
            pwr: pwr};
}
function EventMsg() {
    let globalMessageNumber = 21;
}
function ActivityMsg() {
    let globalMessageNumber = 34;
}


function FieldDefinition(args) {
    let fieldDefinitionNumber = args.fieldNumber; // Defined in the Global FIT profile
    let size = args.size;         // Size (bytes) of the specified FIT message’s field
    let baseType = args.baseType; // Base type (unsigned char, signed short, ...)

    let buffer = new ArrayBuffer(3);
    let view   = new DataView(buffer);

    view.setUint8(0, fieldDefinitionNumber , true);
    view.setInt16(1, size, true);
    view.setInt16(2, baseType, true);
    return buffer;
}

let powerFieldDefinition   = FieldDefinition({fieldNumber: 0, size: 0, baseType: 4});
let cadenceFieldDefinition = FieldDefinition({fieldNumber: 0, size: 0, baseType: 2});
let hrFieldDefinition      = FieldDefinition({fieldNumber: 0, size: 0, baseType: 2});



function Msg() {}

function FitFileHeader() {
    let buffer = new ArrayBuffer(12); // size is 12 or 14
    let view   = new DataView(buffer);
    let headerSize      = 12;
    let protocolVersion = 20;
    let profileVersion  = 10;         // ?
    let dataSize        = 0;
    let dataTypeByte    = [46, 70, 73, 84]; // ASCII values for ".FIT"
    let crc             = 0x0000;           // optional

    view.setUint8( 0, headerSize,      true);
    view.setUint8( 1, protocolVersion, true);
    view.setUint16(2, profileVersion,  true);
    view.setInt32( 4, dataSize,        true);
    view.setUint8( 8, dataTypeByte[0], true);
    view.setUint8( 9, dataTypeByte[1], true);
    view.setUint8(10, dataTypeByte[2], true);
    view.setUint8(11, dataTypeByte[3], true);
    // view.setUint16(12, crc,             true);

    return buffer;
}

function MsgHeader(args) {
    let header          = 0b00000000;

    let normalHeader    = 0b10000000;  // bit 7 = 1
    let timestampHeader = 0b00000000;  // bit 7 = 0
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

function DataMsgHeader() {
    return MsgHeader({headerType: 'normal', msgType: 'data', developerDataFlag: false});
}
function DataMsgContent() {
    let buffer = new ArrayBuffer();
    let view   = new DataView(buffer);
}

function DefinitionMsgHeader() {
    return MsgHeader({headerType: 'normal', msgType: 'definition', developerDataFlag: false});
}
function DefinitionMsgContent(args) {
    let buffer = new ArrayBuffer(); // size is 12 or 14
    let view   = new DataView(buffer);
    let architecture    = 0; // 0 LittleEndian, 1 BigEndian
    let globalMsgNumber = args.globalMsgNumber || 0;
    let numberOfFields  = args.numberOfFields || 0;

    view.setUint8( 0, 0,               true);
    view.setUint8( 1, architecture,    true);
    view.setUint16(2, globalMsgNumber, true);
    view.setUint8( 4, numberOfFields,  true);
    // ...
}
function DefinitionMsg(args) {
    let header   = DefinitionMsgHeader();
    let contents = DefinitionMsgContent();
}

let getBitField = (field, bit) => (field >> bit) & 1;

function FitFileExample() {
    let buffer = new ArrayBuffer();
    let view   = new DataView(buffer);

    let header = FitFileHeader();

    let record1 = DefinitionMsg();

    return buffer;
}




function Encode() {
    let startTime = new Date.now();      // 1603377421339
    let timestamp = new Date(startTime); // Thu Oct 22 2020 17:36:34 GMT+0300 (Eastern European Summer Time)
    let messages = [];

    // Record
    let recordMsg = new RecordMsg();
    recordMsg.setTimestamp(timestamp); // 253, 0, DateTime        // units: s , lap end time
    recordMsg.setHR(140);              //   3, 0, byte?    Uint8  // units: bpm
    recordMsg.setCad(80);              //   4, 0, byte?    Uint8  // units: rpm
    recordMsg.setDistance(1);          //   5, 0, float?   4bytes // units: m
    recordMsg.setSpd(34);              //   6, 0, float?   4bytes // units: m/s
    recordMsg.setPwr(235);             //   7, 0, ushort?  Uint16 // units: watts

    messages.push(recordMsg);

    // Lap
    let lapMsg = new LapMsg();
    lapMsg.setTimestamp(timestamp);        // 253, 0, DateTime // units: s , lap end time
    lapMsg.setStartTime(startTime);        //   2, 0, DateTime // units: s
    lapMsg.setTotalElapsedTime(timestamp); //   7, 0, float?   // units: s , includes pauses
    lapMsg.setTotalTimerTime(timestamp);   //   8, 0, float?   // units: s , excludes pauses

    messages.push(lapMsg);

    // Session
    let sessionMsg = new SessionMsg();
    sessionMsg.setTimestamp(timestamp);        // 253, 0, DateTime // units: s, session end time
    sessionMsg.setStartTime(startTime);        //   2, 0, DateTime // units: s,
    sessionMsg.setSport(2);                    //   5, 0, Sport? -> byte // SetFieldValue(5, 0, sport_, Fit.SubfieldIndexMainField);
    sessionMsg.setSubSport(6);                 //   6, 0, Sport? -> byte
    sessionMsg.setTotalElapsedTime(timestamp); //   7, 0, float?   // units: s, includes pauses
    sessionMsg.setTotalTimerTime(timestamp);   //   8, 0, float?   // units: s, excludes pauses
    sessionMsg.setFirstLapIndex(0);            //  25, 0, ushort?
    sessionMsg.setNumLaps(1);                  //  26, 0, ushort?

    messages.push(sessionMsg);

    // Activity
    let activityMsg = new ActivityMsg();
    let timezoneOffset = new Date(Date.now()).getTimezoneOffset(); // TotalSeconds
    activityMsg.setTimestamp(timestamp);                           // 253, 0, DateTime // units: s, session end time
    activityMsg.setNumSessions(1);                                 //   1, 0, ushort?
    activityMsg.setLocalTimestamp(timestamp + timezoneOffset);     //   5, 0, uint?

    messages.push(activityMsg);

    // Timer Events are a BEST PRACTICE for FIT ACTIVITY files
    // eventMesgStart.SetTimestamp(startTime);
    // eventMesgStart.SetEvent(Event.Timer);
    // eventMesgStart.SetEventType(EventType.Start);
    // messages.Add(eventMesgStart);

    // recordMsg.SetPower((ushort)(i)); // Square
    // recordMsg.SetHeartRate((byte)(i)); // Sine
    // recordMesg.SetCadence((byte)(i % 255)); // Sawtooth
    // recordMesg.SetDistance(i); // Ramp
    // recordMesg.SetSpeed(1); // Flatline

    // lapMesg.SetTimestamp(timestamp);
    // lapMesg.SetStartTime(startTime);
    // lapMesg.SetTotalElapsedTime(timestamp.GetTimeStamp() - startTime.GetTimeStamp());
    // lapMesg.SetTotalTimerTime(timestamp.GetTimeStamp() - startTime.GetTimeStamp());
    // messages.Add(lapMesg);

    // sessionMesg.SetTimestamp(timestamp);
    // sessionMesg.SetStartTime(startTime);
    // sessionMesg.SetTotalElapsedTime(timestamp.GetTimeStamp() - startTime.GetTimeStamp());
    // sessionMesg.SetTotalTimerTime(timestamp.GetTimeStamp() - startTime.GetTimeStamp());
    // sessionMesg.SetSport(Sport.Cycling);
    // sessionMesg.SetSubSport(SubSport.IndoorCycling);
    // sessionMesg.SetFirstLapIndex(0);
    // sessionMesg.SetNumLaps(1);


    // activityMesg.SetTimestamp(timestamp);
    // activityMesg.SetNumSessions(1);
    // var timezoneOffset = (int)TimeZoneInfo.Local.BaseUtcOffset.TotalSeconds;
    // activityMesg.SetLocalTimestamp((uint)((int)timestamp.GetTimeStamp() + timezoneOffset));
    // messages.Add(activityMesg);

    // SetFieldValue(5, 0, sport_, Fit.SubfieldIndexMainField); ->
    //
    // Field field = GetField(fieldNum);
    // field.SetValue(fieldArrayIndex, value, subfieldIndex);
}

export { Encode }
