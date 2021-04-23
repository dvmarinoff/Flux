import { xf, exists, equals, inRange, fixInRange, prn } from '../functions.js';
import { LocalStorageItem } from '../storage/local-storage.js';
import { IDB } from '../storage/idb.js';

class Model {
    constructor(args) {
        this.prop = args.prop;
        this.default = args.default || this.defaultValue();
        this.prev = args.default;
        this.set = args.set || this.defaultSet;
        this.isValid = args.isValid || this.defaultIsValid;
        this.onInvalid = args.onInvalid || this.defaultOnInvalid;
        this.init();
        this.postInit(args);
    }
    init() { return; }
    postInit() { return; }
    defaultValue() { return ''; }
    defaultIsValid(value) { return exists(value); }
    defaultSet(value) {
        const self = this;
        if(self.isValid(value)) {
            return value;
        } else {
            self.defaultOnInvalid(value);
            return self.default;
        }
    }
    backup() { return; }
    restore() {
        const self = this;
        return self.default;
    }
    defaultOnInvalid(x) {
        const self = this;
        console.error(`Trying to set invalid ${self.prop}.`, x);
    }
}

class Power extends Model {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 2500;
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class HeartRate extends Model {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 255;
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class Cadence extends Model {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 255;
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class Speed extends Model {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 120;
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class Target extends Model {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 100;
        this.step = args.step || 1;
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
    defaultSet(value) {
        const self = this;
        if(isNaN(value)) {
            self.onInvalid();
            return self.default;
        }
        return fixInRange(self.min, self.max, self.parse(value));
    }
    parse(value) { return parseInt(value); }
    inc(value) {
        const self = this;
        const x = value + self.step;
        return self.set(x);
    }
    dec(value) {
        const self = this;
        const x = value - self.step;
        return self.set(x);
    }
}

class PowerTarget extends Target {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 800;
        this.step = args.step || 10;
    }
}

class ResistanceTarget extends Target {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 1000;
        this.step = args.step || 100;
    }
}

class SlopeTarget extends Target {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 45;
        this.step = args.step || 0.5;
    }
    defaultIsValid(value) {
        const self = this;
        return Number.isFloat(value) && inRange(self.min, self.max, value);
    }
    parse(value) { parseFloat(value); }
}

class Mode extends Model {
    postInit(args) {
        this.values = ['erg', 'resistance', 'slope'];
    }
    defaultValue() { return 'erg'; }
    defaultIsValid(value) { this.values.includes(value); }
}

class FTP extends Model {
    postInit(args) {
        const self = this;
        const storageModel = {
            key: self.prop,
            default: self.defaultValue(),
            set: self.set.bind(self)
        };
        self.min = args.min || 0;
        self.max = args.max || 500;
        self.storage = new args.storage(storageModel);
    }
    defaultValue() { return 200; }
    defaultIsValid(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
    backup(value) {
        const self = this;
        self.storage.set(value);
    }
    restore() {
        return self.storage.restore();
    }
}

const power = new Power({prop: 'power'});
const heartRate = new HeartRate({prop: 'heartRate'});
const cadence = new Cadence({prop: 'cadence'});
const speed = new Speed({prop: 'speed'});

const powerTarget = new PowerTarget({prop: 'powerTarget'});
const resistanceTarget = new ResistanceTarget({prop: 'resistanceTarget'});
const slopeTarget = new SlopeTarget({prop: 'slopeTarget'});
const mode = new Mode({prop: 'mode'});

const ftp = new FTP({prop: 'ftp', storage: LocalStorageItem});

let models = { power,
               heartRate,
               cadence,
               speed,
               powerTarget,
               resistanceTarget,
               slopeTarget,
               mode,
               ftp };

export { models };
