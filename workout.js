import { xf } from './xf.js';

function readWarmup(el) {
    let duration  = parseInt(el.getAttribute('Duration'));
    let powerLow  = parseFloat(el.getAttribute('PowerLow'));
    let powerHigh = parseFloat(el.getAttribute('PowerHigh'));
    return {tag: 'Warmup',
            duration:  duration,
            powerLow:  powerLow,
            powerHigh: powerHigh};
}
function readIntervalsT(el) {
    let onDuration  = parseInt(el.getAttribute('OnDuration'));
    let offDuration = parseInt(el.getAttribute('OffDuration'));
    let repeat      = parseInt(el.getAttribute('Repeat'));
    let duration    = (onDuration + offDuration) * repeat;
    let onPower     = parseFloat(el.getAttribute('OnPower'));
    let offPower    = parseFloat(el.getAttribute('OffPower'));
    return {tag: 'IntervalsT',
            repeat: repeat,
            onDuration:  onDuration,
            offDuration: offDuration,
            onPower:     onPower,
            offPower:    offPower};
}
function readSteadyState(el) {
    let duration = parseInt(el.getAttribute('Duration'));
    let power    = parseFloat(el.getAttribute('Power'));
    return {tag: 'SteadyState',
            duration: duration,
            power:    power};
}
function readCooldown(el) {
    let duration  = parseInt(el.getAttribute('Duration'));
    let powerLow  = parseFloat(el.getAttribute('PowerLow'));
    let powerHigh = parseFloat(el.getAttribute('PowerHigh'));
    return {tag: 'Cooldown',
            duration:  duration,
            powerLow:  powerLow,
            powerHigh: powerHigh};
}

function readZwoElement(el) {
    switch(el.tagName) {
    case 'Warmup': return readWarmup(el);
        break;
    case 'IntervalsT': return readIntervalsT(el);
        break;
    case 'SteadyState': return readSteadyState(el);
        break;
    case 'Cooldown': return readCooldown(el);
        break;
    }
}

function toDecimalPoint (x, point = 2) {
    return Number((x).toFixed(point));
}

function warmupToInterval(step) {
    let intervals = [];
    let powerDx = 0.01;
    let steps = Math.round((step.powerHigh-step.powerLow) / powerDx);
    let durationDx = Math.round(step.duration/steps);
    let power = step.powerLow;
    for(let i = 0; i < steps + 1; i++) {
        intervals.push({duration: durationDx, power: power});
        power = toDecimalPoint(power + powerDx);
    };
    return intervals;
}
function intervalsTToInterval(step) {
    let intervals = [];
    for(let i = 0; i < step.repeat; i++) {
        intervals.push({duration: step.onDuration, power: step.onPower});
        intervals.push({duration: step.offDuration, power: step.offPower});
    };
    return intervals;
}
function steadyStateToInterval(step) {
    return {duration: step.duration,
            power:    step.power};
}
function cooldownToInterval(step) {
    let intervals = [];
    let powerDx = 0.01;
    let steps = Math.round((step.powerHigh-step.powerLow) / powerDx);
    let durationDx = Math.round(step.duration/steps);
    let power = step.powerHigh;
    for(let i = 0; i < steps + 1; i++) {
        intervals.push({duration: durationDx, power: power});
        power = toDecimalPoint(power - powerDx);
    };
    return intervals;
}

function stepToInterval(step) {
    switch(step.tag) {
    case 'Warmup': return warmupToInterval(step);
        break;
    case 'IntervalsT': return intervalsTToInterval(step);
        break;
    case 'SteadyState': return steadyStateToInterval(step);
        break;
    case 'Cooldown': return cooldownToInterval(step);
        break;
    }
}

function zwoToIntervals(zwo) {
    let intervals = zwo.flatMap(step => stepToInterval(step));
    return intervals;
}

function parseZwo(zwo) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(zwo, 'text/xml');

    let workoutEl = doc.querySelector('workout');
    let elements = Array.from(workoutEl.children);

    let steps = elements.reduce((acc, el) => {
        acc.push(readZwoElement(el));
        return acc;
    }, []);

    let intervals = steps.flatMap(step => stepToInterval(step));

    return intervals;
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
        }
        self.started = true;
    }
    lap() {
        let self = this;
        let lap = {start:   self.currentLapStart,
                   end:     self.elapsed,
                   lapTime: (self.elapsed - self.currentLapStart),
                   total:   self.elapsed,};
        self.lapTime = 0;
        self.currentLapStart = self.elapsed;

        if(self.workoutStarted &&  self.workoutIntervalIndex < self.workout.length) {
            self.workoutCurrentIntervalDuration = self.workout[self.workoutIntervalIndex].duration;
            xf.dispatch('watch:nextWorkoutInterval', self.workoutIntervalIndex);
            self.workoutIntervalIndex +=1;

            Object.assign(lap, {power: self.workout[self.workoutIntervalIndex].power});
        }

        if(self.workoutIntervalIndex >= self.workout.length && self.workoutStarted) {
            console.log("Workout Done.");
        }

        self.laps.push();
        xf.dispatch('watch:interval', 0);
        xf.dispatch('watch:lap', lap);
    }
    pause() {
        let self = this;
        clearInterval(self.interval);
        self.started = false;
    }
    resume() {
        let self = this;
        self.interval = setInterval(self.onTick.bind(self), 1000);
    }
    stop () {
        let self = this;
        clearInterval(self.interval);
        self.elapsed = 0;
        self.lapTime = 0;
        self.started = false;
        xf.dispatch('watch:elapsed', 0);
        xf.dispatch('watch:interval', 0);
    }
    onTick() {
        let self = this;
        self.elapsed += 1;
        self.lapTime += 1;
        xf.dispatch('watch:elapsed',  self.elapsed);
        xf.dispatch('watch:interval', self.lapTime);
        if((self.workoutStarted) && (self.lapTime === self.workoutCurrentIntervalDuration)) {
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

export { StopWatch, parseZwo };
