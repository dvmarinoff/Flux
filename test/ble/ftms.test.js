import { uuids } from '../../src/ble/uuids.js';
import { control } from '../../src/ble/ftms/control-point.js';

describe('Control Point', () => {

    describe('RequestControl', () => {
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

        test('opCode', () => {
            const res = control.requestControl.opCode;
            expect(res).toEqual(0x00);
        });

        test('length', () => {
            const res = control.requestControl.length;
            expect(res).toEqual(1);
        });
    });

    describe('PowerTarget', () => {
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

        test('opCode', () => {
            const res = control.powerTarget.opCode;
            expect(res).toEqual(0x05);
        });

        test('length', () => {
            const res = control.powerTarget.length;
            expect(res).toEqual(3);
        });
    });
});
