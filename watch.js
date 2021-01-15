import { xf } from './xf.js';

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
        xf.sub('db:workout',       workout => { self.intervals     = workout.intervals; });
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

export { Watch };
