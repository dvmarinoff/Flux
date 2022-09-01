import { equals, dataviewToArray, nthBitToBool, xor } from '../../src/functions.js';
import { ids, events, channelTypes, values, keys } from '../../src/ant/constants.js';
import { hr, HRDataPage } from '../../src/ant/hr.js';

global.console = {
    log: jest.fn(),
    error: console.error,
    warn: console.warn,
};

describe('HRDataPage', () => {

    describe('encode', () => {
        test('default message', () => {
            const hrp = HRDataPage();
            const view = hrp.encode();
            expect(dataviewToArray(view)).toEqual([0, 0,0,0, 0,0, 0, 255]);
        });

        test('page change', () => {
            const hrp = HRDataPage();
            const view = hrp.encode({pageChange: 1});
            expect(dataviewToArray(view)).toEqual([128, 0,0,0, 0,0, 0, 255]);
        });

        test('heartRate', () => {
            const hrp = HRDataPage();
            const view = hrp.encode({heartRate: 80});
            expect(dataviewToArray(view)).toEqual([0, 0,0,0, 0,0, 0, 80]);
        });

        test('encode with specEncode', () => {
            function encode(args = {}) {
                args.view.setUint8(1, args.x, true);
                args.view.setUint8(2, args.y, true);
                args.view.setUint8(3, args.z, true);
                return args.view;
            }

            const hrp = HRDataPage({ encode, });
            const view = hrp.encode({x: 1, y: 2, z: 3});
            expect(dataviewToArray(view)).toEqual([0, 1,2,3, 0,0, 0, 255]);
        });
    });

    describe('decode', () => {
        test('default message', () => {
            const hrp = HRDataPage();
            const view = hrp.encode();
            const res = hrp.decode(view);
            expect(res).toEqual({
                dataPage: 0,
                pageChange: 0,
                heartBeatEventTime: 0,
                heartBeatCount: 0,
                heartRate: 255,
            });
        });

        test('pageChange', () => {
            const hrp = HRDataPage();
            const view = hrp.encode({pageChange: 1});
            const res = hrp.decode(view);
            expect(res).toEqual({
                dataPage: 0,
                pageChange: 1,
                heartBeatEventTime: 0,
                heartBeatCount: 0,
                heartRate: 255,
            });
        });

        test('heartRate', () => {
            const hrp = HRDataPage();
            const view = hrp.encode({heartRate: 80});
            const res = hrp.decode(view);
            expect(res).toEqual({
                dataPage: 0,
                pageChange: 0,
                heartBeatEventTime: 0,
                heartBeatCount: 0,
                heartRate: 80,
            });
        });

        test('decode with specDecode', () => {
            function encode(args = {}) {
                args.view.setUint8(1, args.x, true);
                args.view.setUint8(2, args.y, true);
                args.view.setUint8(3, args.z, true);
                return args.view;
            }

            function decode(args) {
                const x = args.dataview.getUint8(1, true);
                const y = args.dataview.getUint8(2, true);
                const z = args.dataview.getUint8(3, true);
                return { x, y, z, };
            }

            const hrp = HRDataPage({ encode, decode, });
            const view = hrp.encode({x: 1, y: 2, z: 3});
            const res = hrp.decode(view);
            expect(res).toEqual({
                dataPage: 0,
                pageChange: 0,
                x: 1,
                y: 2,
                z: 3,
                heartBeatEventTime: 0,
                heartBeatCount: 0,
                heartRate: 255,
            });
        });
    });

});

describe('DataPage0', () => {

    describe('encode', () => {
        test('default message', () => {
            const view = hr.dataPage0.encode();
            expect(dataviewToArray(view)).toEqual([0, 255,255,255, 0,0, 0, 255]);
        });
    });

    describe('decode', () => {
        test('default message', () => {
            const view = hr.dataPage0.encode();
            const res = hr.dataPage0.decode(view);
            expect(res).toEqual({
                dataPage: 0,
                pageChange: 0,
                heartBeatEventTime: 0,
                heartBeatCount: 0,
                heartRate: 255,
            });
        });
    });
});

describe('DataPage1', () => {

    describe('encode', () => {
        test('default message', () => {
            const view = hr.dataPage1.encode();
            expect(dataviewToArray(view)).toEqual([1, 0,0,0, 0,0, 0, 255]);
        });

        test('cumulativeOperatingTime', () => {
            const view = hr.dataPage1.encode({cumulativeOperatingTime: 60});
            expect(dataviewToArray(view)).toEqual([1, 30,0,0, 0,0, 0, 255]);
        });
    });

    describe('decode', () => {
        test('default message', () => {
            const view = hr.dataPage1.encode();
            const res = hr.dataPage1.decode(view);
            expect(res).toEqual({
                dataPage: 1,
                pageChange: 0,
                cumulativeOperatingTime: 0,
                heartBeatEventTime: 0,
                heartBeatCount: 0,
                heartRate: 255,
            });
        });

        test('cumulativeOperatingTime', () => {
            const view = hr.dataPage1.encode({cumulativeOperatingTime: 60});
            const res  = hr.dataPage1.decode(view);
            expect(res).toEqual({
                dataPage: 1,
                pageChange: 0,
                cumulativeOperatingTime: 60,
                heartBeatEventTime: 0,
                heartBeatCount: 0,
                heartRate: 255,
            });
        });
    });
});

describe('DataPage2', () => {

    describe('encode', () => {
        test('default message', () => {
            const view = hr.dataPage2.encode({serialNumber: 0});
            expect(dataviewToArray(view)).toEqual([2, 255,0,0, 0,0, 0, 255]);
        });

        test('manufacturerId', () => {
            const view = hr.dataPage2.encode({manufacturerId: 10, serialNumber: 0});
            expect(dataviewToArray(view)).toEqual([2, 10,0,0, 0,0, 0, 255]);
        });

        test('serialNumber', () => {
            const view = hr.dataPage2.encode({serialNumber: 12348});
            expect(dataviewToArray(view)).toEqual([2, 255,60,48, 0,0, 0, 255]);
        });
    });

    describe('decode', () => {
        test('default message', () => {
            const view = hr.dataPage2.encode({serialNumber: 0});
            const res = hr.dataPage2.decode(view);
            expect(res).toEqual({
                dataPage: 2,
                pageChange: 0,
                manufacturerId: 255,
                serialNumber: 0,
                heartBeatEventTime: 0,
                heartBeatCount: 0,
                heartRate: 255,
            });
        });

        test('manufacturerId', () => {
            const view = hr.dataPage2.encode({manufacturerId: 10, serialNumber: 0});
            const res  = hr.dataPage2.decode(view);
            expect(res).toEqual({
                dataPage: 2,
                pageChange: 0,
                manufacturerId: 10,
                serialNumber: 0,
                heartBeatEventTime: 0,
                heartBeatCount: 0,
                heartRate: 255,
            });
        });

        test('serialNumber', () => {
            const view = hr.dataPage2.encode({serialNumber: 12348});
            const res  = hr.dataPage2.decode(view);
            expect(res).toEqual({
                dataPage: 2,
                pageChange: 0,
                manufacturerId: 255,
                serialNumber: 12348,
                heartBeatEventTime: 0,
                heartBeatCount: 0,
                heartRate: 255,
            });
        });
    });
});

// describe('', () => {

//     describe('encode', () => {
//         test('default message', () => {
//             let msg = message..encode();
//             expect(dataviewToArray(msg)).toEqual([164,]);
//         });
//     });

// });

