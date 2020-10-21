import { xf } from './xf.js';

class Workout {
    constructor() {}
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

        if(self.workoutStarted && self.workoutIntervalIndex < self.workout.length) {
            self.workoutCurrentIntervalDuration = self.workout[self.workoutIntervalIndex].duration;
            xf.dispatch('watch:nextWorkoutInterval', self.workoutIntervalIndex);
            self.workoutIntervalIndex +=1;

            Object.assign(lap, {power: self.workout[self.workoutIntervalIndex].power});

            console.log(self.workoutCurrentIntervalDuration);
            xf.dispatch('watch:interval', self.workoutCurrentIntervalDuration);
            self.lapTime = self.workoutCurrentIntervalDuration;
        } else {

            xf.dispatch('watch:interval', 0);
        }

        if(self.workoutIntervalIndex >= self.workout.length && self.workoutStarted) {
            console.log("Workout Done.");
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
        xf.dispatch('watch:interval', 0);
        xf.dispatch('watch:stopped');
    }
    onTick() {
        let self = this;
        self.elapsed += 1;
        // if((self.workoutStarted) && (self.lapTime === self.workoutCurrentIntervalDuration)) {
        //     self.lap();
        // }
        if(self.workoutStarted) {
            self.lapTime -= 1;
        } else {
            self.lapTime += 1;
        }
        if((self.workoutStarted) && (self.lapTime === 0)) {
            self.lap();
        } else {
        }
        xf.dispatch('watch:elapsed',  self.elapsed);
        xf.dispatch('watch:interval', self.lapTime);
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
