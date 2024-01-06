// import { describe, expect, test } from 'vitest';

import { dataviewToArray } from '../../src/functions.js';
import { fit } from '../../src/fit/fit.js';
import { appData, FITjs, fitBinary, flatFitBinary, } from './data.js';

describe('AppData', () => {

    test('toFITjs', () => {
        const res = fit.localActivity.toFITjs({
            records: appData.records,
            laps: appData.laps,
        });

        expect(res).toEqual(FITjs({crc: false}));
    });

    test('encode', () => {
        // res: Dataview
        const res = fit.localActivity.encode({
            records: appData.records,
            laps: appData.laps,
        });
        // resArray: [Int]
        const resArray = dataviewToArray(res);

        expect(resArray).toEqual(flatFitBinary);

        // check CRC
        var headerCRC     = fit.CRC.calculateCRC(
            new DataView(new Uint8Array(fitBinary[0]).buffer), 0, 11);
        var fileCRC       = fit.CRC.calculateCRC(
            new DataView(new Uint8Array(flatFitBinary).buffer),
            0,
            (flatFitBinary.length - 1) - fit.CRC.size,
        );
        var headerCRCArray = fit.CRC.toArray(headerCRC);
        var fileCRCArray   = fit.CRC.toArray(fileCRC);

        console.log(`header crc: ${headerCRC} `, headerCRCArray);
        console.log(`file crc: ${fileCRC} `, fileCRCArray);

        var resHeaderCRCArray = fit.CRC.getHeaderCRC(res).array;

        var resFileCRCArray = fit.CRC.getFileCRC(res).array;

        expect(resHeaderCRCArray).toEqual(headerCRCArray);

        expect(resFileCRCArray).toEqual(fileCRCArray);
        // check CRC
    });

    test('decode', () => {
        const array = new Uint8Array(fitBinary.flat());
        const view = new DataView(array.buffer);

        const res = fit.FITjs.decode(view);

        expect(res).toEqual(FITjs({crc: true}));
    });
});

