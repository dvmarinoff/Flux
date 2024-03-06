import { dataviewToArray } from '../../src/functions.js';
import { definitionRecord } from '../../src/fit/definition-record.js';
import { fit } from '../../src/fit/fit.js';

describe('Developer Fields', () => {
    const dev_definition_record = [
        0b01100000, // header
        0,          // reserved
        0,          // architecture
        20, 0,      // global number
        4,          // number of fields
        3, 1, 2,    // heart_rate
        4, 1, 2,    // cadence
        5, 4, 134,  // distance
        6, 2, 132,  // speed
        1,          // number of dev fields
        0, 1, 0,    // developer
    ];

    const dev_fitjs = {
        type: 'definition',
        architecture: 0,
        name: 'record',
        local_number: 0,
        length: 22,
        data_record_length: 10,
        fields: [
            {number: 3, size: 1, base_type: 'uint8'}, // heart_rate
            {number: 4, size: 1, base_type: 'uint8'}, // cadence
            {number: 5, size: 4, base_type: 'uint32'}, // distance
            {number: 6, size: 2, base_type: 'uint16'}, // speed
        ],
        dev_fields: [
            {number: 0, size: 1, base_type: 'enum'}, // speed
        ],
    };

    test('decode', () => {
        const view = new DataView(new Uint8Array(dev_definition_record).buffer);

        expect(dev_fitjs).toEqual(definitionRecord.decode(view, 0));
    });

    test('encode', () => {
        const view = new DataView(new ArrayBuffer(dev_definition_record.length));

        console.log(dataviewToArray(definitionRecord.encode(dev_fitjs, view)));

        expect(
            dataviewToArray(definitionRecord.encode(dev_fitjs, view))
        ).toEqual(dev_definition_record);
    });
});
