import { Spec, State, RateAdjuster } from '../../src/ble/common.js';

global.console = {
    log: jest.fn(),
    error: console.error,
    warn: console.warn,
};

describe('RateAdjuster', () => {
    var log_4hz = [
        {ts: 1641391417056, r: 5495, t: 41229, c: 0},
        {ts: 1641391417296, r: 5495, t: 41229, c: 0},
        {ts: 1641391417539, r: 5495, t: 41229, c: 0},
        {ts: 1641391417791, r: 5495, t: 41229, c: 0},
        {ts: 1641391418031, r: 5495, t: 41229, c: 0},
        {ts: 1641391418301, r: 5495, t: 41229, c: 0},
        {ts: 1641391418526, r: 5495, t: 41229, c: 0},
        {ts: 1641391418781, r: 5495, t: 41229, c: 0},
        {ts: 1641391419021, r: 5495, t: 41229, c: 0},
        {ts: 1641391419276, r: 5495, t: 41229, c: 0}, // 10
        {ts: 1641391419516, r: 5495, t: 41229, c: 0},
        {ts: 1641391419771, r: 5495, t: 41229, c: 0},
        {ts: 1641391420011, r: 5495, t: 41229, c: 0},
        {ts: 1641391420267, r: 5495, t: 41229, c: 0},
        {ts: 1641391420506, r: 5495, t: 41229, c: 0},
        {ts: 1641391420761, r: 5495, t: 41229, c: 0},
        {ts: 1641391421001, r: 5495, t: 41229, c: 0},
        {ts: 1641391421256, r: 5495, t: 41229, c: 0},
        {ts: 1641391421496, r: 5495, t: 41229, c: 0},
        {ts: 1641391421751, r: 5495, t: 41229, c: 0}, // 20
        {ts: 1641391421976, r: 5495, t: 41229, c: 0},
        {ts: 1641391422276, r: 5495, t: 41229, c: 0},
        {ts: 1641391422576, r: 5495, t: 41229, c: 0},
        {ts: 1641391422876, r: 5495, t: 41229, c: 0},
        {ts: 1641391423176, r: 5495, t: 41229, c: 0},
        {ts: 1641391423476, r: 5495, t: 41229, c: 0},
        {ts: 1641391423477, r: 5495, t: 41229, c: 0},
        {ts: 1641391423776, r: 5495, t: 41229, c: 0},
        {ts: 1641391424076, r: 5495, t: 41229, c: 0},
        {ts: 1641391424376, r: 5495, t: 41229, c: 0}, // 30
        {ts: 1641391424676, r: 5495, t: 41229, c: 0},
        {ts: 1641391424990, r: 5495, t: 41229, c: 0},
        {ts: 1641391424990, r: 5496, t: 42732, c: 41},
        {ts: 1641391425276, r: 5496, t: 42732, c: 41},
        {ts: 1641391425576, r: 5496, t: 42732, c: 41},
        {ts: 1641391425886, r: 5496, t: 42732, c: 41},
        {ts: 1641391426513, r: 5496, t: 42732, c: 41},
        {ts: 1641391426514, r: 5496, t: 42732, c: 41},
        {ts: 1641391426515, r: 5497, t: 44018, c: 48},
        {ts: 1641391426776, r: 5497, t: 44018, c: 48}, // 40
        {ts: 1641391427076, r: 5497, t: 44018, c: 48},
        {ts: 1641391427376, r: 5497, t: 44018, c: 48},
        {ts: 1641391427676, r: 5497, t: 44018, c: 48},
        {ts: 1641391427677, r: 5498, t: 45082, c: 58},
        {ts: 1641391427976, r: 5498, t: 45082, c: 58},
        {ts: 1641391428276, r: 5498, t: 45082, c: 58},
        {ts: 1641391428576, r: 5498, t: 45082, c: 58},
        {ts: 1641391428876, r: 5498, t: 45082, c: 58},
        {ts: 1641391429176, r: 5498, t: 45082, c: 58},
        {ts: 1641391429177, r: 5499, t: 46142, c: 58}, // 50
        {ts: 1641391429476, r: 5499, t: 46142, c: 58},
        {ts: 1641391429776, r: 5499, t: 46142, c: 58},
        {ts: 1641391430076, r: 5499, t: 46142, c: 58},
        {ts: 1641391430376, r: 5499, t: 46142, c: 58},
        {ts: 1641391430676, r: 5500, t: 47191, c: 59},
        {ts: 1641391430976, r: 5500, t: 47191, c: 59},
        {ts: 1641391430977, r: 5500, t: 47191, c: 59},
        {ts: 1641391431276, r: 5500, t: 47191, c: 59},
        {ts: 1641391431576, r: 5500, t: 47191, c: 59},
        {ts: 1641391431876, r: 5501, t: 48558, c: 45}, // 60
    ];

    const log_1hz = [
        {ts: 1641378936327, r: 218, t: 16384, c: 0},
        {ts: 1641378937376, r: 218, t: 17408, c: 0},
        {ts: 1641378938276, r: 218, t: 18176, c: 0},
        {ts: 1641378939325, r: 218, t: 18816, c: 0},
        {ts: 1641378940375, r: 219, t: 20679, c: 33},
        {ts: 1641378941426, r: 220, t: 22132, c: 42},
        {ts: 1641378942326, r: 221, t: 23374, c: 49},
        {ts: 1641378943376, r: 222, t: 24556, c: 52},
        {ts: 1641378944276, r: 222, t: 24557, c: 52},
        {ts: 1641378945326, r: 223, t: 25728, c: 52}, // 10
        {ts: 1641378946376, r: 224, t: 26825, c: 56},
        {ts: 1641378947276, r: 225, t: 27922, c: 56},
        {ts: 1641378948325, r: 226, t: 28985, c: 58},
        {ts: 1641378949375, r: 227, t: 29976, c: 62},
        {ts: 1641378950276, r: 228, t: 30967, c: 62},
        {ts: 1641378951325, r: 229, t: 31945, c: 63},
        {ts: 1641378952375, r: 230, t: 32876, c: 66},
        {ts: 1641378953276, r: 232, t: 34738, c: 66},
        {ts: 1641378954326, r: 233, t: 35620, c: 70},
        {ts: 1641378955375, r: 234, t: 36498, c: 70}, // 20
        {ts: 1641378956276, r: 235, t: 37376, c: 70},
        {ts: 1641378957327, r: 236, t: 38238, c: 71},
        {ts: 1641378958376, r: 238, t: 39921, c: 73},
        {ts: 1641378959276, r: 239, t: 40752, c: 74},
        {ts: 1641378960326, r: 240, t: 41582, c: 74},
        {ts: 1641378961376, r: 241, t: 42412, c: 74},
        {ts: 1641378962276, r: 243, t: 44018, c: 77},
        {ts: 1641378963476, r: 244, t: 44806, c: 78},
        {ts: 1641378964526, r: 245, t: 45555, c: 82},
        {ts: 1641378965576, r: 247, t: 47018, c: 84}, // 30
    ];

    function onDone (maxRateCount) {}

    const rateAdjuster = RateAdjuster({
        sensor: 'cscs',
        onDone: onDone,
    });

    test('timestampAvgDiff', () => {
        expect(rateAdjuster.timestampAvgDiff(log_1hz.slice(0, 10))).toBeCloseTo(999.9);
        expect(rateAdjuster.timestampAvgDiff(log_1hz.slice(0, 20))).toBeCloseTo(1002.4);
        expect(rateAdjuster.timestampAvgDiff(log_1hz.slice(0, 30))).toBeCloseTo(1008.3);

        expect(rateAdjuster.timestampAvgDiff(log_4hz.slice(0, 10))).toBeCloseTo(322.0);
        expect(rateAdjuster.timestampAvgDiff(log_4hz.slice(0, 20))).toBeCloseTo(284.75);
        // expect(rateAdjuster.timestampAvgDiff(log_4hz.slice(0, 30))).toBeCloseTo(277.33);
        // expect(rateAdjuster.timestampAvgDiff(log_4hz.slice(0, 30))).toBeCloseTo(277.33);
        // expect(rateAdjuster.timestampAvgDiff(log_4hz.slice(0, 40))).toBeCloseTo(268.00);
        // expect(rateAdjuster.timestampAvgDiff(log_4hz.slice(0, 50))).toBeCloseTo(262.42);
        // expect(rateAdjuster.timestampAvgDiff(log_4hz.slice(0, 60))).toBeCloseTo(263.666);

        // expect(rateAdjuster.timestampAvgDiff(log_4hz.slice(30, 40))).toBeCloseTo(310.0);
        // expect(rateAdjuster.timestampAvgDiff(log_4hz.slice(30, 50))).toBeCloseTo(275.05);
    });

    test('calculate', () => {
        expect(rateAdjuster.calculate(log_1hz.slice(0, 10))).toBe(2);
        expect(rateAdjuster.calculate(log_1hz.slice(0, 20))).toBe(2);
        expect(rateAdjuster.calculate(log_1hz.slice(0, 30))).toBe(2);
    });

    test('update 1 Hz', () => {
        rateAdjuster.reset();
        expect(rateAdjuster.isDone()).toBe(false);

        for(let i=0; i < 20; i++) {
            rateAdjuster.update(log_1hz[i]);
        }

        expect(rateAdjuster.getSampleSize()).toBe(20);
        expect(rateAdjuster.getRate()).toBe(2);
        expect(rateAdjuster.isDone()).toBe(true);
    });
});
