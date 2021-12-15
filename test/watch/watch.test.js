/**
 * @jest-environment jsdom
 */

import { first, last, xf } from '../../src/functions.js';

describe('Watch', () => {

    global.console = {
        log: jest.fn(),
        error: console.error,
        warn: console.warn,
    };

    test('placeholder', () => {
        expect(1).toBe(1);
    });
});
