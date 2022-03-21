/*
 (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

// to suit your point format, run search/replace for '.x' and '.y';

// square distance between 2 points
function getSqDist(p1, p2) {

    var dx = p1.x - p2.x,
        dy = p1.y - p2.y;

    return dx * dx + dy * dy;
}

// square distance from a point to a segment
function getSqSegDist(p, p1, p2) {

    var x = p1.x,
        y = p1.y,
        dx = p2.x - x,
        dy = p2.y - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = p2.x;
            y = p2.y;

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = p.x - x;
    dy = p.y - y;

    return dx * dx + dy * dy;
}
// rest of the code doesn't care about point format

// basic distance-based simplification
function simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
        newPoints = [prevPoint],
        point;

    for (var i = 1, len = points.length; i < len; i++) {
        point = points[i];

        if (getSqDist(point, prevPoint) > sqTolerance) {
            newPoints.push(point);
            prevPoint = point;
        }
    }

    if (prevPoint !== point) newPoints.push(point);

    return newPoints;
}

function simplifyDPStep(points, first, last, sqTolerance, simplified) {
    var maxSqDist = sqTolerance,
        index;

    for (var i = first + 1; i < last; i++) {
        var sqDist = getSqSegDist(points[i], points[first], points[last]);

        if (sqDist > maxSqDist) {
            index = i;
            maxSqDist = sqDist;
        }
    }

    if (maxSqDist > sqTolerance) {
        if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
        simplified.push(points[index]);
        if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
}

// simplification using Ramer-Douglas-Peucker algorithm
function simplifyDouglasPeucker(points, sqTolerance) {
    var last = points.length - 1;

    var simplified = [points[0]];
    simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
}

// both algorithms combined for awesome performance
function simplify(points, tolerance, highestQuality) {

    if (points.length <= 2) return points;

    var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

    points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
    points = simplifyDouglasPeucker(points, sqTolerance);

    return points;
}


//
function slopeToColor(slope) {
    // avg hex
    const colors = new Map([
        ['-40',   '#328AFF'],
        ['-17.5', '#3690EA'],
        ['-15',   '#3B97D5'],
        ['-12.5', '#3F9EC0'],
        ['-10',   '#44A5AB'],
        ['-7.5',  '#48AB96'],
        ['-5',    '#4DB281'],
        ['-2.5',  '#52B96C'],
        ['0',     '#57C057'],
        ['2.5',   '#68AC4E'],
        ['5',     '#799845'],
        ['7.5',   '#8A843C'],
        ['10',    '#9B7134'],
        ['12.5',  '#B36129'],
        ['15',    '#CC521F'],
        ['17.5',  '#E54315'],
        ['40',    '#FE340B'],
    ]);

    for(var [key, value] of colors) {
        if(slope <= parseFloat(key)) {
            return value;
        }
    }
    // end avg hex

    // base hue
    // const baseHue = 120;
    // const hue = baseHue - (slope * 12);

    // return `hsl(${hue}, 45%, 55%)`;
    // end base hue
}

function gradeToDeg(grade) {
    // 10 % = 5.71 deg, 5% = 2.86
    return 180/Math.PI * Math.atan(grade/100);
}

function slopeToRise(slope, distance) {
    return distance * Math.sin(Math.atan(slope/100));
}

function slopeToRun(slope, distance) {
    return distance * Math.cos(Math.atan(slope/100));
}

function adjacent(deg, r) {
    return r * Math.cos(Math.PI/180 * deg);
}

function opposite(deg, r) {
    return r * Math.sin(Math.PI/180 * deg);
}



const g = {
    simplifyDouglasPeucker,
    simplify,

    slopeToColor,
    gradeToDeg,
    slopeToRise,
    slopeToRun,
    adjacent,
    opposite,
};

export { g };
