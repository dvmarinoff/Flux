import { exists, equals, toFixed, } from '../functions.js';
import { fit } from './fit.js';
import { fields } from './fields.js';
import { appTypes } from './profiles.js';
import { localMessageDefinitions as lmd } from './local-message-definitions.js';
import { g } from '../views/graph.js';



function toCourse(points, distance, name) {
    const pointsSimplified = g.simplify(points, 0.5, true).map((p, i, xs) => {
        const x1 = xs[i].x;
        const y1 = xs[i].y;
        const x2 = (xs[i+1]?.x ?? xs[i].x);
        const y2 = (xs[i+1]?.y ?? xs[i].y);
        const run = x2 - x1;
        const rise = y2 - y1;
        const r = Math.sqrt(run**2 + rise**2);
        const slope = equals(run, 0) ? 0 : (100 * (rise/run));
        // console.table({rise,run,slope,r});
        xs[i].r = r;
        xs[i].slope = slope;
        return xs[i];
    });

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
        pointsSimplified,
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

