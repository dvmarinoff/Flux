import { uuids } from '../../src/ble/uuids.js';
import { control } from '../../src/ble/wcps/control.js';
import { dataviewToArray } from '../../src/functions.js';

global.console = {
    log: jest.fn(),
    error: console.error,
    warn: console.warn,
};

describe('Control Point', () => {

    describe('RequestControl', () => {
        test('opCode', () => {
            const res = control.requestControl.opCode;
            expect(res).toBe(0x20);
        });

        test('length', () => {
            const res = control.requestControl.length;
            expect(res).toEqual(3);
        });

        test('encode', () => {
            const res = control.requestControl.encode();
            const view = new DataView(res);
            expect(dataviewToArray(view)).toEqual([0x20, 0xEE, 0xFC]);
        });

        test('decode', () => {
            const view = new DataView(new Uint8Array([0x20, 0xEE, 0xFC]).buffer);
            const res = control.requestControl.decode(view);
            expect(res).toEqual({opCode: 0x20, unlockCode: [0xEE, 0xFC]});
        });
    });

    describe('PowerTarget', () => {
        test('opCode', () => {
            const res = control.powerTarget.opCode;
            expect(res).toEqual(0x42);
        });

        test('length', () => {
            const res = control.powerTarget.length;
            expect(res).toEqual(3);
        });

        test('encode', () => {
            const res = control.powerTarget.encode({power: 200});
            const view = new DataView(res);
            expect(view.getUint8(0, true)).toBe(0x42);
            expect(view.getUint16(1, true)).toBe(200);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array(3)).buffer);
            view.setUint8( 0, 0x42, true);
            view.setUint16(1, 200, true);

            const res = control.powerTarget.decode(view);
            expect(res).toEqual({power: 200});
        });

        test('encode -> decode', () => {
            const value  = {power: 200};
            const buffer = control.powerTarget.encode(value);
            const res    = control.powerTarget.decode(new DataView(buffer));

            expect(res).toEqual(value);
        });
    });

    describe('LoadIntensity', () => {
        test('opCode', () => {
            const res = control.loadIntensity.opCode;
            expect(res).toEqual(0x40);
        });

        test('length', () => {
            const res = control.loadIntensity.length;
            expect(res).toEqual(3);
        });

        test('encode', () => {
            const res = control.loadIntensity.encode({intensity: 0.1});
            const view = new DataView(res);
            expect(view.getUint8(0, true)).toBe(0x40);
            expect(view.getUint16(1, true)).toBe(14745);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array(3)).buffer);
            view.setUint8(0, 0x40, true);
            view.setUint16(1, 14745, true);
            // []

            const res = control.loadIntensity.decode(view);
            expect(res).toEqual({intensity: 0.1});
        });

        test('encode -> decode', () => {
            const value  = {intensity: 0.1};
            const buffer = control.loadIntensity.encode(value);
            const res    = control.loadIntensity.decode(new DataView(buffer));

            expect(res).toEqual(value);
        });
    });

    describe('LoadLevel', () => {
        test('opCode', () => {
            const res = control.loadLevel.opCode;
            expect(res).toEqual(0x41);
        });

        test('length', () => {
            const res = control.loadLevel.length;
            expect(res).toEqual(2);
        });

        test('encode', () => {
            const res = control.loadLevel.encode({level: 1});
            const view = new DataView(res);
            expect(view.getUint8(0, true)).toBe(0x41);
            expect(view.getUint8(1, true)).toBe(1);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array(3)).buffer);
            view.setUint8(0, 0x40, true);
            view.setUint8(1, 1, true);
            // []

            const res = control.loadLevel.decode(view);
            expect(res).toEqual({level: 1});
        });

        test('encode -> decode', () => {
            const value  = {level: 1};
            const buffer = control.loadLevel.encode(value);
            const res    = control.loadLevel.decode(new DataView(buffer));

            expect(res).toEqual(value);
        });
    });

    describe('SlopeTarget', () => {
        test('opCode', () => {
            const res = control.slopeTarget.opCode;
            expect(res).toEqual(0x46);
        });

        test('length', () => {
            const res = control.slopeTarget.length;
            expect(res).toEqual(3);
        });

        test('definitions', () => {
            const res = control.slopeTarget.definitions;
            expect(res).toEqual({
                grade: {
                    resolution: 1,
                    unit: '%',
                    size: 2,
                    min: 0,
                    max: 65536,
                    default: 32768
                },
            });
        });

        test('encode', () => {
            const res = control.slopeTarget.encode({grade: 4.8});
            const view = new DataView(res);
            expect(view.getUint8(0, true)).toBe(0x46);
            expect(view.getUint16(1, true)).toBe(34340);
        });

        test('encode -1', () => {
            const view = new DataView(control.slopeTarget.encode({grade: -1}));
            expect(view.getUint16(1, true)).toBe(32440);
        });

        test('encode 0', () => {
            const view = new DataView(control.slopeTarget.encode({grade: 0}));
            expect(view.getUint16(1, true)).toBe(32768);
        });

        test('encode 1', () => {
            const view = new DataView(control.slopeTarget.encode({grade: 1}));
            expect(view.getUint16(1, true)).toBe(33095);
        });

        test('encode 10', () => {
            const view = new DataView(control.slopeTarget.encode({grade: 10}));
            expect(view.getUint16(1, true)).toBe(36044);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array(3)).buffer);
            view.setUint8( 0, 0x46, true);
            view.setUint16(1, 34340, true);

            const res = control.slopeTarget.decode(view);
            expect(res).toEqual({grade: 4.8});
        });

        test('decode -1', () => {
            const view = new DataView(control.slopeTarget.encode({grade: -1}));
            expect(control.slopeTarget.decode(view).grade).toBe(-1);
        });

        test('decode 0', () => {
            const view = new DataView(control.slopeTarget.encode({grade: 0}));
            expect(control.slopeTarget.decode(view).grade).toBe(0);
        });

        test('decode 1', () => {
            const view = new DataView(control.slopeTarget.encode({grade: 1}));
            expect(control.slopeTarget.decode(view).grade).toBe(1);
        });

        test('decode 10', () => {
            const view = new DataView(control.slopeTarget.encode({grade: 10}));
            expect(control.slopeTarget.decode(view).grade).toBe(10);
        });

        test('encode -> decode', () => {
            const value  = {grade: 4.8};
            const buffer = control.slopeTarget.encode(value);
            const res    = control.slopeTarget.decode(new DataView(buffer));

            expect(res).toEqual(value);
        });
    });

    describe('WheelCircumference', () => {
        test('opCode', () => {
            const res = control.wheelCircumference.opCode;
            expect(res).toEqual(0x48);
        });

        test('length', () => {
            const res = control.wheelCircumference.length;
            expect(res).toEqual(3);
        });

        test('encode', () => {
            const value = {
                circumference: 2180,
            };
            const res = control.wheelCircumference.encode(value);
            const view = new DataView(res);
            expect(view.getUint8( 0, true)).toBe(0x48);
            expect(view.getUint16(1, true)).toBe(21800);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array(7)).buffer);
            view.setUint8( 0, 0x48, true);
            view.setUint16(1, 21800, true);

            const res = control.wheelCircumference.decode(view);
            expect(res).toEqual({
                circumference: 2180,
            });
        });

        test('encode -> decode', () => {
            const value = {
                circumference: 2180,
            };
            const buffer = control.wheelCircumference.encode(value);
            const res    = control.wheelCircumference.decode(new DataView(buffer));

            expect(res).toEqual(value);
        });
    });

    describe('WindSpeed', () => {
        test('opCode', () => {
            const res = control.windSpeed.opCode;
            expect(res).toEqual(0x47);
        });

        test('length', () => {
            const res = control.windSpeed.length;
            expect(res).toEqual(3);
        });

        test('encode', () => {
            const value = {
                windSpeed: 4,
            };
            const res = control.windSpeed.encode(value);
            const view = new DataView(res);
            expect(view.getUint8( 0, true)).toBe(0x47);
            expect(view.getUint16(1, true)).toBe(36768);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array(7)).buffer);
            view.setUint8( 0, 0x47, true);
            view.setUint16(1, 36768, true);

            const res = control.windSpeed.decode(view);
            expect(res).toEqual({
                windSpeed: 4,
            });
        });

        test('encode -> decode', () => {
            const value = {
                windSpeed: 4,
            };
            const buffer = control.windSpeed.encode(value);
            const res    = control.windSpeed.decode(new DataView(buffer));

            expect(res).toEqual(value);
        });
    });

    describe('SIM', () => {
        test('opCode', () => {
            const res = control.sim.opCode;
            expect(res).toEqual(0x43);
        });

        test('length', () => {
            const res = control.sim.length;
            expect(res).toEqual(7);
        });

        test('encode', () => {
            const value = {
                weight: 74,
                crr: 0.004,
                windResistance: 0.48,
            };
            const res = control.sim.encode(value);
            const view = new DataView(res);
            expect(view.getUint8( 0, true)).toBe(0x43);
            expect(view.getUint16(1, true)).toBe(7400);
            expect(view.getUint16(3, true)).toBe(40);
            expect(view.getUint16(5, true)).toBe(480);
        });

        test('encode max', () => {
            const value = {
                weight: 655.35,
                crr: 6.5535,
                windResistance: 65.535,
            };
            const res = control.sim.encode(value);
            const view = new DataView(res);
            expect(view.getUint8( 0, true)).toBe(0x43);
            expect(view.getUint16(1, true)).toBe(65535);
            expect(view.getUint16(3, true)).toBe(65534);
            expect(view.getUint16(5, true)).toBe(65534);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array(7)).buffer);
            view.setUint8( 0, 0x43, true);
            view.setUint16(1, 7400, true);
            view.setUint16(3, 40,   true);
            view.setUint16(5, 480,  true);

            const res = control.sim.decode(view);
            expect(res).toEqual({
                weight: 74,
                crr: 0.004,
                windResistance: 0.48,
            });
        });

        test('encode -> decode', () => {
            const value = {
                weight: 74,
                crr: 0.004,
                windResistance: 0.48,
            };
            const buffer = control.sim.encode(value);
            const res    = control.sim.decode(new DataView(buffer));

            expect(res).toEqual(value);
        });
    });

    describe('Response', () => {

        test('decode setPowerTarget success', () => {
            const view = new DataView((new Uint8Array([1, 66, 1, 0, 50, 0])).buffer);

            const res = control.response.decode(view);
            expect(res).toEqual({
                status:  ':success',
                request: 'setPowerTarget',
                value:   50,
            });
        });

        test('decode setPowerTarget fail', () => {
            const view = new DataView((new Uint8Array([0, 66, 1, 0, 50, 0])).buffer);

            const res = control.response.decode(view);
            expect(res).toEqual({
                status:  ':fail',
                request: 'setPowerTarget',
                value:   50,
            });
        });

        test('decode success unlock', () => {
            const view = new DataView((new Uint8Array([1, 32, 2])).buffer);

            const res = control.response.decode(view);
            expect(res).toEqual({
                status:  ':success',
                request: 'unlock',
            });
        });
    });
});
