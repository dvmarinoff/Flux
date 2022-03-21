import { exists, equals, toFixed, } from '../functions.js';
import { fit } from './fit.js';
import { fields } from './fields.js';
import { appTypes } from './profiles.js';
import { localMessageDefinitions as lmd } from './local-message-definitions.js';

function coordsToDistance(coord1, coord2) {
    const R = 6371e3; // metres
    const φ1 = coord1.lat * Math.PI/180; // φ, λ in radians
    const φ2 = coord2.lat * Math.PI/180;
    const Δφ = (coord2.lat-coord1.lat) * Math.PI/180;
    const Δλ = (coord2.lon-coord1.lon) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres

    return d;
}

function toZwo(points) {
    const author      = `Unknown`;
    const name        = `Course Name`;
    const description = ``;

    const track = points.reduce((acc, p) => {
        acc += `${toFixed(p.slope, 4)},${toFixed(p.distance, 2)}, `;
        return acc;
    }, '');

    return `<workout_file>
        <author>${author}</author>
        <name>${name}</name>
        <category>Course</category>
        <description>${description}</description>
        <sportType>bike</sportType>
        <tags>
        </tags>
    <workout>
            <FreeRide Altitude="100" Track="${track}"/>
        </workout>
    </workout_file>`;
}

function toGraph(points, distanceCum) {
    return { distance: distanceCum, steps: points };
}

function isDataRecord(x) {
    return equals(x.type, 'data') && equals(x.message, 'record');
}

function read(view) {
    const course = fit.activity.read(view);

    const author      = `Unknown`;
    const name        = `Course Name`;
    const description = ``;

    let distanceCum   = 0;

    const points = course.reduce((acc, m, i, xs) => {
        if(isDataRecord(m)) {
            const altitude     = fields.altitude.decode(m.fields.altitude);
            const altitudeNext = fields.altitude.decode(course[i+1]?.fields?.altitude ??
                                                        m.fields.altitude);

            const rise     = (altitudeNext - altitude);
            const distance = fields.distance.decode(course[i+1]?.fields?.distance ??
                                                    m.fields.distance) -
                             fields.distance.decode(m.fields.distance);
            const run      = Math.sqrt(distance**2 - rise**2);
            const slope    = equals(run, 0) ? 0 : 100 * (rise/run);

            // console.log(`i: ${i}, rise: ${toFixed(rise, 4)}, run: ${toFixed(run, 2)}, a: ${altitude}, an: ${altitudeNext}, d: ${distance}, s: ${toFixed(slope, 2)}`);

            distanceCum += distance;
            acc.push({x: distanceCum, y: altitude, altitude, distance, slope});
        }
        return acc;
    }, []);

    // const pointsSimplified = g.simplify(points, 0.5, true);
    // const pointsSimplified = g.simplifyDouglasPeucker(points, 0.5, true);

    console.log(distanceCum);

    return toGraph(points, distanceCum);
}

const course = {
    read,
};

export { course };
