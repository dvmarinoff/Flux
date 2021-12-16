/**
 * @jest-environment jsdom
 */

import { JSDOM } from 'jsdom';

import { first, last, xf } from '../../src/functions.js';
import { page } from './page.js';
import { watch } from '../../src/views/watch.js';

describe('Watch View', () => {

    global.console = {
        log: jest.fn(),
        error: console.error,
        warn: console.warn,
    };

    const dom = new JSDOM();
    window.document.body.innerHTML = page;

    test('placeholder', () => {
        expect(1).toBe(1);
    });

});
