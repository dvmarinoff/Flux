import { coreBodyTemperature } from '../../src/ble/ct/core-body-temperature.js';
import { dataviewToArray } from '../../src/functions.js';

describe('Core Body Temperature', () => {

    test('coreBody temperature', () => {
        const dataview = coreBodyTemperature.encode({
            coreBodyTemperature: 38.12,
        });

        const expected = {
            coreBodyTemperature: 38.12,
        };

        const res = coreBodyTemperature.decode(dataview);
        expect(res).toEqual(expected);
    });

    test('coreBody + skin temperature', () => {
        const dataview = coreBodyTemperature.encode({
            coreBodyTemperature: 38.12,
            skinTemperature: 38.47,
        });

        console.log(dataview.buffer);
        console.log(dataviewToArray(dataview));

        const expected = {
            coreBodyTemperature: 38.12,
            skinTemperature: 38.47,
        };

        const res = coreBodyTemperature.decode(dataview);
        expect(res).toEqual(expected);
    });

    test('all', () => {

        const payload = [0b00010111, 228, 14, 7, 15, 0, 0, 0b00010011, 130];
        const dataview = new DataView(new Uint8Array(payload).buffer);

        console.log(dataview.buffer);
        console.log(dataviewToArray(dataview));

        const expected = {
            coreBodyTemperature: 38.12,
            skinTemperature: 38.47,
            coreReserved: 0,
            qualityAndState: 19,
            heartRate: 130,
        };

        const res = coreBodyTemperature.decode(dataview);
        expect(res).toEqual(expected);
    });
});

