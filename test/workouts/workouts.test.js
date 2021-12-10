/**
 * @jest-environment jsdom
 */

import { fileHandler } from '../src/file.js';
import { uuid } from '../src/storage/uuid.js';
import { zwo } from '../src/workouts/zwo.js';

import { idb } from '../src/storage/idb.js';
import indexedDB from 'fake-indexeddb';

window.indexedDB = indexedDB;

describe('Workouts', () => {

    global.console = {
        log: jest.fn(),
        error: console.error,
        warn: console.warn,
    };

    test('base', async () => {
        expect(1).toBe(1);
    });
});
