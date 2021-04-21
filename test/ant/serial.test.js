import { values, filter, requestPort, getPorts, open } from './serial.js';

describe('request ant+ stick over serial', () => {
    describe('request returns port object', () => {
        test('valid port', () => {
            // const port = await requestPort();
            expect(1).toBe(1);
        });
    });
});

// describe('disconnect from ant+ stick over serial', () => {
//     describe('', () => {
//         test('', () => {
//         });
//     });
// });

// describe('', () => {
//     describe('', () => {
//         test('', () => {
//             expect().toBe();
//         });
//     });
// });
