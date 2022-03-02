/**
 * @jest-environment jsdom
 */

import { zwo } from '../../src/workouts/zwo.js';
import { repeat } from '../../src/functions.js';

import { JSDOM } from 'jsdom';

const parser = new DOMParser();

const removeWhiteSpace = (str) => str.replace(/\s/g,'');

describe('Zwo', () => {

    test('Zwo.readToInterval', () => {
        const input = `
        <workout_file>
            <author>Flux</author>
            <name>Test Workout</name>
            <category>Sweet Spot</category>
            <description>Description of test workout</description>
            <sporttype>bike</sporttype>
            <tags></tags>
            <workout>
                <SteadyState Duration="10" Power="0.50"/>
                <SteadyState Duration="15" Power="0.90"/>
                <SteadyState Duration="10" Power="0.70" Slope="2.1" Cadence="90"/>
                <SteadyState Duration="15" Power="0.92" Cadence="80"/>
                <IntervalsT Repeat="2" OnDuration="40" OffDuration="20" OnPower="1.21" OffPower="0.7" OnSlope="4.8" OffSlope="0" />
                <SteadyState Duration="10" Cadence="90"/>
            </workout>
        </workout_file>`;

        const expected = {
            // id: "{1ec20f99-b3d8-4eb9-c000-be96e947897a}",
            meta: {
                author: 'Flux',
                name: "Test Workout",
                category: "Sweet Spot",
                subcategory: "",
                sportType: "bike",
                description: "Description of test workout",
                duration: 3 * 60, // 60s
            },
            intervals: [
                {duration: 10, steps: [{duration: 10, power: 0.50}]},
                {duration: 15, steps: [{duration: 15, power: 0.90}]},
                {duration: 10, steps: [
                    {duration: 10, power: 0.70, slope: 2.1, cadence: 90}]},
                {duration: 15, steps: [{duration: 15, power: 0.92, cadence: 80}]},
                {duration: 40, steps: [{duration: 40, power: 1.21, slope: 4.8}]},
                {duration: 20, steps: [{duration: 20, power: 0.7, slope: 0.0}]},
                {duration: 40, steps: [{duration: 40, power: 1.21, slope: 4.8}]},
                {duration: 20, steps: [{duration: 20, power: 0.7, slope: 0.0}]},
                {duration: 10, steps: [{duration: 10, cadence: 90}]},
            ],
        };

        let res = zwo.readToInterval(input);

        expect(res).toStrictEqual(expected);
    });

    test('Zwo.read', () => {
        const input = `
        <workout_file>
            <author>Flux</author>
            <name>Test Workout</name>
            <category>Sweet Spot</category>
            <description>Description of test workout</description>
            <sporttype>bike</sporttype>
            <tags></tags>
            <workout>
                <SteadyState Duration="10" Power="0.50"/>
                <SteadyState Duration="15" Power="0.90"/>
                <SteadyState Duration="10" Power="0.70" Slope="2.1" Cadence="90"/>
                <SteadyState Duration="15" Power="0.92" Cadence="80"/>
                <IntervalsT Repeat="2" OnDuration="40" OffDuration="20" OnPower="1.21" OffPower="0.7" OnSlope="4.8" OffSlope="0" />
                <SteadyState Duration="10" Cadence="90"/>
            </workout>
        </workout_file>`;

        const expected = {
            head: {
                author: 'Flux',
                name: "Test Workout",
                category: "Sweet Spot",
                subcategory: "",
                sportType: "bike",
                description: "Description of test workout",
            },
            body: [
                {element: 'SteadyState', Duration: 10, Power: 0.50},
                {element: 'SteadyState', Duration: 15, Power: 0.90,},
                {element: 'SteadyState', Duration: 10, Power: 0.70, Slope: 2.1, Cadence: 90},
                {element: 'SteadyState', Duration: 15, Power: 0.92, Cadence: 80},
                {element: 'IntervalsT',  Repeat: 2, OnDuration: 40, OffDuration: 20, OnPower: 1.21, OffPower: 0.7, OnSlope: 4.8, OffSlope: 0},
                {element: 'SteadyState', Duration: 10, Cadence: 90},
            ],
        };

        let res = zwo.read(input);

        expect(res).toStrictEqual(expected);
    });

    test('Zwo.write', () => {

        const input = {
            head: {
                author: 'Flux',
                name: "Test Workout",
                category: "Sweet Spot",
                subcategory: "",
                sportType: "bike",
                description: "Description of test workout",
            },
            body: [
                {element: 'SteadyState', Duration: 10, Power: 0.50},
                {element: 'SteadyState', Duration: 15, Power: 0.90,},
                {element: 'SteadyState', Duration: 10, Power: 0.70, Slope: 2.1, Cadence: 90},
                {element: 'SteadyState', Duration: 15, Power: 0.92, Cadence: 80},
                {element: 'IntervalsT',  Repeat: 2, OnDuration: 40, OffDuration: 20, OnPower: 1.21, OffPower: 0.7, OnSlope: 4.8, OffSlope: 0},
                {element: 'SteadyState', Duration: 10, Cadence: 90},
            ],
        };

        const expected = `
        <workout_file>
            <author>Flux</author>
            <name>Test Workout</name>
            <category>Sweet Spot</category>
            <subcategory></subcategory>
            <description>Description of test workout</description>
            <sporttype>bike</sporttype>
            <tags></tags>
            <workout>
                <SteadyState Duration="10" Power="0.5"/>
                <SteadyState Duration="15" Power="0.9"/>
                <SteadyState Duration="10" Power="0.7" Slope="2.1" Cadence="90"/>
                <SteadyState Duration="15" Power="0.92" Cadence="80"/>
                <IntervalsT Repeat="2" OnDuration="40" OffDuration="20" OnPower="1.21" OffPower="0.7" OnSlope="4.8" OffSlope="0" />
                <SteadyState Duration="10" Cadence="90"/>
            </workout>
        </workout_file>`;

        let res = zwo.write(input);

        expect(removeWhiteSpace(res)).toEqual(removeWhiteSpace(expected));
    });

});

describe('Head', () => {
    test('Head.read', () => {
        const xml = `
        <workout_file>
            <author>Flux</author>
            <name>Test Workout</name>
            <category>Sweet Spot</category>
            <description>Description of test workout</description>
            <sporttype>bike</sporttype>
            <tags></tags>
            <workout>
            </workout>
        </workout_file>`;

        const doc = parser.parseFromString(xml, 'text/xml');

        expect(zwo.head.read({doc})).toStrictEqual({
            author: 'Flux',
            name: 'Test Workout',
            category: "Sweet Spot",
            subcategory: "",
            description: "Description of test workout",
            sportType: "bike",
        });
    });

    test('Head.write', () => {
        const xml = `
            <author>Flux</author>
            <name>Test Workout</name>
            <category>Sweet Spot</category>
            <subcategory></subcategory>
            <description>Description of test workout</description>
            <sporttype>bike</sporttype>
            <tags></tags>`;

        expect(zwo.head.write({
            author: 'Flux',
            name: 'Test Workout',
            description: "Description of test workout",
            category: "Sweet Spot",
        })).toStrictEqual(xml);
    });
});

describe('Body', () => {
    test('Body.readToInterval 1 element', () => {
        const xml = `
        <workout_file>
            <workout>
                <SteadyState Duration="10" Power="0.50"/>
            </workout>
        </workout_file>`;

        const doc = parser.parseFromString(xml, 'text/xml');

        expect(zwo.body.readToInterval({doc})).toStrictEqual([
            {duration: 10, steps: [{duration: 10, power: 0.50}]},
        ]);
    });

    test('Body.readToInterval many elements', () => {

        const xml = `
        <workout_file>
            <workout>
                <SteadyState Duration="10" Power="0.50"/>
                <SteadyState Duration="15" Power="0.90"/>
                <SteadyState Duration="10" Power="0.70" Slope="2.1" Cadence="90"/>
                <SteadyState Duration="15" Power="0.92" Cadence="80"/>
                <SteadyState Duration="10" Cadence="90"/>
            </workout>
        </workout_file>`;

        const doc = parser.parseFromString(xml, 'text/xml');

        expect(zwo.body.readToInterval({doc})).toStrictEqual([
            {duration: 10, steps: [{duration: 10, power: 0.50}]},
            {duration: 15, steps: [{duration: 15, power: 0.90,}]},
            {duration: 10, steps: [{duration: 10, power: 0.70, slope: 2.1, cadence: 90}]},
            {duration: 15, steps: [{duration: 15, power: 0.92, cadence: 80}]},
            {duration: 10, steps: [{duration: 10, cadence: 90}]},
        ]);
    });

    test('Body.write many elements', () => {

        const expected = `
            <workout>
                <SteadyState Duration="10" Power="0.5" />
                <SteadyState Duration="15" Power="0.9" />
                <SteadyState Duration="10" Power="0.7" Slope="2.1" Cadence="90" />
                <SteadyState Duration="15" Power="0.92" Cadence="80" />
                <IntervalsT Repeat="2" OnDuration="40" OffDuration="20" OnPower="1.21" OffPower="0.7" OnSlope="4.8" OffSlope="0" />
                <SteadyState Duration="10" Cadence="90" />
            </workout>`;

        const input = [
            {element: 'SteadyState', Duration: 10, Power: 0.50},
            {element: 'SteadyState', Duration: 15, Power: 0.90,},
            {element: 'SteadyState', Duration: 10, Power: 0.70, Slope: 2.1, Cadence: 90},
            {element: 'SteadyState', Duration: 15, Power: 0.92, Cadence: 80},
            {element: 'IntervalsT',  Repeat: 2, OnDuration: 40, OffDuration: 20, OnPower: 1.21, OffPower: 0.7, OnSlope: 4.8, OffSlope: 0},
            {element: 'SteadyState', Duration: 10, Cadence: 90},
        ];

        expect(removeWhiteSpace(zwo.body.write(input))).toBe(removeWhiteSpace(expected));
    });
});

describe('Attribute', () => {

    const xml = `
        <workout>
            <SteadyState Duration="300" Power="0.88" Slope="4.8" Cadence="90"/>
            <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="0.98" OffPower="0.63" Cadence="90" CadenceResting="80"/>
        </workout>`;

    const doc = parser.parseFromString(xml, 'text/xml');

    const steadyStates  = doc.querySelectorAll('SteadyState');
    const elSteadyState = steadyStates[0];
    const elIntervalsT  = doc.querySelector('IntervalsT');

    test('readAttribute Int', () => {
        const duration = zwo.readAttribute({el: elSteadyState, name: 'Duration',  decode: parseInt});
        expect(duration).toBe(300);
    });

    test('readAttribute Float', () => {
        const power = zwo.readAttribute({el: elSteadyState, name: 'Power', decode: parseFloat});
        expect(power).toBe(0.88);
    });

    test('readAttribute Undefined', () => {
        const OnSlope = zwo.readAttribute({el: elIntervalsT, name: 'OnSlope'});
        expect(OnSlope).toBe(undefined);
    });

    test('writeAttribute', () => {
        let duration = zwo.writeAttribute({name: 'Duration', value: 300});
        let power    = zwo.writeAttribute({name: 'Power', value: 0.88});
        let powerAbs = zwo.writeAttribute({name: 'Power', value: 240});
        let slope    = zwo.writeAttribute({name: 'Slope', value: 4.8});

        expect(duration).toBe('Duration="300"');
        expect(power).toBe('Power="0.88"');
        expect(powerAbs).toBe('Power="240"');
        expect(slope).toBe('Slope="4.8"');
    });

    describe('Attribute', () => {
        let el       = doc.querySelector('SteadyState');
        let duration = zwo.Attribute({name: 'Duration', decode: parseInt});

        test('Attribute.getName', () => {
            expect(duration.getName()).toBe('Duration');
        });

        test('Attribute.read', () => {
            expect(duration.read({el})).toBe(300);
        });

        test('Attribute.write', () => {
            expect(duration.write({value: 300})).toBe('Duration="300"');
        });
    });
});

describe('Attrs', () => {

    const xml = `
        <workout>
            <SteadyState Duration="300" Power="0.88" Slope="4.8" Cadence="90"/>
            <SteadyState Duration="300" Power="240"/>
            <FreeRide Duration="100" Sim="-1,4, 0,4, 1,4, 3.5,4"/>
            <IntervalsT Repeat="2" OnDuration="30" OffDuration="30" OnPower="0.98" OffPower="0.63" Cadence="90" CadenceResting="80"/>
        </workout>`;

    const doc = parser.parseFromString(xml, 'text/xml');

    const steadyStates  = doc.querySelectorAll('SteadyState');
    const elSteadyState = steadyStates[0];
    const elPowerAbs    = steadyStates[1];
    const elFreeRide    = doc.querySelector('FreeRide');
    const elIntervalsT  = doc.querySelector('IntervalsT');

    test('Duration.read', () => {
        const duration = zwo.Attrs.Duration.read({el: elSteadyState});
        expect(duration).toBe(300);
    });

    test('Power.read', () => {
        const power = zwo.Attrs.Power.read({el: elSteadyState});
        expect(power).toBe(0.88);
    });

    test('Power.read (absolute)', () => {
        const power = zwo.Attrs.Power.read({el: elPowerAbs});
        expect(power).toBe(240);
    });

    test('Slope.read', () => {
        const slope = zwo.Attrs.Slope.read({el: elSteadyState});
        expect(slope).toBe(4.8);
    });

    test('Cadence.read', () => {
        const cadence = zwo.Attrs.Cadence.read({el: elSteadyState});
        expect(cadence).toBe(90);
    });

    test('CadenceResting.read', () => {
        const cadence = zwo.Attrs.CadenceResting.read({el: elIntervalsT});
        expect(cadence).toBe(80);
    });

    test('Sim.read', () => {
        const sim = zwo.Attrs.Sim.read({el: elFreeRide});
        expect(sim).toEqual([-1,4, 0,4, 1,4, 3.5,4]);
    });

    test('Sim.write', () => {
        const attr = zwo.Attrs.Sim.write({value: [-1,4, 0,4, 1,4, 3.5,4]});
        expect(attr).toEqual(`Sim="-1,4,0,4,1,4,3.5,4"`);
    });
});

describe('SteadyState', () => {
    const SteadyState = zwo.Elements.SteadyState;

    const xml =
          `<workout>
               <SteadyState Duration="300" Power="0.88" Cadence="90" Slope="4.8" />
               <SteadyState Duration="300" Power="240" />
           </workout>`;

    const doc   = parser.parseFromString(xml, 'text/xml');
    const els   = doc.querySelectorAll('SteadyState');
    const el    = els[0];
    const elAbs = els[1];

    test('getName', () => {
        expect(SteadyState.getName()).toBe('SteadyState');
    });

    test('read', () => {
        expect(SteadyState.read({el})).toStrictEqual({
            element: 'SteadyState',
            Duration: 300,
            Power: 0.88,
            Cadence: 90,
            Slope: 4.8
        });

        expect(SteadyState.read({el: elAbs})).toStrictEqual({
            element: 'SteadyState',
            Duration: 300,
            Power: 240,
        });
    });

    test('write', () => {
        const res = `<SteadyState Duration="300" Power="0.88" Cadence="90" Slope="4.8" />`;

        expect(SteadyState.write({
            Duration: 300,
            Power: 0.88,
            Cadence: 90,
            Slope: 4.8
        })).toBe(res);
    });

    test('toInterval', () => {
        expect(SteadyState.toInterval({
            Duration: 300,
            Power: 0.88,
            Cadence: 90,
            Slope: 4.8
        })).toStrictEqual({
            duration: 300,
            steps: [{
                duration: 300,
                power: 0.88,
                cadence: 90,
                slope: 4.8
            }]
        });
    });

    test('readToInterval', () => {
        expect(SteadyState.readToInterval({el})).toStrictEqual({
            duration: 300,
            steps: [{
                duration: 300,
                power: 0.88,
                cadence: 90,
                slope: 4.8
            }]
        });
    });
});

describe('IntervalsT', () => {
    const IntervalsT = zwo.Elements.IntervalsT;

    const xml = `<IntervalsT Repeat="2" OnDuration="40" OffDuration="20" OnPower="1.21" OffPower="0.7" OnSlope="4.8" OffSlope="0" />`;

    // const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    let el = doc.querySelector('IntervalsT');

    test('getName', () => {
        expect(IntervalsT.getName()).toBe('IntervalsT');
    });

    test('read', () => {
        expect(IntervalsT.read({el})).toStrictEqual({
            element: 'IntervalsT',
            Repeat: 2,
            OnDuration: 40,
            OffDuration: 20,
            OnPower: 1.21,
            OffPower: 0.7,
            OnSlope: 4.8,
            OffSlope: 0,
        });
    });

    test('write', () => {
        expect(IntervalsT.write({
            Repeat: 2,
            OnDuration: 40,
            OffDuration: 20,
            OnPower: 1.21,
            OffPower: 0.7,
            OnSlope: 4.8,
            OffSlope: 0,
        })).toBe(xml);
    });

    test('calcDuration', () => {
        expect(IntervalsT.calcDuration({
            element: 'IntervalsT',
            Repeat: 2,
            OnDuration: 40,
            OffDuration: 20,
            OnPower: 1.21,
            OffPower: 0.7,
            OnSlope: 4.8,
            OffSlope: 0,
        })).toStrictEqual(2 * 60);
    });

    test('toInterval', () => {
        expect(IntervalsT.toInterval({
            element: 'IntervalsT',
            Repeat: 2,
            OnDuration: 40,
            OffDuration: 20,
            OnPower: 1.21,
            OffPower: 0.7,
            OnSlope: 4.8,
            OffSlope: 0,
        })).toStrictEqual([
            {duration: 40, steps: [{duration: 40, power: 1.21, slope: 4.8}]},
            {duration: 20, steps: [{duration: 20, power: 0.7, slope: 0.0}]},
            {duration: 40, steps: [{duration: 40, power: 1.21, slope: 4.8}]},
            {duration: 20, steps: [{duration: 20, power: 0.7, slope: 0.0}]},
        ]);
    });

    test('readToInterval', () => {
        expect(IntervalsT.readToInterval({el})).toStrictEqual([
            {duration: 40, steps: [{duration: 40, power: 1.21, slope: 4.8}]},
            {duration: 20, steps: [{duration: 20, power: 0.7, slope: 0.0}]},
            {duration: 40, steps: [{duration: 40, power: 1.21, slope: 4.8}]},
            {duration: 20, steps: [{duration: 20, power: 0.7, slope: 0.0}]},
        ]);
    });
});

describe('Steps', () => {
    const intervalsTTag = {
        element: 'IntervalsT',
        Repeat: 8,
        OnDuration: 40,
        OffDuration: 20,
        OnPower: 1.21,
        OffPower: 0.7,
        OnSlope: 4.8,
        OffSlope: 0,
        Cadence: 90,
        CadenceResting: 80,
    };

    const steadyStateTag = {
        element: 'SteadyState',
        Duration: 300,
        Power: 0.88,
        Slope: 4.8,
    };

    test('Step', () => {
        expect(zwo.Step(steadyStateTag)).toStrictEqual({
            duration: 300,
            power: 0.88,
            slope: 4.8,
        });
    });

    test('OnStep', () => {
        expect(zwo.OnStep(intervalsTTag)).toStrictEqual({
            duration: 40,
            power: 1.21,
            slope: 4.8,
            cadence: 90,
        });
    });

    test('OffStep', () => {
        expect(zwo.OffStep(intervalsTTag)).toStrictEqual({
            duration: 20,
            power: 0.7,
            slope: 0,
            cadence: 80,
        });
    });
});

describe('FreeRide', () => {
    const FreeRide = zwo.Elements.FreeRide;

    const xml = `<workout>
                     <FreeRide Duration="300" />
                     <FreeRide Duration="16" Sim="-1,4,0,4,1,4,3.5,4" />
                     <FreeRide Track="-1,4,0,4,1,4,3.5,4" />
                 </workout>`;

    const doc     = parser.parseFromString(xml, 'text/xml');
    const els     = doc.querySelectorAll('FreeRide');
    const el      = els[0];
    const elSim   = els[1];
    const elTrack = els[2];

    test('getName', () => {
        expect(FreeRide.getName()).toBe('FreeRide');
    });

    test('read', () => {
        expect(FreeRide.read({el})).toStrictEqual({
            element: 'FreeRide',
            Duration: 300,
        });
        expect(FreeRide.read({el: elSim})).toStrictEqual({
            element: 'FreeRide',
            Duration: 16,
            Sim: [-1,4, 0,4, 1,4, 3.5,4],
        });
        expect(FreeRide.read({el: elTrack})).toStrictEqual({
            element: 'FreeRide',
            // Distance: 16,
            Track: [-1,4, 0,4, 1,4, 3.5,4],
        });
    });

    test('write Sim', () => {
        const res = `<FreeRide Duration="16" Sim="-1,4,0,4,1,4,3.5,4" />`;
        expect(FreeRide.write({
            Duration: 16,
            Sim: [-1,4, 0,4, 1,4, 3.5,4],
        })).toEqual(res);
    });

    test('write Track', () => {
        const res = `<FreeRide Distance="16" Track="-1,4,0,4,1,4,3.5,4" />`;
        expect(FreeRide.write({
            Distance: 16,
            Track: [-1,4, 0,4, 1,4, 3.5,4],
        })).toEqual(res);
    });

    test('toInterval', () => {
        expect(FreeRide.toInterval({
            Duration: 300,
        })).toStrictEqual({
            duration: 300,
            steps: [{
                duration: 300,
                power: 0,
                slope: 0
            }]
        });

        expect(FreeRide.toInterval({
            Duration: 16,
            Sim: [-1,4, 0,4, 1,4, 3.5,4],
        })).toStrictEqual({
            duration: 16,
            steps: [
                {duration: 4, power: 0, slope: -1},
                {duration: 4, power: 0, slope: 0},
                {duration: 4, power: 0, slope: 1},
                {duration: 4, power: 0, slope: 3.5},
            ]
        });

        expect(FreeRide.toInterval({
            Duration: 60,
            Sim: [-1,4, 0,4, 1,4, 3.5,4],
        })).toStrictEqual({
            duration: 60,
            steps: [
                {duration: 4, power: 0, slope: -1},
                {duration: 4, power: 0, slope: 0},
                {duration: 4, power: 0, slope: 1},
                {duration: 4, power: 0, slope: 3.5},
                {duration: 44, power: 0, slope: 0},
            ]
        });

        expect(FreeRide.toInterval({
           Distance: 16,
           Track: [-1,4, 0,4, 1,4, 3.5,4],
        })).toStrictEqual({
            distance: 16,
            steps: [
                {distance: 4, power: 0, slope: -1},
                {distance: 4, power: 0, slope: 0},
                {distance: 4, power: 0, slope: 1},
                {distance: 4, power: 0, slope: 3.5},
            ]
        });
    });

    test('readToInterval', () => {
        expect(FreeRide.readToInterval({el})).toStrictEqual({
            duration: 300,
            steps: [
                {duration: 300, power: 0, slope: 0},
            ]
        });

        expect(FreeRide.readToInterval({el: elSim})).toStrictEqual({
            duration: 16,
            steps: [
                {duration: 4, power: 0, slope: -1},
                {duration: 4, power: 0, slope: 0},
                {duration: 4, power: 0, slope: 1},
                {duration: 4, power: 0, slope: 3.5},
            ]
        });
    });
});

describe('Warmup', () => {
    const Warmup = zwo.Elements.Warmup;

    const xml = `<Warmup Duration="300" PowerLow="0.4" PowerHigh="0.7" />`;

    // const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    let el = doc.querySelector('Warmup');

    test('getName', () => {
        expect(Warmup.getName()).toBe('Warmup');
    });

    test('read', () => {
        expect(Warmup.read({el})).toStrictEqual({
            element: 'Warmup',
            Duration: 300,
            PowerLow: 0.4,
            PowerHigh: 0.7,
        });
    });

    test('write', () => {
        expect(Warmup.write({
            Duration: 300,
            PowerLow: 0.4,
            PowerHigh: 0.7,
        })).toBe(xml);
    });

    test('toInterval 0.4 to 0.7 in 60s', () => {
        expect(Warmup.toInterval({
            element: 'Warmup',
            Duration: 60,
            PowerLow: 0.4,
            PowerHigh: 0.7,
        })).toStrictEqual({
            duration: 60,
            steps: [
                {duration: 10, power: 0.4},
                {duration: 10, power: 0.46},
                {duration: 10, power: 0.52},
                {duration: 10, power: 0.58},
                {duration: 10, power: 0.64},
                {duration: 10, power: 0.7},
            ]
        });
    });

    test('toInterval 0.4 to 0.7 in 120s', () => {
        expect(Warmup.toInterval({
            element: 'Warmup',
            Duration: 120,
            PowerLow: 0.4,
            PowerHigh: 0.7,
        })).toStrictEqual({
            duration: 120,
            steps: [
                {duration: 10, power: 0.4},
                {duration: 10, power: 0.43}, // 0.427
                {duration: 10, power: 0.45}, // 0.454

                {duration: 10, power: 0.48}, // 0.481
                {duration: 10, power: 0.51}, // 0.508
                {duration: 10, power: 0.54}, // 0.535


                {duration: 10, power: 0.56}, // 0.562
                {duration: 10, power: 0.59}, // 0.589
                {duration: 10, power: 0.62}, // 0.616

                {duration: 10, power: 0.65}, // 0.643 ? should be 0.64
                {duration: 10, power: 0.67}, // 0.670
                {duration: 10, power: 0.70}, // 0.697
            ]
        });
    });
});

describe('Cooldown', () => {
    const Cooldown = zwo.Elements.Cooldown;

    const xml = `<Cooldown Duration="120" PowerLow="0.7" PowerHigh="0.4" />`;

    // const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    let el = doc.querySelector('Cooldown');

    test('getName', () => {
        expect(Cooldown.getName()).toBe('Cooldown');
    });

    test('read', () => {
        expect(Cooldown.read({el})).toStrictEqual({
            element: 'Cooldown',
            Duration: 120,
            PowerLow: 0.7,
            PowerHigh: 0.4,
        });
    });

    test('write', () => {
        expect(Cooldown.write({
            Duration: 120,
            PowerLow: 0.7,
            PowerHigh: 0.4,
        })).toBe(xml);
    });

    test('toInterval 0.7 to 0.4 in 60s', () => {
        expect(Cooldown.toInterval({
            element: 'Cooldown',
            Duration: 60,
            PowerLow: 0.7,
            PowerHigh: 0.4,
        })).toStrictEqual({
            duration: 60,
            steps: [
                {duration: 10, power: 0.7},
                {duration: 10, power: 0.64},
                {duration: 10, power: 0.58},
                {duration: 10, power: 0.52},
                {duration: 10, power: 0.46},
                {duration: 10, power: 0.4},
            ]
        });
    });
});

// describe('', () => {
//     test('', () => {
//     });
// });
