//
// Local Activity Encoder
//

import { first, last, expect, } from '../functions.js';

import { profiles } from './profiles/profiles.js';
import productMessageDefinitions from './profiles/product-message-definitions.js';
import { CRC } from './crc.js';
import { fileHeader } from './file-header.js';
import { definitionRecord } from './definition-record.js';
import { dataRecord } from './data-record.js';
import { type } from './common.js';
import { FITjs } from './fitjs.js';

function LocalActivity(args = {}) {
    const definitions = productMessageDefinitions
          .reduce(function(acc, x) {
              const d = definitionRecord.toFITjs(x);
              acc[d.name] = d;
              return acc;
          }, {});

    // {records: [{<field>: Any}], laps: [{<field>: Any}]}
    // ->
    // [FITjs]
    function toFITjs(args = {}) {
        const records = args.records ?? [];
        const laps = args.laps ?? [];

        const time_created = last(args.records)?.timestamp ?? Date.now();
        const timestamp = time_created;
        const activity_start_time = first(laps).start_time;

        // structure: FITjs
        const structure = [
            // file header
            FileHeader(),

            // definition file_id
            definitions.file_id,
            // data file_id
            dataRecord.toFITjs(
                definitions.file_id,
                FileId({
                    time_created,
                    manufacturer:  1,    // garmin
                    product:       3570, // edge 1030
                    serial_number: 3313379353,
                })
            ),

            // definition file_creator
            definitions.file_creator,
            // data file_creator
            dataRecord.toFITjs(
                definitions.file_creator,
                FileCreator({
                    software_version: 29, // edge 1030
                })
            ),

            // definition record
            definitions.record,
            // data record messages
            ...records.map((record) => dataRecord.toFITjs(
                definitions.record, record
            )),

            // definition lap
            definitions.lap,
            // data lap messages
            ...laps.map((lap, message_index) =>
                dataRecord.toFITjs(
                    definitions.lap,
                    Lap({...lap, message_index})),
            ),

            // definition session
            definitions.session,
            // data session
            dataRecord.toFITjs(
                definitions.session,
                Session({
                    records,
                    laps,
                    definition: definitions.session,
                    timestamp,
                })
            ),

            // definition activity
            definitions.activity,
            // data activity
            dataRecord.toFITjs(
                definitions.activity,
                Activity({
                    timestamp,
                    activity_start_time,
                })
            ),
            // crc, needs to be computed last evetytime when encoding to binary
            CRC.toFITjs(),
        ];

        const header = first(structure);
        const fileSize = structure.reduce(
            (acc, x) => acc+=(x?.length ?? 0), 0
        );

        header.dataSize = fileSize -(header.length + CRC.size);

        return structure;
    }

    // {records: [{<field>: Any}], laps: [{<field>: Any}]}
    // -> Dataview
    function encode(args = {}) {
        const fitjs = toFITjs(args);
        return FITjs.encode(fitjs);
    }

    return Object.freeze({
        toFITjs,
        encode,
    });
}

// Special Data Messages
function FileHeader() {
    return fileHeader.toFITjs();
}

function FileId(args = {}) {
    return {
        time_created: args.time_created ?? Date.now(),
        manufacturer: args.manufacturer ?? 255,
        product: args.product ?? 0,
	      serial_number: args.serial_number ?? 0,
        number: 0,
        type: 4,
    };
}

function FileCreator(args = {}) {
    return {
        software_version: args.software_version ?? 0,
    };
}

function Event(args = {}) {
    return {};
}

function Lap(args = {}) {
    const start_time = expect(args.start_time, 'Lap needs start_time.');
    const timestamp = expect(args.timestamp, 'Lap needs timestamp.');
    const message_index = args.message_index ?? 0;
    const total_elapsed_time = args.total_elapsed_time ??
          type.timestamp.elapsed(start_time, timestamp);
    const total_timer_time = args.total_timer_time ?? total_elapsed_time;

    return {
        timestamp,
        start_time,
        total_elapsed_time,
        total_timer_time,
        message_index,
        event: profiles.types?.event?.values?.lap ?? 9,
        event_type: profiles.types?.event_type?.values?.stop ?? 1,
    };
}

function Activity(args = {}) {
    const total_timer_time = type.timestamp.elapsed(
        args.activity_start_time, args.timestamp
    );

    return {
        timestamp: expect(args.timestamp, 'Activity needs timestamp.'),
        total_timer_time,
        num_sessions: 1,
        type: profiles.types.activity.values.manual,
        event: profiles.types.event.values.activity,
        event_type: profiles.types.event_type.values.stop,
        // local_timestamp: args.timestamp,
    };
}
// END Special Data Messages

// Computed Data Messages
function Session(args = {}) {
    const records = expect(args.records, 'Session needs records.');
    const laps = expect(args.laps, 'Session needs laps.');
    const compute = true;

    const start_time = args.start_time ?? first(records).timestamp;
    const timestamp = args.timestamp ?? last(records).timestamp;
    const total_elapsed_time = args.total_elapsed_time ??
          type.timestamp.elapsed(start_time, timestamp);
    const total_timer_time = args.total_timer_time ?? total_elapsed_time;
    const message_index = args.message_index ?? 0;
    const num_laps = args.laps?.length ?? 1;

    const sport = profiles.types.sport.values.cycling;
    const sub_sport = profiles.types.sub_sport.values.virtual_activity;
    const first_lap_index = 0;

    const defaultStats = {
        avg_power: 0,
        avg_cadence: 0,
        avg_speed: 0,
        avg_heart_rate: 0,
        max_power: 0,
        max_cadence: 0,
        max_speed: 0,
        max_heart_rate: 0,
        total_distance: last(records)?.distance ?? 0,
        total_calories: 0,
    };

    const stats = records.reduce(function(acc, record, _, { length }) {
        acc.avg_power      += record.power / length;
        acc.avg_cadence    += record.cadence / length;
        acc.avg_speed      += record.speed / length;
        acc.avg_heart_rate += record.heart_rate / length;
        if(record.power      > acc.max_power)      acc.max_power      = record.power;
        if(record.cadence    > acc.max_cadence)    acc.max_cadence    = record.cadence;
        if(record.speed      > acc.max_speed)      acc.max_speed      = record.speed;
        if(record.heart_rate > acc.max_heart_rate) acc.max_heart_rate = record.heart_rate;
        return acc;
    }, defaultStats);

    stats.total_calories = Math.floor(stats.avg_power * total_timer_time / 1000);
    stats.avg_power = Math.floor(stats.avg_power);
    stats.avg_cadence = Math.floor(stats.avg_cadence);
    stats.avg_heart_rate = Math.floor(stats.avg_heart_rate);

    return {
        timestamp,
        start_time,
        total_timer_time,
        total_elapsed_time,
        message_index,
        sport,
        sub_sport,
        ...stats,
        first_lap_index,
        num_laps,
    };
}
// END Computed Data Messages

const localActivity = LocalActivity();

export {
    localActivity,
    FileId,
    Event,
    Lap,
    Session,
    Activity,
};

