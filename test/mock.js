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

        self.id = 'ble:controllable';
        self.name = 'Tacx Flux 46731';

        xf.dispatch(`${self.id}:connected`);
        xf.dispatch(`${self.id}:name`, self.name);

        self.hrId = 'ble:hrm';
        self.hrName = 'Tacx HRB 20483';

        xf.dispatch(`${self.hrId}:connected`);
        xf.dispatch(`${self.hrId}:name`, self.hrName);

        console.warn('Trainer Mock Data is ON!');
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
        const interval = setInterval(handler, 500);
        return interval;
    }
    indoorBikeData() {
        const self = this;
        xf.dispatch('power', self.power(self.powerTarget));
        xf.dispatch('speed', self.speed(20));
        xf.dispatch('cadence', self.cadence(80));
        xf.dispatch('heartRate', self.heartRate(163));
    }
    onPowerTarget(powerTarget) {
        this.powerTarget = powerTarget;
    }
    power(prev) {
        let low = rand(1,100);
        if(low === 90) {
            return 0;
        }
        return prev + rand(-8, 8);
    }
    cadence(prev) {
        return prev + rand(0, 1);
    }
    speed(prev) {
        return prev + rand(-0.1, 0.1);
    }
    heartRate(prev) {
        return prev + rand(2, 2);
    }
}

const tm = new TrainerMock();

export { TrainerMock };
