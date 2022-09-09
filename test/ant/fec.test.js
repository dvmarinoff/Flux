import { equals, dataviewToArray, nthBitToBool, xor } from '../../src/functions.js';
import { ids, events, channelTypes, values, keys } from '../../src/ant/constants.js';
import { message, Message } from '../../src/ant/message.js';
import { DataPage } from '../../src/ant/common.js';
import { fec } from '../../src/ant/fec.js';

global.console = {
    log: jest.fn(),
    error: console.error,
    warn: console.warn,
};

describe('Data Page 48 - Basic Resistance', () => {

    describe('encode', () => {
        test('default', () => {
            const msg = fec.dataPage48.encode();
            expect(dataviewToArray(msg)).toEqual([48, 0,0,0,0,0,0, 0]);
        });

        test('in range', () => {
            const msg = fec.dataPage48.encode({resistance: 10});
            expect(dataviewToArray(msg)).toEqual([48, 0,0,0,0,0,0, 20]);
        });

        test('under min', () => {
            const msg = fec.dataPage48.encode({resistance: -10});
            expect(dataviewToArray(msg)).toEqual([48, 0,0,0,0,0,0, 0]);
        });

        test('over max', () => {
            const msg = fec.dataPage48.encode({resistance: 110});
            expect(dataviewToArray(msg)).toEqual([48, 0,0,0,0,0,0, 200]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage48.encode({resistance: 10});
            const res = fec.dataPage48.decode(view);
            expect(res).toEqual({dataPage: 48, resistance: 10});
        });
    });
});

describe('Data Page 49 - Target Power', () => {

    describe('encode', () => {
        test('default', () => {
            const msg = fec.dataPage49.encode();
            expect(dataviewToArray(msg)).toEqual([49, 0,0,0,0,0, 0,0]);
        });

        test('in range', () => {
            const msg = fec.dataPage49.encode({power: 200});
            expect(dataviewToArray(msg)).toEqual([49, 0,0,0,0,0, 32,3]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage49.encode({power: 200});
            const res = fec.dataPage49.decode(view);
            expect(res).toEqual({dataPage: 49, power: 200});
        });
    });
});

describe('Data Page 50 - Wind Resistance', () => {

    describe('encode', () => {
        test('invalid', () => {
            const msg = fec.dataPage50.encode({
                windResistance: fec.dataPage50.definitions.windResistance.invalid,
                windSpeed:      fec.dataPage50.definitions.windSpeed.invalid,
                draftingFactor: fec.dataPage50.definitions.draftingFactor.invalid
            });
            expect(dataviewToArray(msg)).toEqual([50, 0,0,0,0, 255, 255, 255]);
        });
        test('default', () => {
            const msg = fec.dataPage50.encode();
            expect(dataviewToArray(msg)).toEqual([50, 0,0,0,0, 51, 127, 100]);
        });

        test('windResistance', () => {
            const msg = fec.dataPage50.encode({windResistance: 0.48});
            expect(dataviewToArray(msg)).toEqual([50, 0,0,0,0, 48, 127, 100]);
        });

        test('crr', () => {
            const msg = fec.dataPage50.encode({windSpeed: 20});
            expect(dataviewToArray(msg)).toEqual([50, 0,0,0,0, 51, 147, 100]);
        });

        test('draftingFactor', () => {
            const msg = fec.dataPage50.encode({draftingFactor: 0.4});
            expect(dataviewToArray(msg)).toEqual([50, 0,0,0,0, 51, 127, 40]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage50.encode();
            const res = fec.dataPage50.decode(view);
            expect(res).toEqual({
                dataPage: 50,
                windResistance: 0.51,
                windSpeed: 0,
                draftingFactor: 1
            });
        });
    });
});

describe('Data Page 51 - Track Resistance', () => {

    describe('encode', () => {
        test('invalid', () => {
            const msg = fec.dataPage51.encode({
                grade: fec.dataPage51.definitions.grade.invalid,
                crr:   fec.dataPage51.definitions.crr.invalid,
            });
            expect(dataviewToArray(msg)).toEqual([51, 0,0,0,0, 255,255, 255]);
        });
        test('default', () => {
            const msg = fec.dataPage51.encode();
            expect(dataviewToArray(msg)).toEqual([51, 0,0,0,0, 32,78, 80]);
        });

        test('grade 4.8', () => {
            const msg = fec.dataPage51.encode({grade: 4.8});
            expect(dataviewToArray(msg)).toEqual([51, 0,0,0,0, 0,80, 80]);
        });

        test('grade 4', () => {
            const msg = fec.dataPage51.encode({grade: 4});
            expect(dataviewToArray(msg)).toEqual([51, 0,0,0,0, 176,79, 80]);
        });

        test('grade 200', () => {
            const msg = fec.dataPage51.encode({grade: 200});
            expect(dataviewToArray(msg)).toEqual([51, 0,0,0,0, 64,156, 80]);
        });

        test('grade -200', () => {
            const msg = fec.dataPage51.encode({grade: -200});
            expect(dataviewToArray(msg)).toEqual([51, 0,0,0,0, 0,0, 80]);
        });

        test('crr', () => {
            const msg = fec.dataPage51.encode({crr: 0.00321});
            expect(dataviewToArray(msg)).toEqual([51, 0,0,0,0, 32,78, 64]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage51.encode();
            const res = fec.dataPage51.decode(view);
            expect(res).toEqual({
                dataPage: 51,
                grade: 0,
                crr: 0.004,
            });
        });
    });
});

describe('Data Page 55 - User Configuration', () => {

    describe('encode', () => {
        test('invalid', () => {
            const msg = fec.dataPage55.encode({
                userWeight:     fec.dataPage55.definitions.userWeight.invalid,
                diameterOffset: fec.dataPage55.definitions.diameterOffset.invalid,
                bikeWeight:     fec.dataPage55.definitions.bikeWeight.invalid,
                wheelDiameter:  fec.dataPage55.definitions.wheelDiameter.invalid,
                gearRatio:      fec.dataPage55.definitions.gearRatio.invalid,
            });
            expect(dataviewToArray(msg)).toEqual([55, 255,255, 0, 255,255, 255, 0]);
        });
        test('default', () => {
            const msg = fec.dataPage55.encode();
            expect(dataviewToArray(msg)).toEqual([55, 76,29, 0, 143,12, 70, 0]);
        });

        test('userWeight', () => {
            const msg = fec.dataPage55.encode({userWeight: 80});
            expect(dataviewToArray(msg)).toEqual([55, 64,31, 0, 143,12, 70, 0]);
        });

        test('bikeWeight', () => {
            const msg = fec.dataPage55.encode({bikeWeight: 7});
            expect(dataviewToArray(msg)).toEqual([55, 76,29, 0, 207,8, 70, 0]);
        });

        test('wheelDiameter', () => {
            const msg = fec.dataPage55.encode({wheelDiameter: 0.6});
            expect(dataviewToArray(msg)).toEqual([55, 76,29, 0, 143,12, 60, 0]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage55.encode();
            const res = fec.dataPage55.decode(view);
            expect(res).toEqual({
                dataPage: 55,
                userWeight: 75,
                diameterOffset: 15,
                bikeWeight: 10,
                wheelDiameter: 0.7,
                gearRatio: undefined,
            });
        });
    });
});

describe('Data Page 16 - General FE Data', () => {

    describe('encode', () => {
        test('default', () => {
            const msg = fec.dataPage16.encode();
            expect(dataviewToArray(msg)).toEqual([16, 25, 0, 0, 0,0, 255, 32]);
        });

        test('invalid', () => {
            const msg = fec.dataPage16.encode();
            expect(dataviewToArray(msg)).toEqual([16, 25, 0, 0, 0,0, 255, 32]);
        });

        test('speed', () => {
            const config = {
                speed: 30, // km/h
            };
            const view = fec.dataPage16.encode(config);
            expect(dataviewToArray(view)).toEqual([16, 25, 0, 0, 141,32, 255, 32]);
        });

    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage16.encode();
            const res = fec.dataPage16.decode(view);
            expect(res).toEqual({
                dataPage: 16,
                equipmentType: 'Unset',
                elapsedTime: 0,
                speed: 0,
                heartRate: undefined,
                capabilities: {
                    hrDataSource: 'Unknown',
                    distance: false,
                    virtualSpeed: false,
                },
                feState: {
                    feState: 'READY',
                    lapToggle: 0,
                },
            });
        });

        test('speed', () => {
            const config = {
                equipmentType: 'Unset',
                elapsedTime: 0,
                speed: 30.00, // km/h
                heartRate: 255,
                capabilities: {
                    hrDataSource: 'Unknown',
                    distance: false,
                    virtualSpeed: false,
                },
                feState: {
                    feState: 'READY',
                    lapToggle: 0,
                },
            };
            const view = fec.dataPage16.encode(config);
            const res = fec.dataPage16.decode(view);
            expect(res).toEqual(Object.assign(config, {dataPage: 16, heartRate: undefined,}));
        });
    });
});

describe('Data Page 25 - Trainer Data', () => {

    describe('encode', () => {
        test('default', () => {
            const msg = fec.dataPage25.encode();
            expect(dataviewToArray(msg)).toEqual([25, 0, 0, 0,0, 0,0, 0]);
        });
    });

    describe('decode', () => {
        test('default', () => {
            const view = fec.dataPage25.encode();
            const res  = fec.dataPage25.decode(view);
            expect(res).toEqual({
                dataPage: 25,
                eventCount: 0,
                cadence: 0,
                accumulatedPower: 0,
                power: 0,
                status: {
                    power: 0, resistance: 0, user: 0
                },
                flags: {
                    limits: 'ok',
                },
                feState: {
                    feState: 'READY',
                    lapToggle: 0,
                },
            });
        });

        test('default', () => {
            const config = {
                eventCount: 3,
                cadence: 80,
                accumulatedPower: 100*3,
                power: 100,
                status: {
                    power: 0, resistance: 0, user: 1
                },
                flags: { limits: 'high' },
                feState: {
                    feState: 'READY',
                    lapToggle: 0,
                },
            };

            const view = fec.dataPage25.encode(config);
            const res  = fec.dataPage25.decode(view);
            expect(res).toEqual(Object.assign(config, {dataPage: 25,}));
        });
    });
});

// describe('', () => {

//     describe('encode', () => {
//         test('default message', () => {
//             let msg = message..encode();
//             expect(dataviewToArray(msg)).toEqual([164,]);
//         });
//     });

// });

