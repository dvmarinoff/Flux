import { exists, equals, first, toFixed, } from '../functions.js';
import { fit } from './fit.js';
import { fields } from './fields.js';
import { appTypes } from './profiles.js';
import { localMessageDefinitions as lmd } from './local-message-definitions.js';
import { g } from '../views/graph.js';



function toCourse(points, distance, name, description) {
    const pointsSimplified = g.simplify(points, 0.5, true).map((p, i, xs) => {
        const x1 = xs[i].x;
        const y1 = xs[i].y;
        const x2 = (xs[i+1]?.x ?? xs[i].x);
        const y2 = (xs[i+1]?.y ?? xs[i].y);
        const run = x2 - x1;
        const rise = y2 - y1;
        const r = Math.sqrt(run**2 + rise**2);
        const slope = equals(run, 0) ? 0 : (100 * (rise/run));
        xs[i].r = r;
        xs[i].slope = slope;
        return xs[i];
    });

    return {
        meta: {
            name: name ?? 'Course',
            author: 'n/a',
            category: 'Course',
            description: description,
            distance,
        },
        // id: 0,
        points,
        pointsSimplified,
    };
}

function isDataRecord(x) {
    return equals(x.type, 'data') && equals(x.message, 'record');
}

function hasAltitude(x) {
    return exists(x.fields.altitude);
}

function hasDistance(x) {
    return exists(x.fields.distance);
}

function isCourseDataMessage(x) {
    return equals(x.type, 'data') && equals(x.message, 'course');
}

function courseName(course, fileName) {
    const courseDataMessage = course.find(isCourseDataMessage);
    const name = courseDataMessage?.fields?.name ?? fileName;
    return name.replace(/.fit/gi, '').replace(/_|-/gi, ' ');
}

function read(view, fileName) {
    const course = fit.activity.read(view);

    const name = courseName(course, fileName);
    const author = `n/a`;
    const description = ``;

    let distanceTotal = 0;
    let x = 0;

    const dataRecords = course.filter(r => isDataRecord(r) && hasDistance(r));
    const altitudeRecords = dataRecords.filter(hasAltitude);

    let prevAltitude = first(altitudeRecords).fields.altitude;

    const points = dataRecords.reduce((acc, m, i, xs) => {
        if(!exists(m.fields.altitude)) {
            m.fields.altitude = prevAltitude;
            console.log(prevAltitude);
        } else {
            prevAltitude = m.fields.altitude;
        }

        const altitude     = fields.altitude.decode(m.fields.altitude);
        const altitudeNext = fields.altitude.decode(xs[i+1]?.fields?.altitude ??
                                                    m.fields.altitude);

        const distance = fields.distance.decode(m.fields.distance);
        const distanceNext = fields.distance.decode(xs[i+1]?.fields?.distance ??
                                                    m.fields.distance);

        const rise  = altitudeNext - altitude;
        const r     = distanceNext - distance;
        const run   = equals(r, 0) ? 0 : Math.sqrt(Math.abs(r**2 - rise**2));
        const slope = equals(run, 0) ? 0 : 100 * (rise/run);

        acc.push({x, y: altitude, r, slope, distance,});
        x += run;
        distanceTotal = distance;
        return acc;
    }, []);

    return toCourse(points, distanceTotal, name, description);
}

const course = {
    read,
};

export { course };

