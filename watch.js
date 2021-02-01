import { xf } from './xf.js';
import { isSet } from './functions.js';

import { avgOfArray, maxOfArray, sum,
         first, last, round, mps, kph,
         timeDiff, fixInRange } from './functions.js';

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

        this.intervals        = [];
        this.init();
    }
    init() {
        let self = this;
        xf.sub('db:workout',       workout => {
            self.intervals     = workout.intervals;
        });
        xf.sub('db:elapsed',       elapsed => { self.elapsed       = elapsed;           });
        xf.sub('db:lapTime',          time => { self.lapTime       = time;              });
        xf.sub('db:stepTime',         time => { self.stepTime      = time;              });
        xf.sub('db:intervalDuration', time => { self.lapDuration   = time;              });
        xf.sub('db:stepDuration',     time => { self.stepDuration  = time;              });
        xf.sub('db:intervalIndex',   index => { self.intervalIndex = index;             });
        xf.sub('db:stepIndex',       index => { self.stepIndex     = index;             });
        xf.sub('db:watchState',      state => { self.state         = state;             });
        xf.sub('db:workoutState',    state => {
            self.stateWorkout = state;

            if(self.isWorkoutDone()) {
                xf.dispatch('watch:lap');
                console.log(`Workout done!`);
            }
        });
    }
    isStarted()        { return this.state        === 'started'; };
    isPaused()         { return this.state        === 'paused';  };
    isStopped()        { return this.state        === 'stopped'; };
    isWorkoutStarted() { return this.stateWorkout === 'started'; };
    isWorkoutDone()    { return this.stateWorkout === 'done';    };
    start() {
        let self = this;
        if(self.isStarted() && !self.isWorkoutStarted()) {
            self.pause();
        } else {
            self.timer = setInterval(self.onTick.bind(self), 1000);
            xf.dispatch('watch:started');
        }
    }
    startWorkout() {
        let self         = this;
        let intervalTime = self.intervals[0].duration;
        let stepTime     = self.intervals[0].steps[0].duration;

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
        let self = this;

        if(self.isWorkoutStarted()) {
            xf.dispatch('workout:started');
        }
        if(self.isStarted()) {
            self.start();
        }
    }
    resume() {
        let self = this;
        if(!self.isStarted()) {
            self.timer = setInterval(self.onTick.bind(self), 1000);
            xf.dispatch('watch:started');
        }
    }
    pause() {
        let self = this;
        clearInterval(self.timer);
        xf.dispatch('watch:paused');
    }
    stop() {
        let self = this;
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
        let self     = this;
        let elapsed  = self.elapsed + 1;
        let lapTime  = self.lapTime;
        let stepTime = self.stepTime;

        if(self.isWorkoutStarted()) {
            lapTime  -= 1;
            stepTime -= 1;
        } else {
            lapTime  += 1;
        }

        xf.dispatch('watch:elapsed',  elapsed);
        xf.dispatch('watch:lapTime',  lapTime);
        xf.dispatch('watch:stepTime', stepTime);

        if((self.isWorkoutStarted()) && (stepTime <= 0)) {
            self.step();
        }
        // console.log(`lap: ${self.intervalIndex} ${lapTime}, step: ${self.stepIndex} ${stepTime}`);
    }
    lap() {
        let self = this;

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
        let self          = this;
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
        let self             = this;
        let intervalDuration = self.intervalsToDuration(intervals, intervalIndex);
        let stepDuration     = self.intervalsToStepDuration(intervals, intervalIndex, stepIndex);

        self.dispatchInterval(intervalDuration, intervalIndex);
        self.dispatchStep(stepDuration, stepIndex);
    }
    nextStep(intervals, intervalIndex, stepIndex) {
        let self         = this;
        let stepDuration = self.intervalsToStepDuration(intervals, intervalIndex, stepIndex);
        self.dispatchStep(stepDuration, stepIndex);
    }
    intervalsToDuration(intervals, intervalIndex) {
        let duration = intervals[intervalIndex].duration;
        return duration;
    }
    intervalsToStepDuration(intervals, intervalIndex, stepIndex) {
        let steps    = intervals[intervalIndex].steps;
        let duration = steps[stepIndex].duration;
        return duration;
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
}

// Register DB Events
xf.reg('watch:lapDuration',    (time, db) => db.intervalDuration = time);
xf.reg('watch:stepDuration',   (time, db) => db.stepDuration     = time);
xf.reg('watch:lapTime',        (time, db) => db.lapTime          = time);
xf.reg('watch:stepTime',       (time, db) => db.stepTime         = time);
xf.reg('watch:intervalIndex', (index, db) => db.intervalIndex    = index);
xf.reg('watch:stepIndex',     (index, db) => {
    db.stepIndex      = index;
    let intervalIndex = db.intervalIndex;
    let powerTarget   = db.workout.intervals[intervalIndex].steps[index].power;

    // xf.dispatch('ui:power-target-set', powerTarget);     // update just the workout defined
    xf.dispatch('ui:power-target-manual-set', powerTarget); // set both manual and workout defined

    console.log(isSet(db.workout.intervals[intervalIndex].steps[index].slope));
    if(isSet(db.workout.intervals[intervalIndex].steps[index].slope)) {
        let slopeTarget = db.workout.intervals[intervalIndex].steps[index].slope;
        xf.dispatch('ui:slope-target-set', slopeTarget);
    }
});
xf.reg('workout:started', (x, db) => db.workoutState = 'started');
xf.reg('workout:stopped', (x, db) => db.workoutState = 'stopped');
xf.reg('workout:done',    (x, db) => db.workoutState = 'done');
xf.reg('watch:started',   (x, db) => {
    db.watchState = 'started';
    db.lapStartTime = Date.now(); // ??
});
xf.reg('watch:paused',  (x, db) => db.watchState = 'paused');
xf.reg('watch:stopped', (x, db) => db.watchState = 'stopped');
xf.reg('watch:elapsed', (x, db) => {
    db.elapsed = x;
    db.distance  += 1 * mps(db.spd);
    let record = {timestamp: Date.now(),
                  power:     db.pwr,
                  cadence:   db.cad,
                  speed:     db.spd,
                  hr:        db.hr,
                  distance:  db.distance};
    db.records.push(record);
    db.lap.push(record);
});
xf.reg('watch:lap', (x, db) => {
    let timeEnd   = Date.now();
    let timeStart = db.lapStartTime;
    let elapsed   = timeDiff(timeStart, timeEnd);

    if(elapsed > 0) {
        db.laps.push({timestamp:        timeEnd,
                      startTime:        timeStart,
                      totalElapsedTime: elapsed,
                      avgPower:         round(avgOfArray(db.lap, 'power')),
                      maxPower:         maxOfArray(db.lap, 'power')});
    }
    db.lap = [];
    db.lapStartTime = timeEnd + 0;
});

export { Watch };
