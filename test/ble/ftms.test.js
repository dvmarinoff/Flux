import { uuids } from '../../src/ble/web-ble.js';
import { control } from '../../src/ble/ftms/control-point.js';
import { indoorBikeData } from '../../src/ble/ftms/indoor-bike-data.js';
import { status } from '../../src/ble/ftms/fitness-machine-status.js';
import { supported } from '../../src/ble/ftms/supported-ranges.js';


global.console = {
    log: jest.fn(),
    error: console.error,
    warn: console.warn,
};

// Elite Suito
// (0x) [54, 08,  b9, 06,  b0, 00,  86, 0d, 00, 45, 00, 20, 01]
// (0x) [03, 25, a2, 00, 00, 1a, 34, 1c, 04, 10, 33]
// (0x) [0, 00, 3a, 00, 25, a2, 00, 00, 34, 68, 1c, 04, 10, 33]
// (0x) [ff]

// (0x) [54, 08,  b9, 06,  b0, 00,  86, 0d, 00, 45, 00, 20, 01]
// (10) [84,  8, 185,  6, 176,  0, 134, 13,  0, 69,  0, 32,  1]

// 13
// 2132 -> 0b0000100001010100
// flags 2, speed 2, cadence 2, distance 3, power 2, elapsedTime 2

//       flags  speed   cadence  distance   power  elapsedTime
// (10) [84,8,  185,6,  176,0,   134,13,0,  69,0,  32,1]


// (0x) [03, 25,  a2, 00, 00, 1a, 34, 1c, 04, 10, 33]
// (10) [ 3, 37, 162,  0,  0, 26, 52, 28,  4, 16, 51]

// 11
//

describe('Control Point', () => {

    describe('RequestControl', () => {
        test('opCode', () => {
            const res = control.requestControl.opCode;
            expect(res).toEqual(0x00);
        });

        test('length', () => {
            const res = control.requestControl.length;
            expect(res).toEqual(1);
        });

        test.skip('encode', () => {
            const res = control.requestControl.encode();
            const view = new DataView(res);
            expect(view.getUint8(0, true)).toBe(0);
        });

        test('decode', () => {
            const view = new DataView(new Uint8Array([0]).buffer);
            const res = control.requestControl.decode(view);
            expect(res).toEqual({opCode: 0});
        });
    });

    describe('Reset', () => {
        test('opCode', () => {
            const res = control.reset.opCode;
            expect(res).toEqual(0x01);
        });

        test('length', () => {
            const res = control.reset.length;
            expect(res).toEqual(1);
        });

        test.skip('encode', () => {
            const res = control.reset.encode();
            const view = new DataView(res);
            expect(view.getUint8(0, true)).toBe(1);
        });

        test('decode', () => {
            const view = new DataView(new Uint8Array([1]).buffer);
            const res = control.reset.decode(view);
            expect(res).toEqual({opCode: 1});
        });
    });

    describe('PowerTarget', () => {
        test('opCode', () => {
            const res = control.powerTarget.opCode;
            expect(res).toEqual(0x05);
        });

        test('length', () => {
            const res = control.powerTarget.length;
            expect(res).toEqual(3);
        });

        test.skip('encode', () => {
            const res = control.powerTarget.encode({power: 300});
            const view = new DataView(res);
            expect(view.getUint8(0, true)).toBe(5);
            expect(view.getInt16(1, true)).toBe(300);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array(3)).buffer);
            view.setUint8(0, 5, true);
            view.setInt16(1, 300, true);
            // [0, 44, 1]

            const res = control.powerTarget.decode(view);
            expect(res).toEqual({power: 300});
        });
    });

    describe('ResistanceTarget', () => {
        test('opCode', () => {
            const res = control.resistanceTarget.opCode;
            expect(res).toEqual(0x04);
        });

        test('length', () => {
            const res = control.resistanceTarget.length;
            expect(res).toEqual(3);
        });

        test.skip('encode', () => {
            const res = control.resistanceTarget.encode({resistance: 10});
            const view = new DataView(res);
            expect(view.getUint8(0, true)).toBe(4);
            expect(view.getInt16(1, true)).toBe(100);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array(3)).buffer);
            view.setUint8(0, 4, true);
            view.setInt16(1, 100, true);
            // []

            const res = control.resistanceTarget.decode(view);
            expect(res).toEqual({resistance: 10});
        });
    });

    describe('SimulationParameters', () => {
        test('opCode', () => {
            const res = control.simulationParameters.opCode;
            expect(res).toEqual(0x11);
        });

        test('length', () => {
            const res = control.simulationParameters.length;
            expect(res).toEqual(7);
        });

        test.skip('encode', () => {
            const res = control.simulationParameters.encode({
                windSpeed: 3,
                grade: 8.1,
                crr: 0.004,
                windResistance: 0.49,
            });
            const view = new DataView(res);
            expect(view.getUint8(0, true)).toBe(17);
            expect(view.getInt16(1, true)).toBe(3000);
            expect(view.getInt16(3, true)).toBe(810);
            expect(view.getUint8(5, true)).toBe(40);
            expect(view.getUint8(6, true)).toBe(49);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array(7)).buffer);
            view.setUint8(0, 17, true);
            view.setInt16(1, 3000, true);
            view.setInt16(3, 810, true);
            view.setUint8(5, 40, true);
            view.setUint8(6, 49, true);
            // [17, 184, 11, 42, 3, 40, 49]

            const res = control.simulationParameters.decode(view);
            expect(res).toEqual({
                windSpeed: 3,
                grade: 8.1,
                crr: 0.004,
                windResistance: 0.49,
            });
        });
    });

    describe('WheelCircumference', () => {
        test('opCode', () => {
            const res = control.wheelCircumference.opCode;
            expect(res).toEqual(0x12);
        });

        test('length', () => {
            const res = control.wheelCircumference.length;
            expect(res).toEqual(3);
        });

        test.skip('encode', () => {
            const res = control.wheelCircumference.encode({
                circumference: 2180,
            });
            const view = new DataView(res);
            expect(view.getUint8(0, true)).toBe(18);
            expect(view.getUint16(1, true)).toBe(21800);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array(3)).buffer);
            view.setUint8(0, 18, true);
            view.setUint16(1, 21800, true);
            // [18, 40, 85]

            const res = control.wheelCircumference.decode(view);
            expect(res).toEqual({
                circumference: 2180,
            });
        });
    });

    describe('Response', () => {
        test('opCode', () => {
            const res = control.response.opCode;
            expect(res).toEqual(0x80);
        });

        describe('decode', () => {
            test('request control success', () => {
                const view = new DataView((new Uint8Array(3)).buffer);
                view.setUint8(0, 128, true);
                view.setUint8(1, 0, true);
                view.setUint8(2, 1, true);
                // []

                const res = control.response.decode(view);
                expect(res).toEqual({
                    opCode: 128,
                    requestCode: 0,
                    resultCode: 1,
                });
            });

            test('set power target fail', () => {
                const view = new DataView((new Uint8Array(3)).buffer);
                view.setUint8(0, 128, true);
                view.setUint8(1, 5, true);
                view.setUint8(2, 3, true);
                // []

                const res = control.response.decode(view);
                expect(res).toEqual({
                    opCode: 128,
                    requestCode: 5,
                    resultCode: 3,
                });
            });

            test('set power target success', () => {
                const view = new DataView((new Uint8Array(3)).buffer);
                view.setUint8(0, 128, true);
                view.setUint8(1, 5, true);
                view.setUint8(2, 1, true);
                // []

                const res = control.response.decode(view);
                expect(res).toEqual({
                    opCode: 128,
                    requestCode: 5,
                    resultCode: 1,
                });
            });
        });
    });
});

describe('IndoorBikeData', () => {

    describe('decode', () => {
        test('speed-cadence-power', () => {
            const view = new DataView((new Uint8Array([68, 0, 24, 1, 20, 0, 6, 0])).buffer);

            const res = indoorBikeData.decode(view);
            expect(res).toEqual({
                speed: 280 * 0.01,
                cadence: 10,
                power: 6,
            });
        });

        test('speed-cadence-power-heartRate', () => {
            const view = new DataView((new Uint8Array([68, 2, 170, 5, 46, 0, 24, 0, 70])).buffer);

            const res = indoorBikeData.decode(view);
            expect(res).toEqual({
                speed: 1450 * 0.01,
                cadence: 23,
                power: 24,
                heartRate: 70,
            });
        });
    });
});

describe('FitnessMachineStatus', () => {

    describe('decode', () => {
        test('Target Power Changed', () => {
            const view = new DataView((new Uint8Array([8, 44, 1])).buffer);

            const res = status.decode(view);
            expect(res).toEqual({
                operation: 'Target Power Changed',
                value: {power: 300},
            });
        });

        test('Target Resistance Level Changed', () => {
            const view = new DataView((new Uint8Array([7, 100, 0])).buffer);

            const res = status.decode(view);
            expect(res).toEqual({
                operation: 'Target Resistance Level Changed',
                value: {resistance: 10},
            });
        });

        test('Indoor Bike Simulation Parameters Changed', () => {
            const view = new DataView((new Uint8Array([18, 184, 11, 42, 3, 40, 49])).buffer);

            const res = status.decode(view);
            expect(res).toEqual({
                operation: 'Indoor Bike Simulation Parameters Changed',
                value: {
                    windSpeed: 3,
                    grade: 8.1,
                    crr: 0.004,
                    windResistance: 0.49,
                },
            });
        });

        test('Wheel Circumference Changed', () => {
            const view = new DataView((new Uint8Array([19, 40, 85])).buffer);

            const res = status.decode(view);
            expect(res).toEqual({
                operation: 'Wheel Circumference Changed',
                value: {circumference: 2180},
            });
        });
    });
});

describe('SupportedRanges', () => {

    describe('PowerRange', () => {
        test.skip('encode', () => {
            const res = supported.powerRange.encode({min: 0, max: 800, inc: 1});
            const view = new DataView(res);

            expect(view.getUint16(0, true)).toBe(0);
            expect(view.getUint16(2, true)).toBe(800);
            expect(view.getUint16(4, true)).toBe(1);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array([0, 0, 32, 3, 1, 0])).buffer);

            const res = supported.powerRange.decode(view);
            expect(res).toEqual({
                min: 0,
                max: 800,
                inc: 1,
            });
        });
    });

    describe('ResistanceRange', () => {
        test.skip('encode', () => {
            const res = supported.resistanceRange.encode({min: 0, max: 100, inc: 1});
            const view = new DataView(res);

            expect(view.getUint16(0, true)).toBe(0);
            expect(view.getUint16(2, true)).toBe(100);
            expect(view.getUint16(4, true)).toBe(1);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array([0, 0, 232, 3, 1, 0])).buffer);

            const res = supported.resistanceRange.decode(view);
            expect(res).toEqual({
                min: 0,
                max: 1000,
                inc: 1,
            });
        });
    });
});
