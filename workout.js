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
        this.elapsed = 0;
        this.lapTime = 0;
        this.laps = [];
        this.started = false;
        this.currentLapStart = 0;
        this.workout = [];
        this.workoutIntervalIndex = 0;
        this.workoutCurrentIntervalDuration = 0;
        this.workoutStarted = false;
        this.progress = 0;
        this.workoutDuration = 0;
        this.init();
    }
    init() {
        let self = this;
        xf.sub('db:workout', e => {
            self.workout = e.detail.data.workout;
        });
    }
    start() {
        let self = this;
        if(self.started) {
            self.pause();
        } else {
            self.interval = setInterval(self.onTick.bind(self), 1000);
            self.started = true;
            xf.dispatch('watch:started');
        }
    }
    lap() {
        let self = this;
        let lap = {start:   self.currentLapStart,
                   end:     self.elapsed,
                   lapTime: (self.elapsed - self.currentLapStart),
                   total:   self.elapsed,};
        self.lapTime = 0;
        self.currentLapStart = self.elapsed;

        if(self.workoutStarted) {
            if(self.workoutIntervalIndex < self.workout.length) {
                self.workoutCurrentIntervalDuration = self.workout[self.workoutIntervalIndex].duration;
                xf.dispatch('watch:nextWorkoutInterval', self.workoutIntervalIndex);

                Object.assign(lap, {power: self.workout[self.workoutIntervalIndex].power});
                console.log(`duration: ${self.workoutCurrentIntervalDuration}`);

                self.workoutIntervalIndex +=1;
                self.lapTime = self.workoutCurrentIntervalDuration;
                xf.dispatch('watch:lapTime', self.workoutCurrentIntervalDuration);
                xf.dispatch('watch:lapTime', 0);
            } else {
                self.workoutStarted = false;
                console.log("Workout Done.");
            }
        }

        self.laps.push();
        xf.dispatch('watch:lap', lap);
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
            self.started = true;
        }
    }
    stop () {
        let self = this;
        clearInterval(self.interval);
        self.elapsed = 0;
        self.lapTime = 0;
        self.started = false;
        xf.dispatch('watch:elapsed', 0);
        xf.dispatch('watch:lapTime', 0);
        xf.dispatch('watch:stopped');
    }

    onTick() {
        let self = this;
        self.elapsed += 1;

        if(self.workoutStarted) {
            self.lapTime -= 1;
        } else {
            self.lapTime += 1;
        }
        xf.dispatch('watch:elapsed', self.elapsed);
        xf.dispatch('watch:lapTime', self.lapTime);
        if((self.workoutStarted) && (self.lapTime === 0)) {
            self.lap();
        }
    }
    setWorkout(workout) {
        let self = this;
        self.workout = workout;
    }
    startWorkout() {
        let self = this;
        self.workoutStarted = true;
        self.workoutIntervalIndex = 0;
        self.workoutCurrentIntervalDuration = self.workout[self.workoutIntervalIndex].duration;
        if(!self.started) {
            self.start();
        }
        self.lap();
    }
}

export { StopWatch };
