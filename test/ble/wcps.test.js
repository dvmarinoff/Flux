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
            expect(view.getInt16(1, true)).toBe(200);
        });

        test('decode', () => {
            const view = new DataView((new Uint8Array(3)).buffer);
            view.setUint8( 0, 0x42, true);
            view.setUint16(1, 200, true);

            const res = control.powerTarget.decode(view);
            expect(res).toEqual({power: 200});
        });
    });
});
