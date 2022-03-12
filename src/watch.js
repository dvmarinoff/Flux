import { equals, exists, existance, first, last, xf, avg, max } from './functions.js';
import { kphToMps, mpsToKph, timeDiff } from './utils.js';
import { models } from './models/models.js';

class Watch {
    constructor(args) {
        this.elapsed          = 0;
        this.lapTime          = 0;
        this.stepTime         = 0;

        this.intervalIndex    = 0;
        this.stepIndex        = 0;
        this.intervalDuration = 0;
        this.stepDuration     = 0;

        this.state            = 'stopped';
        this.stateWorkout     = 'stopped';

        // Distance
        this.distance          = 0;
        this.positionLapStart  = 0;
        this.positionStepStart = 0;
        this.lapPosition       = 0;
        this.stepPosition      = 0;
        this.lapDistance       = 0;
        this.stepDistance      = 0;
        this.distanceTarget    = undefined;
        this.intervalType      = 'duration';
        // end Distance

        this.intervals        = [];
        this.init();
    }
    init() {
        const self = this;
        xf.sub('db:workout',       workout => { self.intervals     = workout.intervals; });
        xf.sub('db:elapsed',       elapsed => { self.elapsed       = elapsed; });
        xf.sub('db:lapTime',          time => { self.lapTime       = time; });
        xf.sub('db:stepTime',         time => { self.stepTime      = time; });
        xf.sub('db:intervalDuration', time => { self.lapDuration   = time; });
        xf.sub('db:stepDuration',     time => { self.stepDuration  = time; });
        xf.sub('db:intervalIndex',   index => { self.intervalIndex = index; });
        xf.sub('db:stepIndex',       index => { self.stepIndex     = index; });
        xf.sub('db:watchStatus',     state => { self.state         = state; });
        xf.sub('db:workoutStatus',   state => {
            self.stateWorkout = state;

            if(self.isWorkoutDone()) {
                xf.dispatch('watch:lap');
                console.log(`Workout done!`);
            }
        });

        xf.sub('db:distance', this.onDistance.bind(this));
        xf.sub('db:lapDistance',  distance => self.lapDistance = distance);
        xf.sub('db:stepDistance', distance => self.stepDistance = distance);
    }
    isStarted()        { return this.state        === 'started'; };
    isPaused()         { return this.state        === 'paused'; };
    isStopped()        { return this.state        === 'stopped'; };
    isWorkoutStarted() { return this.stateWorkout === 'started'; };
    isWorkoutDone()    { return this.stateWorkout === 'done'; };
    isIntervalType(type) {
        return equals(this.intervalType, type);
    }
    start() {
        const self = this;
        if(self.isStarted() && !self.isWorkoutStarted()) {
            self.pause();
        } else {
            self.timer = setInterval(self.onTick.bind(self), 1000);
            xf.dispatch('watch:started');
        }
    }
    startWorkout() {
        const self         = this;

        let intervalTime = 0;
        let stepTime     = 0;

        if(exists(self.intervals[0].duration)) {
            intervalTime = self.intervals[0].duration ?? 0;
            stepTime     = self.intervals[0].steps[0].duration ?? 0;
        }

        if(exists(self.intervals[0].distance)) {
            let intervalDistance = 0;
            let stepDistance     = 0;
            intervalDistance  = self.intervals[0].distance ?? 0;
            stepDistance      = self.intervals[0].steps[0].distance ?? 0;
            self.intervalType = 'distance';

            xf.dispatch('watch:lapDistance',  intervalDistance);
            xf.dispatch('watch:stepDistance', stepDistance);
            xf.dispatch('watch:lapPosition',  0);
            xf.dispatch('watch:stepPosition', 0);
        }

        xf.dispatch('workout:started');

        xf.dispatch('watch:intervalDuration', intervalTime);
        xf.dispatch('watch:stepDuration',     stepTime);
        xf.dispatch('watch:lapTime',          intervalTime);
        xf.dispatch('watch:stepTime',         stepTime);

        xf.dispatch('watch:intervalIndex',  0);
        xf.dispatch('watch:stepIndex', 0);

        if(!self.isStarted()) {
            self.start();
        }
    }
    restoreWorkout() {
        const self = this;

        if(self.isWorkoutStarted()) {
            xf.dispatch('workout:started');
        }
        if(self.isStarted()) {
            self.start();
        }
    }
    resume() {
        const self = this;
        if(!self.isStarted()) {
            self.timer = setInterval(self.onTick.bind(self), 1000);
            xf.dispatch('watch:started');
        }
    }
    pause() {
        const self = this;
        clearInterval(self.timer);
        xf.dispatch('watch:paused');
    }
    stop() {
        const self = this;
        if(self.isStarted() || self.isPaused()) {
            clearInterval(self.timer);

            xf.dispatch('watch:stopped');

            if(self.isWorkoutStarted()) {
                xf.dispatch('workout:stopped');
            }

            self.lap();

            xf.dispatch('watch:intervalIndex', 0);
            xf.dispatch('watch:stepIndex',     0);
            xf.dispatch('watch:elapsed',       0);
            xf.dispatch('watch:lapTime',       0);
        }
    }
    onTick() {
        const self   = this;
        let elapsed  = self.elapsed + 1;
        let lapTime  = self.lapTime;
        let stepTime = self.stepTime;

        if(self.isWorkoutStarted() && !equals(self.stepTime, 0)) {
            lapTime  -= 1;
            stepTime -= 1;
        } else {
            lapTime  += 1;
        }

        xf.dispatch('watch:elapsed',  elapsed);
        xf.dispatch('watch:lapTime',  lapTime);
        xf.dispatch('watch:stepTime', stepTime);

        if(self.isWorkoutStarted() &&
           (stepTime <= 0) &&
            this.isIntervalType('duration')) {
            self.step();
        }
    }
    lap() {
        const self = this;

        if(self.isWorkoutStarted()) {
            let i             = self.intervalIndex;
            let s             = self.stepIndex;
            let intervals     = self.intervals;
            let moreIntervals = i < (intervals.length - 1);

            if(moreIntervals) {
                i += 1;
                s  = 0;

                self.nextInterval(intervals, i, s);
                self.nextStep(intervals, i, s);
            } else {
                xf.dispatch('workout:done');
            }
        } else {
            xf.dispatch('watch:lap');
            xf.dispatch('watch:lapTime', 0);
        }
    }
    step() {
        const self        = this;
        let i             = self.intervalIndex;
        let s             = self.stepIndex;
        let intervals     = self.intervals;
        let steps         = intervals[i].steps;
        let moreIntervals = i < (intervals.length  - 1);
        let moreSteps     = s < (steps.length - 1);

        if(moreSteps) {
            s += 1;
            self.nextStep(intervals, i, s);
        } else if (moreIntervals) {
            i += 1;
            s  = 0;

            self.nextInterval(intervals, i, s);
            self.nextStep(intervals, i, s);
        } else {
            xf.dispatch('workout:done');
        }
    }
    nextInterval(intervals, intervalIndex, stepIndex) {
        if(exists(intervals[intervalIndex].duration)) {
            return this.nextDurationInterval(intervals, intervalIndex, stepIndex);
        }
        if(exists(intervals[intervalIndex].distance)) {
            return this.nextDistanceInterval(intervals, intervalIndex, stepIndex);
        }
    }
    nextStep(intervals, intervalIndex, stepIndex) {
        if(this.isDurationStep(intervals, intervalIndex, stepIndex)) {
            this.intervalType = 'duration';
            return this.nextDurationStep(intervals, intervalIndex, stepIndex);
        }
        if(this.isDistanceStep(intervals, intervalIndex, stepIndex)) {
            this.intervalType = 'distance';
            return this.nextDistanceStep(intervals, intervalIndex, stepIndex);
        }
    }

    isDurationStep(intervals, intervalIndex, stepIndex) {
        return exists(intervals[intervalIndex].steps[stepIndex].duration);
    }
    nextDurationInterval(intervals, intervalIndex, stepIndex) {
        const intervalDuration = this.intervalsToDuration(intervals, intervalIndex);
        const stepDuration     = this.intervalsToStepDuration(intervals, intervalIndex, stepIndex);
        this.dispatchInterval(intervalDuration, intervalIndex);
    }
    nextDurationStep(intervals, intervalIndex, stepIndex) {
        const stepDuration = this.intervalsToStepDuration(intervals, intervalIndex, stepIndex);
        this.dispatchStep(stepDuration, stepIndex);
    }
    intervalsToDuration(intervals, intervalIndex) {
        return intervals[intervalIndex].duration;
    }
    intervalsToStepDuration(intervals, intervalIndex, stepIndex) {
        const steps = intervals[intervalIndex].steps;
        return steps[stepIndex].duration;
    }
    dispatchInterval(intervalDuration, intervalIndex) {
        xf.dispatch('watch:intervalDuration', intervalDuration);
        xf.dispatch('watch:lapTime',          intervalDuration);
        xf.dispatch('watch:intervalIndex',    intervalIndex);
        xf.dispatch('watch:lap');
    }
    dispatchStep(stepDuration, stepIndex) {
        xf.dispatch('watch:stepDuration', stepDuration);
        xf.dispatch('watch:stepTime',     stepDuration);
        xf.dispatch('watch:stepIndex',    stepIndex);
        xf.dispatch('watch:step');
    }

    // Distance
    onDistance(distance) {
        const self = this;
        this.distance = distance;

        if(this.isWorkoutStarted() && this.isIntervalType('distance')) {

            this.lapPosition  = (this.distance - this.positionLapStart);
            this.stepPosition = (this.distance - this.positionStepStart);

            xf.dispatch('watch:lapPosition',  this.lapPosition);
            xf.dispatch('watch:stepPosition', this.stepPosition);

            console.info({
                // intervalIndex: self.intervalIndex,
                stepIndex: self.stepIndex,
                distance: self.distance,
                lapPosition: self.lapPosition,
                lapDistance: self.lapDistance,
                stepPosition: self.stepPosition,
                stepDistance: self.stepDistance,
            });

            if(this.distanceReached()) {
                this.step();
            }
        }
    }
    distanceReached() {
        if(this.stepPosition >= this.stepDistance && this.isIntervalType('distance')) {
            console.log(`${this.distance - this.positionStepStart}`);
            return true;
        } else {
            return false;
        }
    }
    isDistanceInterval(intervals, intervalIndex,) {
        return exists(intervals[intervalIndex].distance);
    }
    isDistanceStep(intervals, intervalIndex, stepIndex) {
        return exists(intervals[intervalIndex].steps[stepIndex].distance);
    }
    nextDistanceInterval(intervals, intervalIndex, stepIndex) {
        const intervalDistance = intervals[intervalIndex].distance;
        const stepDuration     = intervals[intervalIndex].steps[stepIndex].distance;
        this.dispatchDistanceInterval(intervalDistance, intervalIndex);
    }
    nextDistanceStep(intervals, intervalIndex, stepIndex) {
        let stepDistance = intervals[intervalIndex].steps[stepIndex].distance;
        this.dispatchDistanceStep(stepDistance, stepIndex);
    }
    dispatchDistanceInterval(intervalDistance, intervalIndex) {
        this.positionLapStart = this.distance;
        xf.dispatch('watch:intervalDistance', intervalDistance);
        xf.dispatch('watch:lapTime',          0);
        xf.dispatch('watch:lapDistance',      intervalDistance);
        xf.dispatch('watch:intervalIndex',    intervalIndex);
        xf.dispatch('watch:lap');
    }
    dispatchDistanceStep(stepDistance, stepIndex) {
        this.distanceTarget = stepDistance;
        stepDistance = stepDistance - ((this.distance - this.positionStepStart) - this.stepDistance);
        this.positionStepStart = this.distance;
        xf.dispatch('watch:stepDistance', stepDistance);
        xf.dispatch('watch:stepIndex',    stepIndex);
        xf.dispatch('watch:step');
    }
    // end Distance
}


// Distance
xf.reg('watch:lapDistance',  (distance, db) => db.lapDistance  = distance);
xf.reg('watch:stepDistance', (distance, db) => db.stepDistance = distance);
xf.reg('watch:lapPosition',  (position, db) => db.lapPosition  = position);
xf.reg('watch:stepPosition', (position, db) => db.stepPosition = position);
// end Distance

// Register DB Events
xf.reg('watch:lapDuration',    (time, db) => db.intervalDuration = time);
xf.reg('watch:stepDuration',   (time, db) => db.stepDuration     = time);
xf.reg('watch:lapTime',        (time, db) => db.lapTime          = time);
xf.reg('watch:stepTime',       (time, db) => db.stepTime         = time);
xf.reg('watch:intervalIndex', (index, db) => db.intervalIndex    = index);
xf.reg('watch:stepIndex',     (index, db) => {
    db.stepIndex         = index;
    const intervalIndex  = db.intervalIndex;
    const powerTarget    = db.workout.intervals[intervalIndex].steps[index].power;
    const slopeTarget    = db.workout.intervals[intervalIndex].steps[index].slope;
    const cadenceTarget  = db.workout.intervals[intervalIndex].steps[index].cadence;
    const distanceTarget = db.workout.intervals[intervalIndex].steps[index].distance;

    if(exists(slopeTarget)) {
        xf.dispatch('ui:slope-target-set', slopeTarget);
        if(!equals(db.mode, 'slope')) {
            xf.dispatch('ui:mode-set', 'slope');
        }
    }
    if(exists(distanceTarget)) {
        xf.dispatch('ui:distance-target-set', distanceTarget);
    }
    if(exists(cadenceTarget)) {
        xf.dispatch('ui:cadence-target-set', cadenceTarget);
    } else {
        xf.dispatch('ui:cadence-target-set', 0);
    }
    if(exists(powerTarget)) {
        xf.dispatch('ui:power-target-set', models.ftp.toAbsolute(powerTarget, db.ftp));
        if(!exists(slopeTarget) && !equals(db.mode, 'erg')) {
            xf.dispatch('ui:mode-set', 'erg');
        }
    } else {
        xf.dispatch('ui:power-target-set', 0);
    }
});
xf.reg('workout:started', (x, db) => db.workoutStatus = 'started');
xf.reg('workout:stopped', (x, db) => db.workoutStatus = 'stopped');
xf.reg('workout:done',    (x, db) => db.workoutStatus = 'done');
xf.reg('watch:started',   (x, db) => {
    db.watchStatus = 'started';
    if(db.lapStartTime === false) {
        db.lapStartTime = Date.now(); // if first lap
    }
});
xf.reg('watch:paused',  (x, db) => db.watchStatus = 'paused');
xf.reg('watch:stopped', (x, db) => db.watchStatus = 'stopped');

xf.reg('watch:elapsed', (x, db) => {
    db.elapsed   = x;

    let record = {
        timestamp:  Date.now(),
        power:      db.power1s,
        cadence:    db.cadence,
        speed:      db.speedVirtual,
        heart_rate: db.heartRate,
        distance:   db.distance,
        grade:      db.slopeTarget,
        altitude:   db.altitude,
    };

    db.records.push(record);
    db.lap.push(record);

    if(equals(db.elapsed % 60, 0)) {
        models.session.backup(db);
        console.log(`backing up of ${db.records.length} records ...`);
    }
});
xf.reg('watch:lap', (x, db) => {
    let timeEnd   = Date.now();
    let timeStart = db.lapStartTime;
    let elapsed   = timeDiff(timeStart, timeEnd);

    if(elapsed > 0) {
        db.laps.push({
            timestamp:        timeEnd,
            startTime:        timeStart,
            totalElapsedTime: elapsed,
            avgPower:         db.powerLap,
            maxPower:         max(db.lap, 'power'),
            avgCadence:       Math.round(avg(db.lap, 'cadence')),
            avgHeartRate:     Math.round(avg(db.lap, 'heart_rate')),
        });
        db.lap = [];
    }
    db.lapStartTime = timeEnd + 0;
});

const watch = new Watch();

xf.sub('ui:workoutStart', e => { watch.startWorkout();   });
xf.sub('ui:watchStart',   e => { watch.start();          });
xf.sub('workout:restore', e => { watch.restoreWorkout(); });
xf.sub('ui:watchPause',   e => { watch.pause();          });
xf.sub('ui:watchResume',  e => { watch.resume();         });
xf.sub('ui:watchLap',     e => { watch.lap();            });
xf.sub('ui:watchStop',    e => {
    const stop = confirm('Confirm Stop?');
    if(stop) {
        watch.stop();
    }
});

export { watch };
