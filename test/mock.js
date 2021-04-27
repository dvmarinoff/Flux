import { first, last, xf, rand, } from '../src/functions.js';




class TrainerMock {
    constructor() {
    }
    run() {
        this.interval = this.broadcast(this.indoorBikeData.bind(this));
    }
    stop() {
        clearInterval(this.interval);
    }
    broadcast(handler) {
        const interval = setInterval(handler, 1000);
        return interval;
    }
    indoorBikeData() {
        xf.dispatch('power', this.power(180));
        xf.dispatch('speed', this.speed(20));
        xf.dispatch('cadence', this.cadence(80));
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
// tm.run();

export { TrainerMock };
