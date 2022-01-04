import { uuids } from '../../src/ble/uuids.js';
import { Measurement, Speed, Cadence, _ } from '../../src/ble/cscs/measurement.js';

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

    const cadence = Cadence();
    cadence.setMaxRateCount(3);

    test('getRevs', () => {
        expect(cadence.getRevs()).toBe(-1);
    });

    test('setRevs', () => {
        expect(cadence.setRevs(47088)).toBe(47088);
        expect(cadence.getRevs()).toBe(47088);
    });

    test('getTime', () => {
        expect(cadence.getTime()).toBe(-1);
    });

    test('setTime', () => {
        expect(cadence.setTime(2048)).toBe(2048);
        expect(cadence.getTime(2048)).toBe(2048);
    });

    test('reset', () => {
        expect(cadence.reset()).toEqual({revs: -1, time: -1});
        expect(cadence.getRevs()).toBe(-1);
        expect(cadence.getTime()).toBe(-1);
    });

    test('rollOverTime split value', () => {
        cadence.reset();
        cadence.setTime(2**16 - 412);
        expect(cadence.rollOverTime()).toBe(-412);
    });

    test('rollOverTime perfect value', () => {
        cadence.reset();
        cadence.setTime(2**16);
        expect(cadence.rollOverTime(1024)).toBe(0);
    });

    test('rollOverRevs', () => {
        cadence.reset();
        cadence.setRevs(2**16 - 1);
        expect(cadence.rollOverRevs(1)).toBe(-1);
    });

    test('calculate initial returns 0', () => {
        cadence.reset();
        expect(cadence.calculate(1, 1024 * 1)).toEqual(0);
    });

    test('calculate time rollover', () => {
        cadence.reset();
        expect(cadence.calculate( 1, 1024 *  1)).toEqual(0);
        expect(cadence.calculate(63, 1024 * 63)).toEqual(60);
        expect(cadence.calculate(64, 1024 * 64)).toEqual(60);
        expect(cadence.calculate(65, 1024 * 65)).toEqual(60);
    });

    test('calculate coasting', () => {
        cadence.reset();
        expect(cadence.calculate( 1, 1024 *  1)).toEqual(0);
        expect(cadence.calculate(40, 1024 * 40)).toEqual(60);
        expect(cadence.calculate(40, 1024 * 50)).toEqual(0);
        expect(cadence.calculate(40, 1024 * 60)).toEqual(0);
        expect(cadence.calculate(41, 1024 * 61)).toEqual(60);
    });

    test('calculate 0 after no rev change over moving clock', () => {
        cadence.reset();
        expect(cadence.calculate( 1, 1024 *  1)).toEqual(0);

        expect(cadence.calculate(42, 1024 * 42  )).toEqual(60);
        expect(cadence.calculate(43, 1024 * 43  )).toEqual(60);
        expect(cadence.calculate(43, 1024 * 43.5)).toEqual(0);
    });

    test('calculate 0 after no rev change and still clock for 4 messages', () => {
        cadence.reset();
        expect(cadence.calculate( 1, 1024 *  1)).toEqual(0);

        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(0);
    });

    test('calculate start stop', () => {
        cadence.reset();
        expect(cadence.calculate( 1, 1024 *  1)).toEqual(0);

        expect(cadence.calculate(40, 1024 * 40)).toEqual(60);

        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(0);

        expect(cadence.calculate(42, 1024 * 42)).toEqual(60);
        expect(cadence.calculate(43, 1024 * 43)).toEqual(60);
        expect(cadence.calculate(43, 1024 * 44)).toEqual(0);

        expect(cadence.calculate(44, 1024 * 45)).toEqual(60);
    });

    test('calculate multple updates', () => {
        cadence.reset();
        expect(cadence.calculate( 1, 1024 *  1)).toEqual(0);
        expect(cadence.calculate(40, 1024 * 40)).toEqual(60);
        expect(cadence.calculate(40, 1024 * 40)).toEqual(60);
        expect(cadence.calculate(40, 1024 * 40)).toEqual(60);
        expect(cadence.calculate(40, 1024 * 40)).toEqual(60);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
    });

    test('calculate variable multple updates', () => {
        cadence.reset();
        expect(cadence.calculate( 1, 1024 *  1)).toEqual(0);

        // 2 in a row
        expect(cadence.calculate(40, 1024 * 40)).toEqual(60);
        expect(cadence.getRateCount()).toEqual(0);
        expect(cadence.calculate(40, 1024 * 40)).toEqual(60);
        expect(cadence.getRateCount()).toEqual(1);

        // 4 in a row
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.getRateCount()).toEqual(0);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.getRateCount()).toEqual(1);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.getRateCount()).toEqual(2);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.getRateCount()).toEqual(3);

        // 3 in a row
        expect(cadence.calculate(42, 1024 * 42)).toEqual(60);
        expect(cadence.calculate(42, 1024 * 42)).toEqual(60);
        expect(cadence.calculate(42, 1024 * 42)).toEqual(60);
        expect(cadence.getRateCount()).toEqual(2);

        // 2 in a row
        expect(cadence.calculate(43, 1024 * 43)).toEqual(60);
        expect(cadence.calculate(43, 1024 * 43)).toEqual(60);
        expect(cadence.getRateCount()).toEqual(1);

        // 5 in a row
        expect(cadence.calculate(44, 1024 * 44)).toEqual(60);
        expect(cadence.calculate(44, 1024 * 44)).toEqual(60);
        expect(cadence.calculate(44, 1024 * 44)).toEqual(60);
        expect(cadence.calculate(44, 1024 * 44)).toEqual(60);
        expect(cadence.calculate(44, 1024 * 44)).toEqual(0);
        expect(cadence.getRateCount()).toEqual(0);
    });

    test('calculate asc multple updates', () => {
        cadence.reset();
        expect(cadence.calculate( 1, 1024 *  1)).toEqual(0);

        // 1 in a row
        expect(cadence.calculate(45, 1024 * 45)).toEqual(60);
        expect(cadence.getRateCount()).toEqual(0);

        // 2 in a row
        expect(cadence.calculate(46, 1024 * 46)).toEqual(60);
        expect(cadence.calculate(46, 1024 * 46)).toEqual(60);
        expect(cadence.getRateCount()).toEqual(1);

        // 3 in a row
        expect(cadence.calculate(47, 1024 * 47)).toEqual(60);
        expect(cadence.calculate(47, 1024 * 47)).toEqual(60);
        expect(cadence.calculate(47, 1024 * 47)).toEqual(60);
        expect(cadence.getRateCount()).toEqual(2);

        // 4 in a row
        expect(cadence.calculate(48, 1024 * 48)).toEqual(60);
        expect(cadence.calculate(48, 1024 * 48)).toEqual(60);
        expect(cadence.calculate(48, 1024 * 48)).toEqual(60);
        expect(cadence.calculate(48, 1024 * 48)).toEqual(60);
        expect(cadence.getRateCount()).toEqual(3);

        // 5 in a row
        expect(cadence.calculate(49, 1024 * 49)).toEqual(60);
        expect(cadence.calculate(49, 1024 * 49)).toEqual(60);
        expect(cadence.calculate(49, 1024 * 49)).toEqual(60);
        expect(cadence.calculate(49, 1024 * 49)).toEqual(60);
        expect(cadence.calculate(49, 1024 * 49)).toEqual(0);
        expect(cadence.getRateCount()).toEqual(0);
    });

    test('calculate multple updates on time rollover', () => {
        cadence.reset();
        expect(cadence.calculate( 1, 1024 *  1)).toEqual(0);

        // 3 in a row
        expect(cadence.calculate(63, 1024 * 63)).toEqual(60);
        expect(cadence.calculate(63, 1024 * 63)).toEqual(60);
        expect(cadence.calculate(63, 1024 * 63)).toEqual(60);

        // 2 in a row
        expect(cadence.calculate(64, 1024 * 64)).toEqual(60);
        expect(cadence.calculate(64, 1024 * 64)).toEqual(60);

        // Time rollover
        // 3 in a row
        expect(cadence.calculate(65, 1024 * 1)).toEqual(60);
        expect(cadence.calculate(65, 1024 * 1)).toEqual(60);
        expect(cadence.calculate(65, 1024 * 1)).toEqual(60);

        // 2 in a row
        expect(cadence.calculate(66, 1024 * 2)).toEqual(60);
        expect(cadence.calculate(66, 1024 * 2)).toEqual(60);
    });

    test('calculate quick updates', () => {

        cadence.reset();
        expect(cadence.calculate( 1,  1024 *  1       )).toEqual(0);
        expect(cadence.calculate(40,  1024 * 40       )).toEqual(60); // 1
        expect(cadence.calculate(40, (1024 * 40) + 1  )).toEqual(60); // 2
        expect(cadence.calculate(40, (1024 * 40) + 2  )).toEqual(60); // 3
        expect(cadence.calculate(40, (1024 * 40) + 511)).toEqual(60); // 4
        expect(cadence.calculate(41,  1024 * 41       )).toEqual(60);
    });

    test('calculate decelerates to 0', () => {

        cadence.reset();
        expect(cadence.calculate( 1, 1024 *  1)).toEqual(0);
        expect(cadence.calculate(40, 1024 * 40)).toEqual(60);
        expect(cadence.calculate(41, 1024 * 41)).toEqual(60);
        expect(cadence.calculate(42, 1024 * 42)).toEqual(60);
        expect(cadence.calculate(43, 1024 * 44)).toEqual(30);
        expect(cadence.calculate(44, 1024 * 48)).toEqual(15);
        expect(cadence.calculate(45, 1024 * 56)).toEqual(8);
        expect(cadence.calculate(45, 1024 * 56)).toEqual(8);
        expect(cadence.calculate(45, 1024 * 56)).toEqual(8);
        expect(cadence.calculate(45, 1024 * 56)).toEqual(8);
        expect(cadence.calculate(45, 1024 * 56)).toEqual(0);
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

        cadence.reset();
        expect(cadence.calculate(data[0][0], data[0][1])).toEqual(0);
        expect(cadence.calculate(data[1][0], data[1][1])).toEqual(42);
        expect(cadence.calculate(data[2][0], data[2][1])).toEqual(45);
        expect(cadence.calculate(data[3][0], data[3][1])).toEqual(57);
        expect(cadence.calculate(data[4][0], data[4][1])).toEqual(66);
        expect(cadence.calculate(data[5][0], data[5][1])).toEqual(66);
        expect(cadence.calculate(data[6][0], data[6][1])).toEqual(66);
        expect(cadence.calculate(data[7][0], data[7][1])).toEqual(70);

        // 2**16 - (18705 + (1024 * 45)) = 751
        expect(cadence.calculate(
            data[7][0]+45, data[7][1] + (1024 * 45)
        )).toEqual(60);

        // 2**16 - (18705 + (1024 * 46)) = -273
        expect(cadence.calculate(
            data[7][0]+46, data[7][1] + (1024 * 46)
        )).toEqual(60);

        // 2**16 - (18705 + (1024 * 47)) = -1297
        expect(cadence.calculate(
            data[7][0]+47, data[7][1] + (1024 * 47)
        )).toEqual(60);
    });

    test('calculate from log', () => {
        // {revs: 41736, time: 41991, cad: 35},

        cadence.reset();

        const d = cadenceLog;

        cadenceLog.forEach(function(item, i, xs) {
            expect(cadence.calculate(
                item.revs, item.time
            )).toEqual(item.cad);
        });
    });
});

describe('speed', () => {
    const speed = Speed();

    test('getRevs', () => {
        expect(speed.getRevs()).toBe(-1);
    });

    test('setRevs', () => {
        expect(speed.setRevs(80)).toBe(80);
        expect(speed.getRevs()).toBe(80);
    });

    test('getTime', () => {
        expect(speed.getTime()).toBe(-1);
    });

    test('setTime', () => {
        expect(speed.setTime(2048)).toBe(2048);
        expect(speed.getTime(2048)).toBe(2048);
    });

    test('reset', () => {
        expect(speed.reset()).toEqual({revs: -1, time: -1});
        expect(speed.getRevs()).toBe(-1);
        expect(speed.getTime()).toBe(-1);
    });

    test('calculate initial returns 0', () => {
        speed.reset();
        expect(speed.calculate(1, 2048 * 1)).toEqual(0);
    });

    test('calculate time rollover', () => {

        speed.reset();
        expect(speed.calculate(4   , 2048 *  1)).toEqual(0);
        expect(speed.calculate(4*31, 2048 * 31)).toEqual(30.31);
        expect(speed.calculate(4*32, 2048 * 32)).toEqual(30.31);
        expect(speed.calculate(4*33, 2048 * 33)).toEqual(30.31);
    });

    test('calculate is not moving', () => {

        speed.reset();
        expect(speed.calculate(4   , 2048 *  1)).toEqual(0);
        expect(speed.calculate(4*10, 2048 * 10)).toEqual(30.31);
        expect(speed.calculate(4*10, 2048 * 11)).toEqual(0);
        expect(speed.calculate(4*10, 2048 * 12)).toEqual(0);
        expect(speed.calculate(4*11, 2048 * 13)).toEqual(30.31);
    });
});

describe('Measurement', () => {

    const measurement = Measurement();

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

const cadenceLog = [
    // Magene Gemini 200
    {revs: 41735, time: 40250, cad: 0},
    {revs: 41735, time: 40250, cad: 0},
    {revs: 41735, time: 40250, cad: 0},
    {revs: 41735, time: 40250, cad: 0},
    {revs: 41735, time: 40250, cad: 0},
    {revs: 41735, time: 40250, cad: 0},
    {revs: 41735, time: 40250, cad: 0},
    {revs: 41735, time: 40250, cad: 0},
    {revs: 41735, time: 40250, cad: 0},
    {revs: 41735, time: 40250, cad: 0},
    {revs: 41736, time: 41991, cad: 35},
    {revs: 41736, time: 41991, cad: 35},
    {revs: 41736, time: 41991, cad: 35},
    {revs: 41736, time: 41991, cad: 35},
    {revs: 41737, time: 43388, cad: 44},
    {revs: 41737, time: 43388, cad: 44},
    {revs: 41737, time: 43388, cad: 44},
    {revs: 41737, time: 43388, cad: 44},
    {revs: 41738, time: 44422, cad: 59},
    {revs: 41738, time: 44422, cad: 59},
    {revs: 41738, time: 44422, cad: 59},
    {revs: 41739, time: 45377, cad: 64},
    {revs: 41739, time: 45377, cad: 64},
    {revs: 41739, time: 45377, cad: 64},
    {revs: 41739, time: 45377, cad: 64},
    {revs: 41740, time: 46281, cad: 68},
    {revs: 41740, time: 46281, cad: 68},
    {revs: 41740, time: 46281, cad: 68},
    {revs: 41741, time: 47185, cad: 68},
    {revs: 41741, time: 47185, cad: 68},
    {revs: 41741, time: 47185, cad: 68},
    {revs: 41742, time: 48090, cad: 68},
    {revs: 41742, time: 48090, cad: 68},
    {revs: 41742, time: 48090, cad: 68},
    {revs: 41742, time: 48090, cad: 68},
    {revs: 41743, time: 48963, cad: 70},
    {revs: 41743, time: 48963, cad: 70},
    {revs: 41743, time: 48963, cad: 70},
    {revs: 41744, time: 49822, cad: 72},
    {revs: 41744, time: 49822, cad: 72},
    {revs: 41744, time: 49822, cad: 72},
    {revs: 41745, time: 50669, cad: 73},
    {revs: 41745, time: 50669, cad: 73},
    {revs: 41745, time: 50669, cad: 73},
    {revs: 41746, time: 51528, cad: 72},
    {revs: 41746, time: 51528, cad: 72},
    {revs: 41746, time: 51528, cad: 72},
    {revs: 41747, time: 52375, cad: 73},
    {revs: 41747, time: 52375, cad: 73},
    {revs: 41747, time: 52375, cad: 73},
    {revs: 41748, time: 53172, cad: 77},
    {revs: 41748, time: 53172, cad: 77},
    {revs: 41748, time: 53172, cad: 77},
    {revs: 41749, time: 53982, cad: 76},
    {revs: 41749, time: 53982, cad: 76},
    {revs: 41749, time: 53982, cad: 76},
    {revs: 41750, time: 54778, cad: 77},
    {revs: 41750, time: 54778, cad: 77},
    {revs: 41750, time: 54778, cad: 77},
    {revs: 41751, time: 55561, cad: 78},
    {revs: 41751, time: 55561, cad: 78},
    {revs: 41751, time: 55561, cad: 78},
    {revs: 41752, time: 56331, cad: 80},
    {revs: 41752, time: 56331, cad: 80},
    {revs: 41753, time: 57085, cad: 81},
    {revs: 41753, time: 57085, cad: 81},
    {revs: 41753, time: 57085, cad: 81},
    {revs: 41754, time: 57826, cad: 83},
    {revs: 41754, time: 57826, cad: 83},
    {revs: 41754, time: 57826, cad: 83},
    {revs: 41755, time: 58557, cad: 84},
    {revs: 41755, time: 58557, cad: 84},
    {revs: 41756, time: 59277, cad: 85},
    {revs: 41756, time: 59277, cad: 85},
    {revs: 41756, time: 59277, cad: 85},
    {revs: 41757, time: 59986, cad: 87},
    {revs: 41757, time: 59986, cad: 87},
    {revs: 41758, time: 60678, cad: 89},
    {revs: 41758, time: 60678, cad: 89},
    {revs: 41758, time: 60678, cad: 89},
    {revs: 41759, time: 61348, cad: 92},
    {revs: 41759, time: 61348, cad: 92},
    {revs: 41760, time: 62004, cad: 94},
    {revs: 41760, time: 62004, cad: 94},
    {revs: 41760, time: 62004, cad: 94},
    {revs: 41761, time: 62651, cad: 95},
    {revs: 41761, time: 62651, cad: 95},
    {revs: 41762, time: 63295, cad: 95},
    {revs: 41762, time: 63295, cad: 95},
    {revs: 41762, time: 63295, cad: 95},
    {revs: 41763, time: 63935, cad: 96},
    {revs: 41763, time: 63935, cad: 96},
    {revs: 41764, time: 64580, cad: 95},
    {revs: 41764, time: 64580, cad: 95},
    {revs: 41764, time: 64580, cad: 95},
    {revs: 41765, time: 65228, cad: 95},
    {revs: 41765, time: 65228, cad: 95},
    {revs: 41766, time: 347, cad: 95},
    {revs: 41766, time: 347, cad: 95},
    {revs: 41766, time: 347, cad: 94}, // should be 95
    {revs: 41767, time: 1005, cad: 93},
    {revs: 41767, time: 1005, cad: 93},
    {revs: 41767, time: 1005, cad: 93},
    {revs: 41768, time: 1673, cad: 92},
    {revs: 41768, time: 1673, cad: 92},
    {revs: 41769, time: 2347, cad: 91},
    {revs: 41769, time: 2347, cad: 91},
    {revs: 41769, time: 2347, cad: 91},
    {revs: 41770, time: 3023, cad: 91},
    {revs: 41770, time: 3023, cad: 91},
    {revs: 41770, time: 3023, cad: 91},
    {revs: 41771, time: 3705, cad: 90},
    {revs: 41771, time: 3705, cad: 90},
    {revs: 41771, time: 3705, cad: 90},
    {revs: 41771, time: 3705, cad: 90},
    {revs: 41772, time: 4391, cad: 90},
    {revs: 41773, time: 5085, cad: 89},
    {revs: 41773, time: 5085, cad: 89},
    {revs: 41773, time: 5085, cad: 89},
    {revs: 41774, time: 5783, cad: 88},
    {revs: 41774, time: 5783, cad: 88},
    {revs: 41774, time: 5783, cad: 88},
    {revs: 41775, time: 6491, cad: 87},
    {revs: 41775, time: 6491, cad: 87},
    {revs: 41775, time: 6491, cad: 87},
    {revs: 41776, time: 7205, cad: 86},
    {revs: 41776, time: 7205, cad: 86},
    {revs: 41776, time: 7205, cad: 86},
    {revs: 41777, time: 7928, cad: 85},
    // first real zero should be the next message
    {revs: 41777, time: 7928, cad: 85},
    {revs: 41777, time: 7928, cad: 85},
    {revs: 41777, time: 7928, cad: 85},
    {revs: 41777, time: 7928, cad: 0},
];
