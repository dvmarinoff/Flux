import { xf, exists, equals, inRange, fixInRange, prn } from '../functions.js';
import { LocalStorageItem } from './storage/local-storage.js';
import { IDBStore } from './storage/idb.js';

class Model {
    constructor(args) {
        this.prop = args.prop;
        this.default = args.default || this.defaultValue();
        this.prev = args.default;
        this.validate = args.validate || this.defaultValidate();
        this.onInvalid = args.onInvalid || this.defaultOnInvalid();
        this.init();
        this.postInit(args);
    }
    init() {
        const self = this;
    }
    postInit() { return; }
    defaultValue() { return ''; }
    defaultValidate(value) { return exists(value); }
    save() { return; }
    restore() {
        const self = this;
        return self.default;
    }
    defaultOnInvalid(x) {
        const self = this;
        console.log(`Trying to write invalid ${self.prop}.`, x);
    }
}

class Power extends Model {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 2500;
    }
    defaultValue() { return 0; }
    defaultValidate(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class HeartRate extends Model {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 255;
    }
    defaultValue() { return 0; }
    defaultValidate(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class PowerTarget extends Model {
    postInit(args) {
        this.min = args.min || 0;
        this.max = args.max || 800;
    }
    defaultValue() { return 0; }
    defaultValidate(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
    toValue(value) {
        const self = this;
        if(isNaN(value)) {
            self.onInvalid(); return self.default;
        }
        return fixInRange(self.min, self.max, parseInt(value));
    }
}

class FTP extends Model {
    postInit(args) {
        const self = this;
        const storageModel = {
            key: self.prop,
            default: self.defaultValue(),
            validate: self.validate.bind(self)
        };
        self.min = args.min || 0;
        self.max = args.max || 500;
        self.storage = new args.storage(storageModel);
    }
    defaultValue() { return 200; }
    defaultValidate(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
    save(value) {
        const self = this;
        self.storage.set(value);
    }
    restore() {
        return self.storage.restore();
    }
}

const power = new Power({prop: 'power'});
const heartRate = new HeartRate({prop: 'heartRate'});

const powerTarget = new PowerTarget({prop: 'powerTarget'});

const ftp = new FTP({prop: 'ftp', storage: LocalStorageItem});

let models = { power, heartRate, powerTarget, ftp };
