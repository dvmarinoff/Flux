import { uuids } from '../../src/ble/uuids.js';
import { measurement, _ } from '../../src/ble/cps/cycling-power-measurement.js';

global.console = {
    log: jest.fn(),
    error: console.error,
    warn: console.warn,
};

describe('index', () => {

    test('flagsIndex', () => {
        expect(_.flagsIndex()).toBe(0);
    });

    test('wheelRevolutionsIndex', () => {
        expect(_.wheelRevolutionsIndex(48)).toBe(4);
    });

    test('wheelEventIndex', () => {
        expect(_.wheelEventIndex(48)).toBe(8);
    });

    test('crankRevolutionsIndex', () => {
        expect(_.crankRevolutionsIndex(48)).toBe(10);
    });

    test('crankEventIndex', () => {
        expect(_.crankEventIndex(48)).toBe(12);
    });
});

