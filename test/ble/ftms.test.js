import { uuids } from '../../src/ble/uuids.js';
import { control } from '../../src/ble/ftms/control-point.js';

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

        test('encode', () => {
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

        test('encode', () => {
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

        test('encode', () => {
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

        test('encode', () => {
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

        test('encode', () => {
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
            // []

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

        test('encode', () => {
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
            // []

            const res = control.wheelCircumference.decode(view);
            expect(res).toEqual({
                circumference: 2180,
            });
        });
    });
});
