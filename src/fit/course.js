import { exists, equals, toFixed, } from '../functions.js';
import { fit } from './fit.js';
import { fields } from './fields.js';
import { appTypes } from './profiles.js';
import { localMessageDefinitions as lmd } from './local-message-definitions.js';



function toCourse(points, distance, name) {
    return {
        meta: {
            name: name ?? 'Course',
            author: 'n/a',
            category: 'Course',
            discription: '',
            distance,
        },
        id: 0,
        points,
    };
}

function isDataRecord(x) {
    return equals(x.type, 'data') && equals(x.message, 'record');
}

function read(view) {
    const course = fit.activity.read(view);

    const author      = `n/a`;
    const name        = `Course Name`;
    const description = ``;

    let distanceTotal = 0;
    let x = 0;

    console.log(course);

    const points = course.reduce((acc, m, i, xs) => {
        if(isDataRecord(m)) {
            const altitude     = fields.altitude.decode(m.fields.altitude);
            const altitudeNext = fields.altitude.decode(course[i+1]?.fields?.altitude ??
                                                        m.fields.altitude);

            const distance = fields.distance.decode(m.fields.distance);
            const distanceNext = fields.distance.decode(course[i+1]?.fields?.distance ??
                                                        m.fields.distance);
            const rise  = altitudeNext - altitude;
            const r     = distanceNext - distance;
            const run   = Math.sqrt(r**2 - rise**2);
            const slope = equals(run, 0) ? 0 : 100 * (rise/run);

            acc.push({x, y: altitude, r, slope, distance,});
            x += run;
            distanceTotal = distance;
        }
        return acc;
    }, []);

    return toCourse(points, distanceTotal);
}

const course = {
    read,
};

export { course };

