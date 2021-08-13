import { xf, exists, equals } from '../functions.js';

class LocalStorageItem {
    constructor(args) {
        this.key     = args.key;
        this.default = args.default;
        this.isValid = args.isValid || this.defaultIsValid;
        this.init();
    }
    defaultIsValid(value) { return exists(value); }
    init() {
        const self = this;
        self.restore();
    }
    restore() {
        const self = this;
        const inStorageValue = self.get();
        if(!exists(inStorageValue)) {
            self.set(self.default);
        }
        const key   = self.key;
        const value = self.get();
        xf.dispatch(`storage:set:${key}`, value);
        return value;
    }
    get() {
        const self  = this;
        const key   = self.key;
        const value = window.localStorage.getItem(`${key}`);
        if(!exists(value)) {
            console.warn(`Trying to get non-existing value from Local Storage at key ${key}!`);
        }
        return value;
    }
    set(value) {
        const self    = this;
        const key     = self.key;
        const isValid = self.isValid(value);
        if(isValid) {
            window.localStorage.setItem(`${key}`, value);
        } else {
            console.error(`Trying to enter invalid ${key} value in Local Storage: ${typeof value}`, value);
            window.localStorage.setItem(`${key}`, self.default);
        }
    }
    delete() {
        const self = this;
        window.localStorage.removeItem(`${self.key}`);
    }
}

export { LocalStorageItem };
