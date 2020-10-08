import { xf } from './xf.js';

let data =
    [
        {repeat: 1, steps: [{duration: 3, target: 100}]},
        {repeat: 3, steps: [{duration: 6, target: 235}, {duration: 3, target: 100}]},
        {repeat: 1, steps: [{duration: 3, target: 100}]},
    ];

class StopWatch {
    constructor(args) {
        this.interval = undefined;
        this.elapsed = 0;
        this.lapTime = 0;
        this.laps = [];
        this.currentLapStart = 0;
    }
    start() {
        let self = this;
        self.interval = setInterval(self.onInterval.bind(self), 1000);
    }
    lap() {
        let self = this;
        self.lapTime = 0;
        self.laps.push({start:   self.currentLapStart,
                        end:     self.elapsed,
                        lapTime: (self.elapsed - self.currentLapStart),
                        total:   self.elapsed});
        self.currentLapStart = self.elapsed;
        xf.dispatch('workout:interval', 0);
    }
    pause() {
        let self = this;
        clearInterval(self.interval);
    }
    resume() {
        let self = this;
        self.interval = setInterval(self.onInterval.bind(self), 1000);
    }
    stop () {
        let self = this;
        clearInterval(self.interval);
        this.elapsed = 0;
        self.lapTime = 0;
        xf.dispatch('workout:elapsed', 0);
        xf.dispatch('workout:interval', 0);
    }
    onInterval() {
        let self = this;
        self.elapsed += 1;
        self.lapTime += 1;
        xf.dispatch('workout:elapsed',  self.elapsed);
        xf.dispatch('workout:interval', self.lapTime);
    }
}

export { StopWatch };
