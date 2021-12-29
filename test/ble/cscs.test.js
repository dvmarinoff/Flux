import { uuids } from '../../src/ble/uuids.js';
import { measurement, _ } from '../../src/ble/cscs/measurement.js';

global.console = {
    log: jest.fn(),
    error: console.error,
    warn: console.warn,
};

describe('index', () => {

    test('flagsIndex', () => {
        expect(_.flagsIndex()).toBe(0);
    });

    test('cumulativeWheelRevolutionsIndex', () => {
        expect(_.cumulativeWheelRevolutionsIndex(1)).toBe(1);
        expect(_.cumulativeWheelRevolutionsIndex(2)).toBe(undefined);
        expect(_.cumulativeWheelRevolutionsIndex(3)).toBe(1);
    });

    test('lastWheelEventTimeIndex', () => {
        expect(_.lastWheelEventTimeIndex(1)).toBe(5);
        expect(_.lastWheelEventTimeIndex(2)).toBe(undefined);
        expect(_.lastWheelEventTimeIndex(3)).toBe(5);
    });

    test('cumulativeCrankRevolutionsIndex', () => {
        expect(_.cumulativeCrankRevolutionsIndex(1)).toBe(undefined);
        expect(_.cumulativeCrankRevolutionsIndex(2)).toBe(1);
        expect(_.cumulativeCrankRevolutionsIndex(3)).toBe(7);
    });

    test('lastCrankEventTimeIndex', () => {
        expect(_.lastCrankEventTimeIndex(1)).toBe(undefined);
        expect(_.lastCrankEventTimeIndex(2)).toBe(3);
        expect(_.lastCrankEventTimeIndex(3)).toBe(9);
    });
});

describe('read', () => {

    const inputs = [
        [0x01, 0x0c,0x00,0x00,0x00, 0x44,0x1A],
        [0x02, 0x02,0x00, 0x99,0x1D],
        [0x03, 0x0c,0x00,0x00,0x00, 0x44,0x1A, 0x02,0x00, 0x99,0x1D],
    ].map((i) => new DataView(new Uint8Array(i).buffer));

    test('readFlags', () => {
        expect(_.readFlags(inputs[0])).toBe(1);
        expect(_.readFlags(inputs[1])).toBe(2);
        expect(_.readFlags(inputs[2])).toBe(3);
    });

    test('readCumulativeWheelRevolutions', () => {
        expect(_.readCumulativeWheelRevolutions(inputs[0])).toBe(12);
        expect(_.readCumulativeWheelRevolutions(inputs[1])).toBe(undefined);
        expect(_.readCumulativeWheelRevolutions(inputs[2])).toBe(12);
    });

    test('readLastWheelEventTime', () => {
        expect(_.readLastWheelEventTime(inputs[0])).toBe(6724);
        expect(_.readLastWheelEventTime(inputs[1])).toBe(undefined);
        expect(_.readLastWheelEventTime(inputs[2])).toBe(6724);
    });

    test('readCumulativeCrankRevolutions', () => {
        expect(_.readCumulativeCrankRevolutions(inputs[0])).toBe(undefined);
        expect(_.readCumulativeCrankRevolutions(inputs[1])).toBe(2);
        expect(_.readCumulativeCrankRevolutions(inputs[2])).toBe(2);
    });

    test('readLastCrankEventTime', () => {
        expect(_.readLastCrankEventTime(inputs[0])).toBe(undefined);
        expect(_.readLastCrankEventTime(inputs[1])).toBe(7577);
        expect(_.readLastCrankEventTime(inputs[2])).toBe(7577);
    });
});


describe('cadence', () => {

    test('getRevs', () => {
        expect(measurement.cadence.getRevs()).toBe(-1);
    });

    test('setRevs', () => {
        expect(measurement.cadence.setRevs(47088)).toBe(47088);
        expect(measurement.cadence.getRevs()).toBe(47088);
    });

    test('getTime', () => {
        expect(measurement.cadence.getTime()).toBe(-1);
    });

    test('setTime', () => {
        expect(measurement.cadence.setTime(2048)).toBe(2048);
        expect(measurement.cadence.getTime(2048)).toBe(2048);
    });

    test('reset', () => {
        expect(measurement.cadence.reset()).toEqual({revs: -1, time: -1});
        expect(measurement.cadence.getRevs()).toBe(-1);
        expect(measurement.cadence.getTime()).toBe(-1);
    });

    test('calculate initial returns 0', () => {
        measurement.cadence.reset();
        expect(measurement.cadence.calculate(1, 1024 * 1)).toEqual(0);
    });

    test('calculate time rollover', () => {

        measurement.cadence.reset();
        expect(measurement.cadence.calculate( 1, 1024 *  1)).toEqual(0);
        expect(measurement.cadence.calculate(63, 1024 * 63)).toEqual(60);
        expect(measurement.cadence.calculate(64, 1024 * 64)).toEqual(60);
        expect(measurement.cadence.calculate(65, 1024 * 65)).toEqual(60);
    });

    test('calculate coasting', () => {

        measurement.cadence.reset();
        expect(measurement.cadence.calculate( 1, 1024 *  1)).toEqual(0);
        expect(measurement.cadence.calculate(40, 1024 * 40)).toEqual(60);
        expect(measurement.cadence.calculate(40, 1024 * 50)).toEqual(0);
        expect(measurement.cadence.calculate(40, 1024 * 60)).toEqual(0);
        expect(measurement.cadence.calculate(41, 1024 * 61)).toEqual(60);
    });

    test('calculate data series', () => {
        // [flags, cumulative revs, last time event]
        //
        // [0x02, 0xf0, 0xb7, 0x67, 0x2b]
        // [0x02, 0xf1, 0xb7, 0x16, 0x31]
        // [0x02, 0xf2, 0xb7, 0x6d, 0x36]
        // [0x02, 0xf3, 0xb7, 0xac, 0x3a]
        // [0x02, 0xf4, 0xb7, 0x51, 0x3e]
        // [0x02, 0xf5, 0xb7, 0xf7, 0x41]
        // [0x02, 0xf6, 0xb7, 0x9d, 0x45]
        // [0x02, 0xf7, 0xb7, 0x11, 0x49]
        //
        // [2, 240, 183, 103, 43]
        // [2, 241, 183, 22, 49]
        // [2, 242, 183, 109, 54]
        // [2, 243, 183, 172, 58]
        // [2, 244, 183, 81, 62]
        // [2, 245, 183, 247, 65]
        // [2, 246, 183, 157, 69]
        // [2, 247, 183, 17, 73]
        //
        // [cumulative revs, last time event]
        const data = [
            [47088, 11111],
            [47089, 12566],
            [47090, 13933],
            [47091, 15020],
            [47092, 15953],
            [47093, 16887],
            [47094, 17821],
            [47095, 18705],
        ];

        measurement.cadence.reset();
        expect(measurement.cadence.calculate(data[0][0], data[0][1])).toEqual(0);
        expect(measurement.cadence.calculate(data[1][0], data[1][1])).toEqual(42);
        expect(measurement.cadence.calculate(data[2][0], data[2][1])).toEqual(45);
        expect(measurement.cadence.calculate(data[3][0], data[3][1])).toEqual(57);
        expect(measurement.cadence.calculate(data[4][0], data[4][1])).toEqual(66);
        expect(measurement.cadence.calculate(data[5][0], data[5][1])).toEqual(66);
        expect(measurement.cadence.calculate(data[6][0], data[6][1])).toEqual(66);
        expect(measurement.cadence.calculate(data[7][0], data[7][1])).toEqual(70);

        // 2**16 - (18705 + (1024 * 45)) = 751
        expect(measurement.cadence.calculate(
            data[7][0]+45, data[7][1] + (1024 * 45)
        )).toEqual(60);

        // 2**16 - (18705 + (1024 * 46)) = -273
        expect(measurement.cadence.calculate(
            data[7][0]+46, data[7][1] + (1024 * 46)
        )).toEqual(60);

        // 2**16 - (18705 + (1024 * 47)) = -1297
        expect(measurement.cadence.calculate(
            data[7][0]+47, data[7][1] + (1024 * 47)
        )).toEqual(60);
    });
});

describe('speed', () => {

    test('getRevs', () => {
        expect(measurement.speed.getRevs()).toBe(-1);
    });

    test('setRevs', () => {
        expect(measurement.speed.setRevs(80)).toBe(80);
        expect(measurement.speed.getRevs()).toBe(80);
    });

    test('getTime', () => {
        expect(measurement.speed.getTime()).toBe(-1);
    });

    test('setTime', () => {
        expect(measurement.speed.setTime(2048)).toBe(2048);
        expect(measurement.speed.getTime(2048)).toBe(2048);
    });

    test('reset', () => {
        expect(measurement.speed.reset()).toEqual({revs: -1, time: -1});
        expect(measurement.speed.getRevs()).toBe(-1);
        expect(measurement.speed.getTime()).toBe(-1);
    });

    test('calculate initial returns 0', () => {
        measurement.speed.reset();
        expect(measurement.speed.calculate(1, 2048 * 1)).toEqual(0);
    });

    test('calculate time rollover', () => {

        measurement.speed.reset();
        expect(measurement.speed.calculate(4   , 2048 *  1)).toEqual(0);
        expect(measurement.speed.calculate(4*31, 2048 * 31)).toEqual(30.31);
        expect(measurement.speed.calculate(4*32, 2048 * 32)).toEqual(30.31);
        expect(measurement.speed.calculate(4*33, 2048 * 33)).toEqual(30.31);
    });

    test('calculate is not moving', () => {

        measurement.speed.reset();
        expect(measurement.speed.calculate(4   , 2048 *  1)).toEqual(0);
        expect(measurement.speed.calculate(4*10, 2048 * 10)).toEqual(30.31);
        expect(measurement.speed.calculate(4*10, 2048 * 11)).toEqual(0);
        expect(measurement.speed.calculate(4*10, 2048 * 12)).toEqual(0);
        expect(measurement.speed.calculate(4*11, 2048 * 13)).toEqual(30.31);
    });
});

describe('Measurement', () => {

    test('reset', () => {
        expect(measurement.reset()).toEqual({
            wheel: {revs: -1, time: -1},
            crank: {revs: -1, time: -1}
        });
        expect(measurement.speed.getRevs()).toBe(-1);
        expect(measurement.speed.getTime()).toBe(-1);
        expect(measurement.cadence.getRevs()).toBe(-1);
        expect(measurement.cadence.getTime()).toBe(-1);
    });

    test('decode', () => {
        measurement.reset();

        const input = [
            [0x03, 0x00,0x00,0x00,0x00, 0x00,0x00, 0x00,0x00, 0x00,0x00],
            [0x03, 0x28,0x00,0x00,0x00, 0x00,0x50, 0x0A,0x00, 0x00,0x28],
            [0x03, 0x50,0x00,0x00,0x00, 0x00,0xA0, 0x14,0x00, 0x00,0x50],
        ].map((i) => new DataView(new Uint8Array(i).buffer));

        expect(measurement.decode(input[0])).toEqual({
            wheelRevolutions: 0,
            wheelEvent: 0,
            speed: 0,
            crankRevolutions: 0,
            crankEvent: 0,
            cadence: 0
        });

        expect(measurement.decode(input[1])).toEqual({
            wheelRevolutions: 40,
            wheelEvent: 10*2048,
            speed: 30.31,
            crankRevolutions: 10,
            crankEvent: 10*1024,
            cadence: 60
        });

        expect(measurement.decode(input[2])).toEqual({
            wheelRevolutions: 80,
            wheelEvent: 20*2048,
            speed: 30.31,
            crankRevolutions: 20,
            crankEvent: 20*1024,
            cadence: 60
        });
    });
});

