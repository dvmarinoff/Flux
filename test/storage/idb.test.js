/**
 * @jest-environment jsdom
 */

import { idb } from '../../src/storage/idb.js';
import indexedDB from 'fake-indexeddb';

window.indexedDB = indexedDB;

describe('IDB', () => {

    global.console = {
        log: jest.fn(),
        error: console.error,
        warn: console.warn,
    };

    const values = [
        {id: '{1ec38b5c-9a08-48e0-c000-09de191988b5}', one: 1},
        {id: '{1ec38b5c-9a08-48e0-c000-09de191988b4}', two: 2}
    ];

    const valuesUpdated = [
        {id: '{1ec38b5c-9a08-48e0-c000-09de191988b5}', zero: 0},
        {id: '{1ec38b5c-9a08-48e0-c000-09de191988b4}', two: 2}
    ];

    test('open', async () => {
        let resOpen = await idb.open('store', 1, 'numbers');

        expect(resOpen.constructor.name).toBe('FDBDatabase'); // 'IDBDatabase'
        expect(resOpen.name).toBe('store');
        expect(resOpen.objectStoreNames).toStrictEqual(['numbers']);
    });

    test('add', async () => {
        let resAdd0 = await idb.add('numbers', idb.setId(values[0]));
        let resAdd1 = await idb.add('numbers', idb.setId(values[1]));

        expect(resAdd0).toBe('{1ec38b5c-9a08-48e0-c000-09de191988b5}');
        expect(resAdd1).toBe( '{1ec38b5c-9a08-48e0-c000-09de191988b4}');
    });

    test('get', async () => {
        let resGet = await idb.get('numbers', '{1ec38b5c-9a08-48e0-c000-09de191988b5}');

        expect(resGet).toStrictEqual(values[0]);
    });

    test('getAll', async () => {
        const value = {
            id: '{1ec38b5c-9a08-48e0-c000-09de191988b5}',
            one: 1
        };
        let resGetAll = await idb.getAll('numbers');

        expect(resGetAll.reverse()).toEqual(values);
    });

    test('put', async () => {
        let resPut0 = await idb.put('numbers', idb.setId(valuesUpdated[0]));

        expect(resPut0).toBe('{1ec38b5c-9a08-48e0-c000-09de191988b5}');

        let resGetAll = await idb.getAll('numbers');

        expect(resGetAll.reverse()).toEqual(valuesUpdated);
    });

    test('remove', async () => {
        let resRemove = await idb.remove('numbers', valuesUpdated[0].id);

        expect(resRemove).toBe(undefined);

        let resGetAll = await idb.getAll('numbers');

        expect(resGetAll.reverse()).toEqual([valuesUpdated[1]]);
    });

    test('clear', async () => {
        let resClear = await idb.clear('numbers');

        expect(resClear).toBe(undefined);

        let resGetAll = await idb.getAll('numbers');

        expect(resGetAll).toEqual([]);
    });
});



// describe('', () => {
//     test('', () => {
//         expect().toBe();
//     });
// });
