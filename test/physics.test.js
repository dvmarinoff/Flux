import { Model } from '../src/physics.js';

// rider: 75, bike: 10, A: 0.4, Cd: 1.0, dtLoss: 2, crr: 0.004, rho: 1.275,
const dataGribble = [
    [
        {power: 100, slope: 0, speed: 24.02},
        {power: 120, slope: 0, speed: 25.79},
        {power: 140, slope: 0, speed: 27.35},
        {power: 160, slope: 0, speed: 28.75},
        {power: 180, slope: 0, speed: 30.07},
        {power: 200, slope: 0, speed: 31.27},
        {power: 220, slope: 0, speed: 32.38},
        {power: 240, slope: 0, speed: 33.43},
        {power: 260, slope: 0, speed: 34.42},
        {power: 280, slope: 0, speed: 35.36},
        {power: 300, slope: 0, speed: 36.25},
        {power: 320, slope: 0, speed: 37.11},
    ],[], [
        {power: 100, slope: 2, speed: 14.59},
        {power: 120, slope: 2, speed: 16.64},
        {power: 140, slope: 2, speed: 18.48},
        {power: 160, slope: 2, speed: 20.16},
        {power: 180, slope: 2, speed: 21.70},
        {power: 200, slope: 2, speed: 23.12},
        {power: 220, slope: 2, speed: 24.44},
        {power: 240, slope: 2, speed: 25.68},
        {power: 260, slope: 2, speed: 26.84},
        {power: 280, slope: 2, speed: 27.94},
        {power: 300, slope: 2, speed: 28.98},
        {power: 320, slope: 2, speed: 29.97},
    ], [], [
        {power: 100, slope: 4, speed: 9.21},
        {power: 120, slope: 4, speed: 10.86},
        {power: 140, slope: 4, speed: 12.44},
        {power: 160, slope: 4, speed: 13.95},
        {power: 180, slope: 4, speed: 15.38},
        {power: 200, slope: 4, speed: 16.74},
        {power: 220, slope: 4, speed: 18.03},
        {power: 240, slope: 4, speed: 19.27},
        {power: 260, slope: 4, speed: 20.44},
        {power: 280, slope: 4, speed: 21.57},
        {power: 300, slope: 4, speed: 22.65},
        {power: 320, slope: 4, speed: 23.68},
    ],[], [], [], [
        {power: 100, slope: 8, speed: 5.02},
        {power: 120, slope: 8, speed: 6.00},
        {power: 140, slope: 8, speed: 6.98},
        {power: 160, slope: 8, speed: 7.95},
        {power: 180, slope: 8, speed: 8.90},
        {power: 200, slope: 8, speed: 9.84},
        {power: 220, slope: 8, speed: 10.77},
        {power: 240, slope: 8, speed: 11.68},
        {power: 260, slope: 8, speed: 12.58},
        {power: 280, slope: 8, speed: 13.46},
        {power: 300, slope: 8, speed: 14.33},
        {power: 320, slope: 8, speed: 15.19},
    ]
];

// heigth: 90, rider: 75, bike: 10, cadence: 80, CdA: 0.4006, dtLoss: ?,
// dynamicCrr: 0.00330, rho: ?, road bike + hands on tops + narrow racing tire
const dataKreuzotter = [
    [
        {power: 100, slope: 0, speed: 24.03},
        {power: 120, slope: 0, speed: 26.10},
        {power: 140, slope: 0, speed: 27.70},
        {power: 160, slope: 0, speed: 29.10},
        {power: 180, slope: 0, speed: 30.40},
        {power: 200, slope: 0, speed: 31.06},
        {power: 220, slope: 0, speed: 32.70},
        {power: 240, slope: 0, speed: 33.80},
        {power: 260, slope: 0, speed: 34.80},
        {power: 280, slope: 0, speed: 35.70},
        {power: 300, slope: 0, speed: 36.60},
        {power: 320, slope: 0, speed: 37.50},
    ], [
        {power: 100, slope: 2, speed: 14.80},
        {power: 120, slope: 2, speed: 16.80},
        {power: 140, slope: 2, speed: 18.70},
        {power: 160, slope: 2, speed: 20.40},
        {power: 180, slope: 2, speed: 21.90},
        {power: 200, slope: 2, speed: 23.30},
        {power: 220, slope: 2, speed: 24.70},
        {power: 240, slope: 2, speed: 25.90},
        {power: 260, slope: 2, speed: 27.10},
        {power: 280, slope: 2, speed: 28.20},
        {power: 300, slope: 2, speed: 29.20},
        {power: 320, slope: 2, speed: 30.02},
    ], [
        {power: 100, slope: 4, speed: 9.30},
        {power: 120, slope: 4, speed: 11.00},
        {power: 140, slope: 4, speed: 12.60},
        {power: 160, slope: 4, speed: 14.10},
        {power: 180, slope: 4, speed: 15.5},
        {power: 200, slope: 4, speed: 16.90},
        {power: 220, slope: 4, speed: 18.20},
        {power: 240, slope: 4, speed: 19.40},
        {power: 260, slope: 4, speed: 20.60},
        {power: 280, slope: 4, speed: 21.70},
        {power: 300, slope: 4, speed: 22.80},
        {power: 320, slope: 4, speed: 23.90},
    ], [
        {power: 100, slope: 8, speed: 5.10},
        {power: 120, slope: 8, speed: 6.00},
        {power: 140, slope: 8, speed: 7.00},
        {power: 160, slope: 8, speed: 8.00},
        {power: 180, slope: 8, speed: 9.00},
        {power: 200, slope: 8, speed: 9.90},
        {power: 220, slope: 8, speed: 10.80},
        {power: 240, slope: 8, speed: 11.80},
        {power: 260, slope: 8, speed: 12.70},
        {power: 280, slope: 8, speed: 13.50},
        {power: 300, slope: 8, speed: 14.40},
        {power: 320, slope: 8, speed: 15.30},
    ]
];

describe('Model', () => {

    test('powerToMaxSpeed', () => {
        var model = Model({
            dragCoefficient: 1,
            frontalArea:     0.4,
            CdA:             0.4,
            use: {
                spokeDrag: true,
                bearingLoss: true,
                wheelInertia: true,
                dynamicCrr: true,
            }});

        function range(start, stop, step) {
            return Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
        }

        const powerRange = range(100, 320, 20);

        // const speedRange = powerRange.map( power => {
        //     return { power, speed: model.powerToMaxSpeed({power}) * 3.6 };
        // });

        const speedRange = [
            {power: 100, slope: 0, speed: 23.432924360367274},
            {power: 120, slope: 0, speed: 25.189052126217685},
            {power: 140, slope: 0, speed: 26.74838013569652},
            {power: 160, slope: 0, speed: 28.157617078281067},
            {power: 180, slope: 0, speed: 29.448007183812937},
            {power: 200, slope: 0, speed: 30.64158051826261},
            {power: 220, slope: 0, speed: 31.75451044656484},
            {power: 240, slope: 0, speed: 32.79905643261226},
            {power: 260, slope: 0, speed: 33.78475556200895},
            {power: 280, slope: 0, speed: 34.71918831599576},
            {power: 300, slope: 0, speed: 35.608490046695934},
            {power: 320, slope: 0, speed: 36.45770380681783},
        ];

        powerRange.forEach((power, i) => {
            const speed = model.powerToMaxSpeed({power, drivetrainLoss: 0.02}) * 3.6;
            expect(speed).toBe(speedRange[i].speed);
        });
    });


    function configTestRecord(args = {}) {
        const model = args.model;
        const error = args.error ?? 0.015;
        const dt    = args.dt ?? 1;

        return function (record) {
            const power = record.power;
            const slope = (record.slope / 100) ?? 0;

            let state = { speed: 0, acceleration: 0 };

            for(var t=0; t < 70; t++) {
                state = model.virtualSpeed({ power, slope, dt, ...state, });
            }

            const speedReached = state.speed * 3.6;
            const speedPredicted = model.powerToMaxSpeed({
                power,
                slope,
                acceleration: state.acceleration,
            }) * 3.6;

            // console.log(`${record.slope}%, ${power}W, reached: ${speedReached} predicted: ${speedPredicted}, error: ${speedReached - speedPredicted}, t: ${t}`);

            expect(Math.abs(speedReached - speedPredicted)).toBeLessThan(error);
        };
    }

    test('virtualSpeed (single)', () => {
        const model = Model({
            use: {
                spokeDrag: true,
                bearingLoss: true,
                wheelInertia: true,
                dynamicCrr: true,
            }});

        const testRecord = configTestRecord({model});

        testRecord({power: 180, slope: 0});
    });

    describe('virtualSpeed', () => {
        const model = Model({
            use: {
                spokeDrag: true,
                bearingLoss: true,
                wheelInertia: true,
                dynamicCrr: true,
            }});

        const testRecord = configTestRecord({model});

        test('grade 0%', () => {
            dataGribble[0].forEach(testRecord);
        });

        test('grade 2%', () => {
            dataGribble[2].forEach(testRecord);
        });

        test('grade 4%', () => {
            dataGribble[4].forEach(testRecord);
        });

        test('grade 8%', () => {
            dataGribble[8].forEach(testRecord);
        });

        function configDecelerate(args = {}) {
            const dt = args.dt ?? 1/4;
            const fn = args.fn;

            return function (record) {
                const power = 0;
                const speed = record.speed;
                const slope = (record.slope / 100) ?? 0;

                let state = { speed, acceleration: 0 };

                let t=0;
                while(state.speed > 0) {
                    state = fn({ power, slope, dt, ...state, });
                    t++;
                }
                console.log(`${record.speed}km/h, ${power}W, dt: ${dt}, t: ${t}`);

                expect(t).toBeLessThan(2000);
            };
        }

        test('virtualSpeed decelerate from x W', () => {
            const model = Model({
                use: {
                    spokeDrag: true,
                    bearingLoss: true,
                    wheelInertia: true,
                    dynamicCrr: true,
                }});

            const decelerate = configDecelerate({fn: model.virtualSpeed});

            decelerate({slope: 0, speed: (model.powerToMaxSpeed({power: 68, slope: 0}) * 3.6)}); // 20 km/h
            decelerate({slope: 0, speed: (model.powerToMaxSpeed({power: 190, slope: 0}) * 3.6)}); // 30 km/h
            decelerate({slope: 0, speed: (model.powerToMaxSpeed({power: 415, slope: 0}) * 3.6)}); // 40 km/h
            decelerate({slope: 0, speed: (model.powerToMaxSpeed({power: 1310, slope: 0}) * 3.6)}); // 60 km/h

            // Sqrt: 180W->0W, 122t, 1000ms = 122s
            // Sqrt: 180W->0W, 505t, 250ms  = 126s
            // Sqrt: 180W->0W, 1272t, 100ms = 127s

            // Sqrt: 20->0kmh, 118t, 1000ms = 118s
            // Sqrt: 30->0kmh, 122t, 1000ms = 122s
            // Sqrt: 40->0kmh, 125t, 1000ms = 125s
            // Sqrt: 60->0kmh, 127t, 1000ms = 127s

            // Sqrt: 20->0kmh, 485t, 250ms = 121s
            // Sqrt: 30->0kmh, 506t, 250ms = 126s
            // Sqrt: 40->0kmh, 516t, 250ms = 129s
            // Sqrt: 60->0kmh, 527t, 250ms = 131s

            // Sqrt: 20->0kmh, 1221t, 100ms = 121s
            // Sqrt: 30->0kmh, 1274t, 100ms = 127s
            // Sqrt: 40->0kmh, 1301t, 100ms = 130s
            // Sqrt: 60->0kmh, 1328t, 100ms = 132s
        });

        test('virtualSpeedCF decelerate from x W', () => {
            const model = Model({
                use: {
                    spokeDrag: true,
                    bearingLoss: true,
                    wheelInertia: true,
                    dynamicCrr: false,
                }});

            const decelerate = configDecelerate({fn: model.virtualSpeed});

            decelerate({slope: 0, speed: (model.powerToMaxSpeed({power: 68, slope: 0}) * 3.6)}); // 20 km/h
            decelerate({slope: 0, speed: (model.powerToMaxSpeed({power: 190, slope: 0}) * 3.6)}); // 30 km/h
            decelerate({slope: 0, speed: (model.powerToMaxSpeed({power: 415, slope: 0}) * 3.6)}); // 40 km/h
            decelerate({slope: 0, speed: (model.powerToMaxSpeed({power: 1310, slope: 0}) * 3.6)}); // 60 km/h
        });

    });
});

// describe('', () => {
//     test('', () => {
//         expect().toBe();
//     });
// });

