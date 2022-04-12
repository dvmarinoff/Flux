import { xf, equals, exists, first, } from './functions.js';
import { models } from './models/models.js';

function Course() {

    const abortController = new AbortController();
    const signal = {signal: abortController.signal};

    xf.sub(`db:distance`,     onDistance.bind(this), signal);
    xf.sub('db:workout',      onWorkout.bind(this), signal);
    xf.sub('ui:workoutStart', onWatchStart.bind(this), signal);
    xf.sub('ui:watchStart',   onWatchStart.bind(this), signal);
    xf.sub('db:courseIndex',  onCourseIndex.bind(this), signal);

    let started = false;
    let distance = 0;
    let index = 0;
    let maxIndex = 0;
    let courseDistance = 0;
    let r = 0;
    let slope = 0;
    let course;

    let segmentStart = 0;
    let segment = {};

    function isCourse() {
        return exists(course?.points);
    }
    function restore() {
    }
    function onCourseIndex(courseIndex) {
        console.log(`:course :index ${courseIndex}`);
        index = courseIndex;
    }
    function onDistance(value) {
        if(!started) return;

        distance = (parseFloat(value) % courseDistance);

        if((distance - segmentStart) >= r || (segmentStart > distance)) {
            const indexNext = (index + 1) % maxIndex;
            xf.dispatch('course:index', indexNext);

            setSegment(indexNext);

            xf.dispatch(`ui:slope-target-set`, slope);
        }
    }
    function onWorkout(workout) {
        course = workout;

        if(exists(course?.points)) {
            console.log(first(course.points).y);

            setCourse(course);
            setSegment(index);

            xf.dispatch('altitude', first(course.points).y);
        }
    }
    function onWatchStart() {
        if(isCourse()) {
            start();
        }
    }
    function start() {
        if(distance > 0) return;
        started = true;

        // setWorkout
        setCourse(course);
        setSegment(index);
        // r = indexToR(index);
        // slope = indexToSlope(index);

        xf.dispatch(`ui:slope-target-set`, slope);
        xf.dispatch(`ui:mode-set`, 'slope');
        console.log(`start a course ...`);
    }
    function setCourse(course) {
        maxIndex = course.pointsSimplified.length-1;
        courseDistance = course.meta.distance;
    }
    function setSegment(index) {
        segment = indexToSegment(index);
        r = segment.r;
        slope = segment.slope;
        segmentStart = segment.distance ?? distance;
    }
    function indexToSlope(index) {
        return course.pointsSimplified[index].slope;
    }
    function indexToR(index) {
        return course.pointsSimplified[index].r;
    }
    function indexToSegment(index) {
        return course.pointsSimplified[index];
    }

    Object.freeze({
        start,
    });
}

// r = 12;
// slope = -0.4819;
// distance = 7429;

//  0: -1.2,    453, 0,
//  1: -0.4, 	   94, 454,
//  2:  1.2,    104, 548,
//  3:  0.447, 1072, 652,
//  4:  0.133,  299, 1724,
//  5:  0.9,    564, 2023,
//  6:  0.57,  1087, 2587,
//  7:  0.0,    823, 3674,
//  8: -0.7, 	  680, 4497,
//  9: -0.46,	  649, 5177,
// 10: -0.15,   390, 5826,
// 11:  0.0,   1213, 6216,
// 12: -0.4,     83, 7413,
// 13: -3.9,     56, 7512,
// 14: -1.0, 	  220, 7568,
// 15:  0,        0, 7788,

// 1:10, 0.4, 3, ~800

const course = Course();

export { course };
