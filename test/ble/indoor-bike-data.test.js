import { indoorBikeData } from '../../src/ble/ftms/indoor-bike-data.js';


// global.console = {
//     log: jest.fn(),
//     error: console.error,
//     warn: console.warn,
// };

describe('Indoor Bike Data', () => {

    test('speed-cadence-power', () => {
        const view = new DataView((new Uint8Array([68, 0, 24, 1, 20, 0, 6, 0])).buffer);

        const res = indoorBikeData.decode(view);
        expect(res).toEqual({
            speed: 280 * 0.01,
            cadence: 10,
            power: 6,
        });
    });

    test('speed-cadence-power-heartRate', () => {
        const view = new DataView((new Uint8Array([68, 2, 170, 5, 46, 0, 24, 0, 70])).buffer);

        const res = indoorBikeData.decode(view);
        expect(res).toEqual({
            speed: 1450 * 0.01,
            cadence: 23,
            power: 24,
            heartRate: 70,
        });
    });

    test('speed-cadence-distance-power-heartRate', () => {
        const view = new DataView(
            new Uint8Array([
                84, 2,       // flags, 0b1001010100
                202, 12,     // instantaneous speed
                160, 0,      // instantaneous cadence
                211, 164, 0, // total distance
                44, 1,       // power
                143,         // heart rate
            ]).buffer
        );

        const expected = {
            speed:   32.74,
            cadence: 80,
            distance: 42195,
            power:   300,
            heartRate: 143,
        };

        const res = indoorBikeData.decode(view);

        expect(res).toEqual(expected);
    });
});
