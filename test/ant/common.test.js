import { equals, dataviewToArray, nthBitToBool, xor } from '../../src/functions.js';
import { ids, events, channelTypes, values, keys } from '../../src/ant/constants.js';
import { DataPage, common } from '../../src/ant/common.js';

global.console = {
    log: jest.fn(),
    error: console.error,
    warn: console.warn,
};

describe('DataPage', () => {
    const definitions = {
        value1: {
            resolution: 1, offset: 0, unit: '', min: 0, max: 10, invalid: 255, default: 0
        },
        value2: {
            resolution: 0.1, offset: 0, unit: '', min: 0, max: 10, invalid: 255, default: 1
        },
        // input value is between 1 and 20
        // ouput value is between 100 and 200
        value3: {
            resolution: 0.1, offset: 10, unit: '', min: 0, max: 20, invalid: 255, default: 1
        },
    };

    const dataPage = DataPage({definitions});

    describe('length', () => {
        test('length', () => {
            expect(dataPage.length).toEqual(8);
        });
    });

    describe('applyResolution', () => {
        test('basic', () => {
            expect(dataPage.applyResolution('value1', 1)).toEqual(1);
        });

        test('with resolution', () => {
            expect(dataPage.applyResolution('value2', 1)).toEqual(10);
        });
    });

    describe('removeResolution', () => {
        test('basic', () => {
            expect(dataPage.removeResolution('value1', 1)).toEqual(1);
        });

        test('with resolution', () => {
            expect(dataPage.removeResolution('value2', 100)).toEqual(10);
        });
    });

    describe('applyOffset', () => {
        test('with offset', () => {
            expect(dataPage.applyOffset('value3', 1)).toEqual(110);
        });
    });

    describe('removeOffset', () => {
        test('with offset', () => {
            expect(dataPage.removeOffset('value3', 110)).toEqual(1);
        });
    });

    describe('encodeField', () => {
        test('basic', () => {
            expect(dataPage.encodeField('value1', 1)).toEqual(1);
        });

        test('input under min', () => {
            expect(dataPage.encodeField('value1', -1)).toEqual(0);
        });

        test('input over max', () => {
            expect(dataPage.encodeField('value1', 11)).toEqual(10);
        });

        test('with offset', () => {
            expect(dataPage.encodeField('value3', 1, dataPage.applyOffset)).toEqual(110);
        });
    });

    describe('decodeField', () => {
        test('basic', () => {
            expect(dataPage.decodeField('value1', 1)).toEqual(1);
        });

        test('with offset', () => {
            expect(dataPage.decodeField('value3', 110, dataPage.removeOffset)).toEqual(1);
        });
    });

});

describe('Data Page 70 - Request Data Page', () => {

    describe('encode', () => {
        test('default', () => {
            const msg = common.commonPage70.encode();
            expect(dataviewToArray(msg)).toEqual([70, 255,0, 255,255, 1, 71, 1]);
        });

    });

    describe('decode', () => {
        test('default', () => {
            const view = common.commonPage70.encode();
            const res = common.commonPage70.decode(view);
            expect(res).toEqual({
                dataPage: 70,
                slaveSerialNumber: 0xFF,
                descriptor: 0xFFFF,
                requestedTransmission: 1,
                requestedPageNumber: 71,
                commandType: 1,
            });
        });
    });
});

describe('Data Page 71 - Command Status', () => {

    describe('encode', () => {
        test('default', () => {
            const msg = common.commonPage71.encode({lastCommandId: 49});
            expect(dataviewToArray(msg)).toEqual([71, 49, 0, 255, 0,0,0,0]);
        });

    });

    describe('decode', () => {
        test('default', () => {
            const view = common.commonPage71.encode({lastCommandId: 49});
            const res = common.commonPage71.decode(view);
            expect(res).toEqual({
                dataPage: 71,
                lastCommandId: 49,
                sequenceNumber: 0,
                status: 255,
                data: 0
                // data0: 0,
                // data1: 0,
                // data2: 0,
                // data3: 0,
            });
        });
    });
});
