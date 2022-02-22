import { Model } from '../src/physics.js';

describe('Model', () => {

    test('powerToMaxSpeed', () => {
        var model = Model({
            use: {
                spokeDrag: true,
                bearingLoss: true,
                wheelInertia: true,
                dynamicCrr: true,
                smallAngleApprox: false,
            }});

        function range(start, stop, step) {
            return Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));
        }

        const powerRange = range(100, 300, 20);

        // const speedRange = powerRange.map( power => {
        //     return { power, speed: model.powerToMaxSpeed({power}) * 3.6 };
        // });

        const speedRange = [
            {power: 100, speed: 23.432924360367274},
            {power: 120, speed: 25.189052126217685},
            {power: 140, speed: 26.74838013569652},
            {power: 160, speed: 28.157617078281067},
            {power: 180, speed: 29.448007183812937},
            {power: 200, speed: 30.64158051826261},
            {power: 220, speed: 31.75451044656484},
            {power: 240, speed: 32.79905643261226},
            {power: 260, speed: 33.78475556200895},
            {power: 280, speed: 34.71918831599576},
            {power: 300, speed: 35.608490046695934},
        ];

        powerRange.forEach((power, i) => {
            const speed = model.powerToMaxSpeed({power}) * 3.6;
            expect(speed).toBe(speedRange[i].speed);
        });
    });

    test('powerToMaxSpeed', () => {
        var model = Model({
            use: {
                spokeDrag: true,
                bearingLoss: false,
                wheelInertia: false,
                dynamicCrr: true,
                smallAngleApprox: false,
            }});

        const power = 100;
        const speed_init = 0;
        let speed_prev = 0;

        let acceleration_init = 0;
        let acceleration_prev = 0;
        let res = {};

        for(var t=0; t < 30; t++) {
            res = model.virtualSpeed({power, speed: speed_prev, acceleration: acceleration_prev});
            speed_prev = res.speed;
            acceleration_prev = res.acceleration;
            // console.log(res.speed * 3.6);
        }

        const speedReached = res.speed * 3.6;
        const speedPredicted = model.powerToMaxSpeed({power}) * 3.6;
        console.log(`reached: ${speedReached} predicted: ${speedPredicted}, error: ${speedReached - speedPredicted}, t: ${t}`);

        expect(speedReached - speedPredicted).toBeLessThan(0.45);
    });
});

// describe('', () => {
//     test('', () => {
//         expect().toBe();
//     });
// });

