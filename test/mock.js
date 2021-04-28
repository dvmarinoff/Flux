import { first, last, xf, rand, } from '../src/functions.js';

class TrainerMock {
    constructor() {
        this.powerTarget = 180;
        this.init();
    }
    init() {
        const self = this;

        xf.sub('db:powerTarget', self.onPowerTarget.bind(self));
        xf.sub('ui:workoutStart', self.run.bind(self));
        xf.sub('ui:watchPause', self.stop.bind(self));
    }
    run() {
        const self = this;
        self.interval = self.broadcast(self.indoorBikeData.bind(self));
    }
    stop() {
        const self = this;
        clearInterval(self.interval);
    }
    broadcast(handler) {
        const interval = setInterval(handler, 1000);
        return interval;
    }
    indoorBikeData() {
        const self = this;
        xf.dispatch('power', self.power(self.powerTarget));
        xf.dispatch('speed', self.speed(20));
        xf.dispatch('cadence', self.cadence(80));
    }
    onPowerTarget(powerTarget) {
        this.powerTarget = powerTarget;
    }
    power(prev) {
        return prev + rand(-4, 4);
    }
    cadence(prev) {
        return prev + rand(-3, 3);
    }
    speed(prev) {
        return prev + rand(-0.1, 0.1);
    }
}

const tm = new TrainerMock();

export { TrainerMock };
