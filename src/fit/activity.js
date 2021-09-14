//
// Activity
// encodes records and laps to FIT activity file
//

import { exists, existance, equals, first, last, map } from '../functions.js';
import { fit } from './fit.js';
import { appTypes } from './profiles.js';
import { localMessageDefinitions as lmd } from './local-message-definitions.js';



const garmin_epoch = Date.parse('31 Dec 1989 00:00:00 GMT');

function toFitTimestamp(timestamp) {
    return Math.round((timestamp - garmin_epoch) / 1000);
}

function toFitElapsedTime(fitTimestamp) {
    return (fitTimestamp + 1) * 1000;
}

function toFitSpeed(speed, unit = 'kph') {
    const scale = 1000;

    if(unit === 'kph') {
        return parseInt((speed / 3.6) * scale, 10);
    }
    return speed;
}

function toFitDistance(distance, unit = 'km') {
    const scale = 100;

    if(unit === 'km') {
        return parseInt((distance * 1000) * scale, 10);
    }
    return distance;
}



function FileHeader(args = {}) {
    return {
        type: 'header',
        length: 14,
        protocolVersion: '2.0',
        profileVersion: '21.40',
        dataRecordsLength: undefined,
    };
}

function Data(args = {}) {
    const fields = args.definition.fields.reduce((acc, x) => {
        const transform = existance(args.transforms[x.field], ((x) => x));
        acc[x.field] = transform(existance(args.values[x.field], args.defaults[x.field]));
        return acc;
    }, {});

    return {
        type: 'data',
        message: args.definition.message,
        local_number: args.definition.local_number,
        fields: fields,
    };
}

function FileId(args = {}) {
    const defaults = {
        time_created: Date.now(),
        manufacturer: 255,
        product:      0,
        number:       0,
        type:         4
    };

    const transforms = {
        time_created: toFitTimestamp,
    };

    return Data({values: args, definition: lmd.fileId, transforms, defaults});
}

function DeviceInfo(args = {}) {
    const defaults = {
        timestamp: Date.now(),
        device_type: 0,
        serial_number: 0,
        manufacturer: 255,
        product: 0,
    };

    const transforms = {
        timestamp:  toFitTimestamp,
    };

    return Data({values: args, definition: lmd.deviceInfo, transforms, defaults});
}

function Event(args = {}) {
    const defaults = {
        event:      appTypes.event.values.timer,
        event_type: appTypes.event_type.values.start,
        event_group: 0,
    };

    const transforms = {
        timestamp:  toFitTimestamp,
    };

    return Data({values: args, definition: lmd.event, transforms, defaults});
};

function Record(args = {}) {
    const defaults = {heart_rate: 0, power: 0, cadence: 0, speed: 0, distance: 0};

    const transforms = {
        timestamp: toFitTimestamp,
        distance: toFitDistance,
        speed: toFitSpeed,
    };

    return Data({values: args, definition: lmd.record, transforms, defaults});
}

function Lap(args = {}) {
    let defaults = {
        avg_power:          0,
        max_power:          0,
        message_index:      0,
        total_elapsed_time: toFitTimestamp(args.timestamp) - toFitTimestamp(args.start_time),
        // calculate properly in the future by excluding pauses
        total_timer_time:   toFitTimestamp(args.timestamp) - toFitTimestamp(args.start_time),
        event:              appTypes.event.values.lap,
        event_type:         appTypes.event_type.values.stop,
    };

    let transforms = {
        timestamp:          toFitTimestamp,
        start_time:         toFitTimestamp,
        total_elapsed_time: toFitElapsedTime,
        total_timer_time:   toFitElapsedTime,
    };

    return Data({values: args, definition: lmd.lap, transforms, defaults});
}

function Session(args = {}) {
    let defaults = {
        total_elapsed_time: toFitTimestamp(args.timestamp) - toFitTimestamp(args.start_time),
        total_timer_time:   toFitTimestamp(args.timestamp) - toFitTimestamp(args.start_time),

        message_index:      0,
        first_lap_index:    0,
        num_laps:           1,
        sport:              appTypes.sport.values.cycling,
        sub_sport:          appTypes.sub_sport.values.virtual_activity,

        avg_power:          0,
        max_power:          0,
        avg_cadence:        0,
        max_cadence:        0,
        avg_speed:          0,
        max_speed:          0,
        avg_heart_rate:     0,
        max_heart_rate:     0,
        total_distance:     0, // meters
    };

    let transforms = {
        timestamp:          toFitTimestamp,
        start_time:         toFitTimestamp,
        total_elapsed_time: toFitElapsedTime,
        total_timer_time:   toFitElapsedTime, // calculate properly in the future by excluding pauses
        avg_speed:          toFitSpeed,
        max_speed:          toFitSpeed,
        total_distance:     toFitDistance,
    };

    return Data({values: args, definition: lmd.session, transforms, defaults});
}

function Activity(args = {}) {
    let defaults = {
        total_elapsed_time: toFitTimestamp(args.timestamp) - toFitTimestamp(args.start_time),
        total_timer_time:   toFitTimestamp(args.timestamp) - toFitTimestamp(args.start_time),
        local_timestamp:    0,
        num_sessions:       1,
        type:               appTypes.activity.values.manual,
        event:              appTypes.event.values.activity,
        event_type:         appTypes.event_type.values.stop,
    };

    let transforms = {
        timestamp:        toFitTimestamp,
        local_timestamp:  exists(args.local_timestamp) ? toFitTimestamp : ((x) => x),
        total_timer_time: toFitElapsedTime,
    };

    return Data({values: args, definition: lmd.activity, transforms, defaults});
}

function Summary(args = {}) {
    const records = args.records;

    let defaults = {
        start_time:         first(records).timestamp,
        end_time:           last(records).timestamp,

        avg_power:          0,
        max_power:          0,
        avg_cadence:        0,
        max_cadence:        0,
        avg_speed:          0,
        max_speed:          0,
        avg_heart_rate:     0,
        max_heart_rate:     0,
        total_distance:     last(records).distance, // meters
    };

    function format(v, k, i) {
        if(k === 'total_distance') return v;
        return Math.floor(v);
    }

    return map(records.reduce((acc, record, _, { length }) => {
        acc.avg_power      += record.power / length;
        acc.avg_cadence    += record.cadence / length;
        acc.avg_speed      += record.speed / length;
        acc.avg_heart_rate += record.heart_rate / length;

        if(record.power      > acc.max_power)      acc.max_power      = record.power;
        if(record.cadence    > acc.max_cadence)    acc.max_cadence    = record.cadence;
        if(record.speed      > acc.max_speed)      acc.max_speed      = record.speed;
        if(record.heart_rate > acc.max_heart_rate) acc.max_heart_rate = record.heart_rate;

        return acc;
    }, defaults), format);
}

function encode(args = {}) {
    const records      = existance(args.records);
    const laps         = existance(args.laps);
    const now          = existance(args.now, Date.now());
    const time_created = now;
    const timestamp    = now;
    const summary      = Summary({records: records});

    // records and laps to FITjs
    const fitjs = [
        FileHeader(),
        lmd.fileId,
        FileId({time_created: summary.start_time}),
        lmd.event,
        Event({timestamp: summary.start_time}),
        lmd.record,
        ...records.map(Record),
        Event({timestamp: summary.end_time,
               event_type: appTypes.event_type.values.stop_all}),
        lmd.lap,
        ...laps.map((l, i) =>
            Lap({timestamp:     l.timestamp,
                 start_time:    l.startTime,
                 message_index: i})),
        lmd.session,
        Session(Object.assign({timestamp}, summary)),
        lmd.activity,
        Activity({timestamp})
    ];

    // return fit.activity.encode(fitjs);

    return fitjs;
}

const activity = {
    encode,

    Data,
    FileHeader,
    FileId,
    DeviceInfo,
    Event,
    Record,
    Lap,
    Session,
    Activity,

    toFitTimestamp,
    toFitElapsedTime,
    toFitSpeed,
    toFitDistance,
};

export { activity };

