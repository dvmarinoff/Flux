import { xf, equals, exists, } from './functions.js';
import { models } from './models/models.js';

console.log(`course.js ...`);

function Course() {

    const abortController = new AbortController();
    const signal = {signal: abortController.signal};

    xf.sub(`db:distance`,     onDistance.bind(this), signal);
    xf.sub('db:workout',      onWorkout.bind(this), signal);
    xf.sub('ui:workoutStart', onWatchStart.bind(this), signal);
    xf.sub('ui:watchStart',   onWatchStart.bind(this), signal);

    let distance = 0;
    let index = 0;
    let maxIndex = 0;
    let courseDistance = 0;
    let r = 0;
    let slope = 0;
    let course;

    let segmentStart = 0;

    function isCourse() {
        return exists(course?.points);
    }
    function onDistance(value) {
        distance = (value % courseDistance);

        if((distance - segmentStart) >= r || (segmentStart > distance)) {
            segmentStart = distance;
            index = (index + 1) % maxIndex;
            r = indexToR(index);
            slope = indexToSlope(index);
            xf.dispatch(`ui:slope-target-set`, slope);
            // console.table({r,distance,courseDistance,slope,index,maxIndex,});
        }
    }
    function onWorkout(workout) {
        // console.log(workout?.points?.length);
        // console.log(workout?.points);
        // console.log(workout?.pointsSimplified);
        course = workout;
    }
    function onWatchStart() {
        if(isCourse()) {
            start();
        }
    }
    function start() {
        if(distance > 0) return;

        maxIndex = course.pointsSimplified.length-1;
        courseDistance = course.meta.distance;
        r = indexToR(index);
        slope = indexToSlope(index);
        xf.dispatch(`ui:slope-target-set`, slope);
        console.log(`start a course ...`);
    }
    function indexToSlope(index) {
        return course.pointsSimplified[index].slope;
    }
    function indexToR(index) {
        return course.pointsSimplified[index].r;
    }

    Object.freeze({
        start,
    });
}

// r = 12;
// slope = -0.4819;
// distance = 7429;

//  0: -1.2,    453
//  1: -0.4, 	   94
//  2:  1.2,    104
//  3:  0.447, 1072
//  4:  0.133,  299
//  5:  0.9,    564
//  6:  0.57,  1087
//  7:  0.0,    823
//  8: -0.7, 	  680
//  9: -0.46,	  649
// 10: -0.15,   390
// 11:  0.0,   1213
// 12: -0.4,     83
// 13: -3.9,     56
// 14: -1.0, 	  220
// 15:  0,        0

const course = Course();

export { course };
