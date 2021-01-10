import { xf } from './xf.js';

class Watch {
    constructor(args) {
        this.elapsed   = 0;
        this.lapTime   = 0;

        this.lapIndex  = 0;
        this.stepIndex = 0;

        this.state        = 'stopped';
        this.stateWorkout = 'stopped';

        this.intervals = [];
        this.init();
    }
    init() {
        let self = this;
        xf.sub('db:workout',    workout => { self.intervals    = workout.intervals; });
        xf.sub('db:elapsed',    elapsed => { self.elapsed      = elapsed;           });
        xf.sub('db:watchState',   state => { self.state        = state;             });
        xf.sub('db:workoutState', state => { self.workoutState = state;             });
        xf.sub('db:lapTime',       time => { self.lapTime      = time;              });
        xf.sub('db:stepTime',      time => { self.stepTime     = time;              });
        xf.sub('db:lapDuration',   time => { self.lapDuration  = time;              });
        xf.sub('db:stepDuration',  time => { self.stepDuration = time;              });
        xf.sub('db:lapIndex',     index => { self.lapIndex     = index;             });
        xf.sub('db:stepIndex',    index => { self.stepIndex    = index;             });
    }
    isStarted()        { return this.state        === 'started'; };
    isPaused()         { return this.state        === 'paused';  };
    isStopped()        { return this.state        === 'stopped'; };
    isWorkoutStarted() { return this.stateWorkout === 'started'; };
    isWorkoutDone()    { return this.stateWorkout === 'done';    };
    onTick() {
        let self     = this;
        let elapsed  = self.elapsed+1;
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

        if((self.isWorkoutStarted()) && (stepTime === 0)) {
            self.step();
        }
    }
    start() {
        let self = this;
        if(self.isStarted()) {
            self.pause();
        } else {
            self.timer = setInterval(self.onTick.bind(self), 1000);
            xf.dispatch('watch:started');
        }
    }
    startWorkout() {
        let self     = this;
        let lapTime  = self.intervals[0].duration;
        let stepTime = self.intervals[0].steps[0].duration;

        xf.dispatch('workout:started');

        xf.dispatch('workout:lapDuration', lapTime);
        xf.dispatch('workout:stepDuration', stepTime);
        xf.dispatch('watch:lapTime',  lapTime);
        xf.dispatch('watch:stepTime', stepTime);

        xf.dispatch('workout:lapIndex', 0);
        xf.dispatch('workout:stepIndex', 0);

        if(!self.started) {
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
        if(self.isStarted()) {
            clearInterval(self.timer);

            xf.dispatch('watch:stopped');

            self.lap();

            xf.dispatch('watch:lapIndex',  0);
            xf.dispatch('watch:stepIndex', 0);
            xf.dispatch('watch:elapsed',   0);
            xf.dispatch('watch:lapTime',   0);
        }
    }
    lap() {
        let self = this;

        if(self.isWorkoutStarted()) {
            let l        = self.workoutLapIndex;
            let s        = self.workoutStepIndex;
            let laps     = self.intervals;
            let moreLaps = l < (laps.length - 1);

            if(moreLaps) {
                l += 1;
                s  = 0;

                self.nextLap(l, s);
                self.nextStep(l, s);
            } else {
                self.workoutDone();
            }
        } else {
            xf.dispatch('watch:lap');
            xf.dispatch('watch:lapTime', 0);
        }
    }
    nextLap(lapIndex, stepIndex) {
        let self        = this;
        let l           = lapIndex;
        let laps        = self.intervals;
        let lapDuration = laps[l].duration;

        xf.dispatch('workout:lapDuration', lapDuration);
        xf.dispatch('watch:lapTime',       lapDuration);
        xf.dispatch('workout:lapIndex',    l);
        xf.dispatch('watch:lap');
    }
    nextStep(lapIndex, stepIndex) {
        let self         = this;
        let l            = lapIndex;
        let s            = stepIndex;
        let steps        = self.intervals[l].steps;
        let stepDuration = steps[s].duration;

        xf.dispatch('workout:stepDuration', stepDuration);
        xf.dispatch('workout:stepTime',     stepDuration);
        xf.dispatch('workout:stepIndex',    s);
        xf.dispatch('workout:step');
    }
    step() {
        let self      = this;
        let l         = self.lapIndex;
        let s         = self.stepIndex;
        let laps      = self.intervals;
        let steps     = laps[l].steps;
        let moreLaps  = l < (laps.length  - 1);
        let moreSteps = s < (steps.length - 1);

        if(moreSteps) {
            s += 1;
            self.nextStep(l, s);
        } else if (moreLaps) {
            l += 1;
            s  = 0;

            self.nextLap(l, s);
            self.nextStep(l, s);
        } else {
            xf.dispatch('workout:stopped');
            console.log("Workout Done.");
        }
    }
}

export { Watch };
