import { xf } from './xf.js';
import { parseZwo, intervalsToGraph } from './parser.js';

class Workout {
    constructor(args) {
        this.name = args.name || 'Custom';
        this.type = args.type || 'Custom';
        this.description = args.description || 'A custom workout.';
        this.duration = args.duration || 0;
        this.xml = args.xml || ``;
        this.intervals = args.intervals || [];
        this.ftp = args.ftp || 80;
        this.init();
    }
    init() {
        xf.reg('db:ftp', e => {
            this.ftp = e.details.data.ftp;
        });
    }
    toIntervals(workout, ftp) {
        let intervals = parseZwo(w.xml);
        intervals.forEach( x => x.power = Math.round(ftp * x.power));
        return intervals;
    }
    toGraph(intervals) {
        return intervalsToGraph(intervals);
    }
    fromZwo(xml) {
        let self = this;
    }
}

class StopWatch {
    constructor(args) {
        this.interval = undefined;
        this.elapsed  = 0;           // elapsed time in sec
        this.lapTime  = 0;           // lap count down time
        this.stepTime = 0;           // step count down time
        this.started  = false;       // elapsed timer started
        this.workoutStarted = false; // workout is in progress
        this.workout = [];           // intervals with steps of a workout
        this.workoutLapIndex  = 0;
        this.workoutStepIndex = 0;
        this.workoutCurrentLapDuration  = 0;
        this.workoutCurrentStepDuration = 0;
        this.progress = 0;            // index of current point in workout
        this.workoutDuration = 0;
        this.init();
    }
    init() {
        let self = this;
        xf.sub('db:workout', e => {
            self.workout = e.detail.data.workout.intervals;
            console.log(e.detail.data.workout);
        });
    }
    start() {
        let self = this;
        if(self.started) {
            self.pause();
        } else {
            self.interval = setInterval(self.onTick.bind(self), 1000);
            self.started  = true;
            xf.dispatch('watch:started');
        }
    }
    workoutDone() {
        let self = this;

        self.lapTime        = 0;
        self.stepTime       = 0;
        self.workoutStarted = false;
        xf.dispatch('watch:lap');
        xf.dispatch('watch:lapTime', 0);
        xf.dispatch('watch:stepTime', 0);
        console.log("Workout Done.");
    }
    lap() {
        let self = this;

        if(self.workoutStarted) {
            let l        = self.workoutLapIndex;
            let s        = self.workoutStepIndex;
            let laps     = self.workout;
            let moreLaps = l < (laps.length - 1);

            if(moreLaps) {
                l += 1;
                s  = 0;

                self.workoutLapIndex  = l;
                self.workoutStepIndex = s;

                self.nextLap();
                self.nextStep();
            } else {
                self.workoutDone();
            }
        } else {
            self.lapTime  = 0;
            xf.dispatch('watch:lap');
            xf.dispatch('watch:lapTime', 0);
        }
    }
    nextLap() {
        let self = this;

        let l           = self.workoutLapIndex;
        let laps        = self.workout;
        let lapDuration = laps[l].duration;

        self.workoutCurrentLapDuration = lapDuration;
        self.lapTime = lapDuration;

        xf.dispatch('watch:nextWorkoutInterval', l);
        xf.dispatch('watch:lapTime', lapDuration);
        xf.dispatch('watch:lap');
    }
    nextStep() {
        let self = this;

        let l            = self.workoutLapIndex;
        let s            = self.workoutStepIndex;
        let steps        = self.workout[l].steps;
        let stepDuration = steps[s].duration;

        self.stepTime = stepDuration;
        self.workoutCurrentStepDuration = stepDuration;


        xf.dispatch('watch:nextWorkoutStep', s);
        xf.dispatch('watch:stepTime', stepDuration);
        xf.dispatch('watch:step');
    }
    step() {
        let self = this;

        let l         = self.workoutLapIndex;
        let s         = self.workoutStepIndex;
        let laps      = self.workout;
        let steps     = laps[l].steps;
        let moreLaps  = l < (laps.length  - 1);
        let moreSteps = s < (steps.length - 1);

        if(moreSteps) {
            s += 1;
            self.workoutStepIndex = s;
            self.nextStep();

        } else if (moreLaps) {
            l += 1;
            s  = 0;
            self.workoutLapIndex  = l;
            self.workoutStepIndex = s;

            self.nextLap();
            self.nextStep();

        } else {
            self.workoutStarted = false;
            console.log("Workout Done.");
        }
    }
    pause() {
        let self = this;
        clearInterval(self.interval);
        self.started = false;
        xf.dispatch('watch:paused');
    }
    resume() {
        let self = this;
        if(!self.started) {
            self.interval = setInterval(self.onTick.bind(self), 1000);
            self.started  = true;
        }
    }
    stop () {
        let self = this;
        if(self.started) {
            clearInterval(self.interval);
            self.elapsed = 0;
            self.started = false;
            self.lap();
            self.workoutLapIndex = 0;
            self.workoutStepIndex = 0;
            xf.dispatch('watch:elapsed', 0);
            xf.dispatch('watch:lapTime', 0);
            xf.dispatch('watch:stopped');
        }
    }

    onTick() {
        let self = this;
        self.elapsed += 1;

        if(self.workoutStarted) {
            self.lapTime  -= 1;
            self.stepTime -= 1;
        } else {
            self.lapTime  += 1;
        }
        xf.dispatch('watch:elapsed',  self.elapsed);
        xf.dispatch('watch:lapTime',  self.lapTime);
        xf.dispatch('watch:stepTime', self.stepTime);

        if((self.workoutStarted) && (self.stepTime === 0)) {
            self.step();
        }
    }
    setWorkout(workout) {
        let self = this;
        self.workout = workout;
    }
    startWorkout() {
        let self = this;
        self.workoutStarted = true;

        self.workoutLapIndex = 0;
        self.workoutStepIndex = 0;
        self.workoutCurrentLapDuration  = self.workout[0].duration;
        self.workoutCurrentStepDuration = self.workout[0].steps[0].duration;

        self.lapTime  = self.workout[0].duration;
        self.stepTime = self.workout[0].steps[0].duration;

        xf.dispatch('watch:nextWorkoutInterval', 0);
        xf.dispatch('watch:nextWorkoutStep', 0);

        if(!self.started) {
            self.start();
        }
    }
}

export { StopWatch };
