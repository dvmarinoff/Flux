import { xf } from './xf.js';
import { memberOf } from './functions.js';
import { LocalStorageItem } from './storage/local-storage.js';

class Value {
    constructor(args) {
        this.name = args.name || undefined;
        this.init();
        this.postInit();
    }
    init() {
        const self = this;
        xf.sub('app:start', _ => { self.localStorage(); });
    }
    postInit() { return; }
    localStorage() {
        const self = this;
        self.local = new LocalStorageItem({key: self.name, default: self.defaultValue(), validate: self.isValid.bind(self)});

        xf.sub(`db:${self.name}`, value => {
            self.local.set(value);
        });
    }
    defaultValue() { return undefined; }
    isValid(value) { return false; }
}

class Ftp extends Value {
    defaultValue() { return 200; }
    isValid(value) {
        value = parseInt(value);
        if(isNaN(value) || value > 600 || value < 30) { return false; }
        return true;
    }
}

class Weight extends Value {
    defaultValue() { return 75; }
    isValid(value) {
        value = parseInt(value);
        if(isNaN(value) || value > 400 || value < 20) { return false; }
        return true;
    }
}

class Theme extends Value {
    defaultValue() { return 'dark'; }
    collection() { return ['dark', 'white']; }
    isValid(value) {
        const self = this;
        value = String(value);
        if(memberOf(self.collection(), value)) { return true; }
        return false;
    }
    switch(value) {
        const self = this;
        if(value === 'dark')  { return 'white'; }
        if(value === 'white') { return 'dark'; }
        return self.defaultValue();
    }
}

class Measurement extends Value {
    defaultValue() { return 'metric'; }
    collection() { return ['metric', 'imperial']; }
    isValid(value) {
        const self = this;
        value = String(value);
        if(memberOf(self.collection(), value)) { return true; }
        return false;
    }
    switch(value) {
        const self = this;
        if(value === 'metric')   { return 'imperial';}
        if(value === 'imperial') { return 'metric'; }
        return self.defaultValue();
    }
}

class Page extends Value {
    defaultValue() { return 'home'; }
    collection() { return ['settings', 'home', 'workouts']; }
    isValid(value) {
        const self = this;
        value = String(value);
        if(memberOf(self.collection(), value)) { return true; }
        return false;
    }
    switch(value) {
        const self = this;
        return self.defaultValue();
    }
}

const ftp = new Ftp({name: 'ftp'});
const weight = new Weight({name: 'weight'});
const theme = new Theme({name: 'theme'});
const measurement = new Measurement({name: 'measurement'});

const page = new Page({name: 'page'});



const values = {
    ftp:         ftp,
    weight:      weight,
    theme:       theme,
    measurement: measurement,
    page:        page
};

export { values };
