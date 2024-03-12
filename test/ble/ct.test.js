import { coreBodyTemperature } from '../../src/ble/ct/core-body-temperature.js';

// [0b00010011, 3674, 3708, 0, 0, 130]

describe('Core Body Temperature', () => {

    test('coreBody temperature', () => {
        const dataview = coreBodyTemperature.encode({
            coreBodyTemperature: 36.74,
        });

        const expected = {
            coreBodyTemperature: 36.74,
        };

        const res = coreBodyTemperature.decode(dataview);
        expect(res).toEqual(expected);
    });

    test('coreBody + skin temperature', () => {
        const dataview = coreBodyTemperature.encode({
            coreBodyTemperature: 36.74,
            skinTemperature: 37.07,
        });

        const expected = {
            coreBodyTemperature: 36.74,
            skinTemperature: 37.07,
        };

        const res = coreBodyTemperature.decode(dataview);
        expect(res).toEqual(expected);
    });
});

