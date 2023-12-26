import { data } from './data.js';
import { FITjs } from '../../src/fit/fitjs.js';
import { dataviewToArray } from '../../src/functions.js';

describe('minimal', () => {
    const array = data.minimal;
    const typedArray = new Uint8Array(array);
    const dataview = new DataView(typedArray.buffer);
    const minimalFITjs = data.minimalFITjs;

    test('decode', () => {
        expect(FITjs.decode(dataview)).toEqual(minimalFITjs);
        // getUint16(new Uint8Array([123, 197]))
    });

    test('encode', () => {
        expect(dataviewToArray(FITjs.encode(minimalFITjs))).toEqual(array);
    });
});
