/**
 * @jest-environment jsdom
 */

import { xf } from '../../src/functions.js';
import { models } from '../../src/models/models.js';

// Date.now = jest.fn(() => endTime);

describe('power1s', () => {
    const db = {
        power: 0,
        power1s: 0,
    };

    xf.create(db);

    xf.reg('power', (x, db) => db.power = x);
    xf.reg('power1s', (power, db) => db.power1s = power);

    const power1s = new models.PropInterval({
        prop: 'db:power',
        effect: 'power1s',
        interval: 1000,
    });

    jest.useFakeTimers();

    test('test 180', () => {
        // first tick
        xf.dispatch('power', 180);
        jest.advanceTimersByTime(250);
        expect(models.power1s.state).toBe(0);
        expect(models.power1s.accumulator).toBe(180);
        expect(models.power1s.count).toBe(1);

        xf.dispatch('power', 180);
        jest.advanceTimersByTime(250);
        expect(models.power1s.state).toBe(0);
        expect(models.power1s.accumulator).toBe(2*180);
        expect(models.power1s.count).toBe(2*1);

        xf.dispatch('power', 180);
        jest.advanceTimersByTime(250);
        expect(models.power1s.state).toBe(0);
        expect(models.power1s.accumulator).toBe(3*180);
        expect(models.power1s.count).toBe(3*1);

        xf.dispatch('power', 180);
        jest.advanceTimersByTime(250);
        models.power1s.onInterval();
        expect(models.power1s.state).toBe(180);
        expect(models.power1s.accumulator).toBe(0);
        expect(models.power1s.count).toBe(0);
        expect(db.power1s).toBe(180);

        // second tick
        xf.dispatch('power', 100);
        jest.advanceTimersByTime(500);
        expect(models.power1s.state).toBe(180);
        expect(models.power1s.accumulator).toBe(100);
        expect(models.power1s.count).toBe(1);
        expect(db.power1s).toBe(180);

        xf.dispatch('power', 100);
        jest.advanceTimersByTime(500);
        models.power1s.onInterval();
        expect(models.power1s.state).toBe(100);
        expect(models.power1s.accumulator).toBe(0);
        expect(models.power1s.count).toBe(0);
        expect(db.power1s).toBe(100);
    });

    test('stop', () => {
        // third tick
        xf.dispatch('power', 0);
        jest.advanceTimersByTime(500);
        expect(models.power1s.state).toBe(100);
        expect(models.power1s.accumulator).toBe(0);
        expect(models.power1s.count).toBe(1);

        xf.dispatch('power', 0);
        jest.advanceTimersByTime(500);
        expect(models.power1s.accumulator).toBe(0);
        expect(models.power1s.count).toBe(2);
        models.power1s.onInterval();
        expect(models.power1s.state).toBe(0);
        expect(models.power1s.accumulator).toBe(0);
        expect(models.power1s.count).toBe(0);
        expect(db.power1s).toBe(0);
    });

    test('start again', () => {
        // third tick
        xf.dispatch('power', 180);
        jest.advanceTimersByTime(500);
        expect(models.power1s.state).toBe(0);
        expect(models.power1s.accumulator).toBe(180);
        expect(models.power1s.count).toBe(1);

        xf.dispatch('power', 180);
        jest.advanceTimersByTime(500);
        expect(models.power1s.accumulator).toBe(2*180);
        expect(models.power1s.count).toBe(2);
        models.power1s.onInterval();
        expect(models.power1s.state).toBe(180);
        expect(models.power1s.accumulator).toBe(0);
        expect(models.power1s.count).toBe(0);
        expect(db.power1s).toBe(180);
    });

    test('stop mid interval', () => {
        // fourth tick
        xf.dispatch('power', 180);
        jest.advanceTimersByTime(250);
        expect(models.power1s.state).toBe(180);
        expect(models.power1s.accumulator).toBe(180);
        expect(models.power1s.count).toBe(1);

        xf.dispatch('power', 180);
        jest.advanceTimersByTime(250);
        expect(models.power1s.state).toBe(180);
        expect(models.power1s.accumulator).toBe(2*180);
        expect(models.power1s.count).toBe(2);

        xf.dispatch('power', 0);
        jest.advanceTimersByTime(250);
        expect(models.power1s.state).toBe(180);
        expect(models.power1s.accumulator).toBe(2*180);
        expect(models.power1s.count).toBe(3);

        xf.dispatch('power', 0);
        jest.advanceTimersByTime(250);
        expect(models.power1s.state).toBe(180);
        expect(models.power1s.accumulator).toBe(2*180);
        expect(models.power1s.count).toBe(4);
        models.power1s.onInterval();
        expect(models.power1s.state).toBe(90);
        expect(models.power1s.accumulator).toBe(0);
        expect(models.power1s.count).toBe(0);
        expect(db.power1s).toBe(90);

        // fifth tick
        xf.dispatch('power', 0);
        jest.advanceTimersByTime(500);
        expect(models.power1s.state).toBe(90);
        expect(models.power1s.accumulator).toBe(0);
        expect(models.power1s.count).toBe(1);

        xf.dispatch('power', 0);
        jest.advanceTimersByTime(500);
        expect(models.power1s.state).toBe(90);
        expect(models.power1s.accumulator).toBe(0);
        expect(models.power1s.count).toBe(2);
        models.power1s.onInterval();
        expect(models.power1s.state).toBe(0);
        expect(models.power1s.accumulator).toBe(0);
        expect(models.power1s.count).toBe(0);
        expect(db.power1s).toBe(0);
    });
});

