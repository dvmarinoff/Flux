import { xf, exists, existance, empty, equals, mavg,
         first, second, last, clamp, toFixed } from '../functions.js';

import { inRange, dateToDashString } from '../utils.js';

import { LocalStorageItem } from '../storage/local-storage.js';
import { idb } from '../storage/idb.js';
import { uuid } from '../storage/uuid.js';

import { workouts as workoutsFile }  from '../workouts/workouts.js';
import { zwo } from '../workouts/zwo.js';
import { fileHandler } from '../file.js';
import { activity } from '../fit/activity.js';
import { fit } from '../fit/fit.js';
import { Model as Cycling } from '../physics.js';

class Model {
    constructor(args = {}) {
        this.init(args);
        this.prop      = args.prop;
        this.default   = existance(args.default, this.defaultValue());
        this.prev      = args.default;
        this.set       = existance(args.set, this.defaultSet);
        this.parser    = existance(args.parser, this.defaultParse);
        this.isValid   = existance(args.isValid, this.defaultIsValid);
        this.onInvalid = existance(args.onInvalid, this.defaultOnInvalid);
        this.storage   = this.defaultStorage();
        this.postInit(args);
    }
    init() { return; }
    postInit() { return; }
    defaultValue() { return ''; }
    defaultIsValid(value) { return exists(value); }
    defaultSet(value) {
        const self = this;
        if(self.isValid(value)) {
            self.state = value;
            // console.log(`${this.prop} : ${this.state}`);
            return value;
        } else {
            self.defaultOnInvalid(value);
            return self.default;
        }
    }
    defaultParse(value) {
        return value;
    }
    defaultOnInvalid(x) {
        const self = this;
        console.error(`Trying to set invalid ${self.prop}. ${typeof x}`, x);
    }
    defaultStorage() {
        const self = this;
        return {add: ((x)=>x),
                restore: ((_)=> self.default)};
    }
    backup(value) {
        const self = this;
        self.storage.set(value);
    }
    restore() {
        const self = this;
        return self.parser(self.storage.restore());
    }
}

class Power extends Model {
    postInit(args = {}) {
        this.min = existance(args.min, 0);
        this.max = existance(args.max, 2500);
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class HeartRate extends Model {
    postInit(args = {}) {
        this.min = existance(args.min, 0);
        this.max = existance(args.max, 255);
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class Cadence extends Model {
    postInit(args = {}) {
        this.min = existance(args.min, 0);
        this.max = existance(args.max, 255);
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class Speed extends Model {
    postInit(args = {}) {
        this.min = existance(args.min, 0);
        this.max = existance(args.max, 120);
    }
    defaultValue() { return 0; }
    defaultIsValid(value) {
        return (Number.isInteger(value) || Number.isFloat(value)) &&
                inRange(self.min, self.max, value);
    }
}

class Sources extends Model {
    postInit(args = {}) {
        const self = this;
        self.state = self.default;
        xf.sub('db:sources', value => self.state = value);

        const storageModel = {
            key: self.prop,
            fallback: self.defaultValue(),
            parse: JSON.parse,
            encode: JSON.stringify
        };

        self.storage = new args.storage(storageModel);
    }
    defaultSet(target, source) {
        return Object.assign(target, source);
    }
    isSource(path, value) {
        const self = this;
        if(exists(self.state[path])) {
            return equals(self.state[path], value);
        }
        return false;
    }
    defaultValue() {
        const sources = {
            power:        'ble:controllable',
            cadence:      'ble:controllable',
            speed:        'ble:controllable',
            control:      'ble:controllable',
            heartRate:    'ble:hrm',
            virtualState: 'power',
        };
        return sources;
    }
}

class Target extends Model {
    postInit(args = {}) {
        this.min = existance(args.min, 0);
        this.max = existance(args.max, 100);
        this.step = existance(args.step, 1);
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
        return clamp(self.min, self.max, self.parse(value));
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
    postInit(args = {}) {
        this.min = existance(args.min, 0);
        this.max = existance(args.max, 800);
        this.step = existance(args.step, 10);
    }
}

class ResistanceTarget extends Target {
    postInit(args = {}) {
        this.min = existance(args.min, -100);
        this.max = existance(args.max, 100);
        this.step = existance(args.step, 10);
    }
    parse(value) { return parseInt(value); }
}

class SlopeTarget extends Target {
    postInit(args = {}) {
        this.min = existance(args.min, -40);
        this.max = existance(args.max, 40);
        this.step = existance(args.step, 0.5);
    }
    defaultIsValid(value) {
        const self = this;
        return Number.isFloat(value) && inRange(self.min, self.max, value);
    }
    parse(value) { return parseFloat(value); }
}

class CadenceTarget extends Target {
    postInit(args = {}) {
        this.min = existance(args.min, 0);
        this.max = existance(args.max, 255);
        this.step = existance(args.step, 5);
    }
    parse(value) { return parseInt(value); }
}

class Mode extends Model {
    postInit(args) {
        this.state = this.defaultValue();
        this.values = ['erg', 'resistance', 'slope'];
    }
    defaultValue() { return 'erg'; }
    defaultIsValid(value) { return this.values.includes(value); }
}

class Page extends Model {
    postInit(args) {
        this.values = ['settings', 'home', 'workouts'];
    }
    defaultValue() { return 'home'; }
    defaultIsValid(value) { return this.values.includes(value); }
}

class FTP extends Model {
    postInit(args = {}) {
        const self = this;
        const storageModel = {
            key: self.prop,
            fallback: self.defaultValue(),
            parse: parseInt,
        };
        self.state       = self.default;
        self.min         = existance(args.min, 0);
        self.max         = existance(args.max, 500);
        self.storage     = args.storage(storageModel);
        self.zones       = existance(args.zones, self.defaultZones());
        self.percentages = existance(args.percentages, self.defaultPercentages());
        self.minAbsValue = 9;
    }
    defaultValue() { return 200; }
    defaultIsValid(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
    defaultZones() {
        return ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
    }
    defaultPercentages() {
        return {'one': 0.54, 'two': 0.75, 'three': 0.87, 'four': 0.94, 'five': 1.05, 'six': 1.20};
    }
    toRelative(value, ftp) {
        const self = this;
        if(value > self.minAbsValue) return toFixed(value / ftp, 2);
        return value;
    }
    toAbsolute(value, ftp) {
        const self = this;
        if(value < self.minAbsValue) return parseInt(value * ftp);
        return value;
    }
    powerToZone(value, ftp, zones) {
        const self = this;
        if(!exists(ftp)) ftp = self.state;
        if(!exists(zones)) zones = self.zones;

        let index = 0;
        let name = zones[index];
        if(value < (ftp * self.percentages.one)) {
            index = 0;
            name = zones[index];
        } else if(value < (ftp * self.percentages.two)) {
            index = 1;
            name = zones[index];
        } else if(value < (ftp * self.percentages.three)) {
            index = 2;
            name = zones[index];
        } else if(value < (ftp * self.percentages.four)) {
            index = 3;
            name = zones[index];
        } else if(value < (ftp * self.percentages.five)) {
            index = 4;
            name = zones[index];
        } else if (value < (ftp * self.percentages.six)) {
            index = 5;
            name = zones[index];
        } else {
            index = 6;
            name = zones[index];
        }
        return {name, index};
    }
}

class Weight extends Model {
    postInit(args = {}) {
        const self = this;
        const storageModel = {
            key: self.prop,
            fallback: self.defaultValue(),
            parse: parseInt,
        };
        self.min = existance(args.min, 0);
        self.max = existance(args.max, 500);
        self.storage = new args.storage(storageModel);
    }
    defaultValue() { return 75; }
    defaultIsValid(value) {
        const self = this;
        return Number.isInteger(value) && inRange(self.min, self.max, value);
    }
}

class Theme extends Model {
    postInit(args = {}) {
        const self = this;
        const storageModel = {
            key: self.prop,
            fallback: self.defaultValue(),
        };
        self.storage = new args.storage(storageModel);
        self.values = ['dark', 'light'];
    }
    defaultValue() { return 'dark'; }
    defaultIsValid(value) { return this.values.includes(value); }
    switch(theme) {
        const self = this;
        if(equals(theme, first(self.values))) return second(self.values);
        if(equals(theme, second(self.values))) return first(self.values);
        self.onInvalid(theme);
        return self.default;
    }
}
class Measurement extends Model {
    postInit(args = {}) {
        const self = this;
        const storageModel = {
            key: self.prop,
            fallback: self.defaultValue(),
        };
        self.storage = new args.storage(storageModel);
        self.values = ['metric', 'imperial'];
    }
    defaultValue() { return 'metric'; }
    defaultIsValid(value) { return this.values.includes(value); }
    switch(theme) {
        const self = this;
        if(equals(theme, first(self.values))) return second(self.values);
        if(equals(theme, second(self.values))) return first(self.values);
        self.onInvalid(theme);
        return self.default;
    }
}

class DataTileSwitch extends Model {
    postInit(args = {}) {
        const self = this;
        const storageModel = {
            key: self.prop,
            fallback: self.defaultValue(),
        };
        self.storage = new args.storage(storageModel);
        this.values = [0,1];
    }
    defaultValue() { return 0; }
    defaultIsValid(value) { return this.values.includes(value); }
    defaultParse(value) {
        return parseInt(value);
    }
}

class Workout extends Model {
    postInit(args) {
        const self = this;
    }
    defaultValue() { return this.parse((first(workoutsFile))); }
    defaultIsValid(value) {
        return exists(value);
    }
    restore(db) {
        return first(db.workouts);
    }
    async readFromFile(workoutFile) {
        const workout = await fileHandler.readTextFile(workoutFile);
        return workout;
    }
    parse(workout) {
        return zwo.readToInterval(workout);
    }
    fileName () {
        const self = this;
        const now = new Date();
        return `workout-${dateToDashString(now)}.fit`;
    }
    encode(db) {
        const fitjsActivity = activity.encode({records: db.records, laps: db.laps});
        console.log(fitjsActivity);
        return fit.activity.encode(fitjsActivity);
    }
    download(activity) {
        const self = this;
        const blob = new Blob([activity], {type: 'application/octet-stream'});
        fileHandler.saveFile()(blob, self.fileName());
    }
    save(db) {
        const self = this;
        self.download(self.encode(db));
    }
}

class Workouts extends Model {
    init(args) {
        const self = this;
        self.workoutModel = args.workoutModel;
    }
    postInit(args) {
        const self = this;
    }
    defaultValue() {
        const self = this;
        return workoutsFile.map((w) => Object.assign(self.workoutModel.parse(w), {id: uuid()}));
    }
    defaultIsValid(value) {
        const self = this;
        return exists(value);
    }
    restore() {
        const self = this;
        return self.default;
    }
    get(workouts, id) {
        for(let workout of workouts) {
            if(equals(workout.id, id)) {
                return workout;
            }
        }
        console.error(`tring to get a missing workout: ${id}`, workouts);
        return first(workouts);
    }
    add(workouts, workout) {
        const self = this;
        workouts.push(Object.assign(workout, {id: uuid()}));
        return workouts;
    }
}

function Session(args = {}) {
    let name = 'session';

    async function start() {
        await idb.open('store', 1, 'session');
    }

    function backup(db) {
        idb.put('session', idb.setId(dbToSession(db), 0));
    }

    async function restore(db) {
        const sessions = await idb.getAll(`${name}`);
        xf.dispatch(`${name}:restore`, sessions);
        console.log(`:idb :restore '${name}' :length ${sessions.length}`);

        let session = last(sessions);

        if(!empty(sessions)) {
            if(session.elapsed > 0) {
                sessionToDb(db, session);
            } else {
                idb.clear(`${name}`);
            }
        }
    }

    function sessionToDb(db, session) {
        return Object.assign(db, session);
    }

    function dbToSession(db) {
        const session = {
            // Watch
            elapsed: db.elapsed,
            lapTime: db.lapTime,
            stepTime: db.stepTime,
            intervalIndex: db.intervalIndex,
            stepIndex: db.stepIndex,
            intervalDuration: db.intervalDuration,
            stepDuration: db.stepDuration,
            lapStartTime: db.lapStartTime,
            watchStatus: db.watchStatus,
            workoutStatus: db.workoutStatus,

            // Recording
            records: db.records,
            laps: db.laps,
            lap: db.lap,
            distance: db.distance,
            altitude: db.altitude,

            // Report
            powerInZone: db.powerInZone,

            // Workouts
            workout: db.workout,
            mode: db.mode,
            page: db.page,

            // Targets
            powerTarget: db.powerTarget,
            resistanceTarget: db.resistanceTarget,
            slopeTarget: db.slopeTarget,

            // sources: db.sources,

            // UI options
            powerSmoothing: db.powerSmoothing,
            librarySwitch: db.librarySwitch,
        };

        return session;
    }

    return Object.freeze({
        start,
        backup,
        restore,
        sessionToDb,
        dbToSession,
    });
}

class MetaProp {
    constructor(args = {}) {
        const self = this;
        this.init(args);
        this.prop     = existance(args.prop, this.getDefaults().prop);
        this.disabled = existance(args.default, this.getDefaults().disabled);
        this.default  = existance(args.default, this.getDefaults().default);
        this.state    = existance(args.state, this.default);
        this.postInit(args);
        this.start();
    }
    init(args) {
        return args;
    }
    postInit(args = {}) {
        return args;
    }
    getPropValue(propValue) {
        return propValue;
    }
    getState() {
        return this.format(this.state);
    }
    setState(propValue) {
        return this.updateState(propValue);
    }
    format(state) {
        return state;
    }
    start() {
        this.subs();
    }
    stop() {
        this.unsubs();
    }
    subs() {
        const self = this;
        this.abortController = new AbortController();
        this.signal = { signal: self.abortController.signal };
        this.subsConfig();
    }
    subsConfig() { return; }
    unsubs() {
        this.abortController.abort();
    }
    onUpdate(propValue) {
        if(this.shouldUpdate(propValue)) {
            this.updateState(propValue);
        }
    }
    shouldUpdate() {
        return true;
    }
    updateState(value) {
        this.state = value;
        return this.state;
    }
}

class PropAccumulator extends MetaProp {
    postInit(args = {}) {
        this.event = existance(args.event, this.getDefaults().event);
        this.count = this.getDefaults().count;
        this.prev  = this.getDefaults().prev;
    }
    getDefaults() {
        return {
            value: 0,
            prev: 0,
            default: 0,
            disabled: false,
            prop: '',

            event: '',
            prev: 0,
            count: 0,
        };
    }
    format(state) {
        return Math.round(state);
    }
    reset() { this.count = 0;}
    subsConfig() {
        if(!equals(this.prop, '')) {
            xf.sub(`${this.prop}`, this.onUpdate.bind(this), this.signal);
        }
        if(!equals(this.event, '')) {
            xf.sub(`${this.event}`, this.onEvent.bind(this), this.signal);
        }
    }
    updateState(value) {
        if(equals(this.state, 0) && equals(value, 0)) {
            this.state = 0;
        } else if(equals(value, 0)) {
            return this.state;
        } else {
            this.count += 1;
            const value_c = value;
            const value_p = this.prev;
            const count_c = this.count;
            const count_p = this.count-1;
            this.state = mavg(value_c, value_p, count_c, count_p);
            this.prev = this.state;
        }
        return this.state;
    }
    onEvent() {
        this.reset();
    }
}

const powerLap = new PropAccumulator({event: 'watch:lap'});
const powerAvg = new PropAccumulator({event: 'watch:stopped'});

const cadenceLap = new PropAccumulator({event: 'watch:lap'});
const heartRateLap = new PropAccumulator({event: 'watch:lap'});

// const cadenceAvg = new PropAccumulator({event: 'watch:stopped'});
// const heartRateAvg = new PropAccumulator({event: 'watch:stopped'});

class PropInterval {
    constructor(args = {}) {
        const self = this;
        this.default     = existance(args.default, this.getDefaults().default);
        this.state       = existance(args.state, this.getDefaults().default);
        this.accumulator = existance(args.accumulator, this.getDefaults().accumulator);
        this.count       = existance(args.count, this.getDefaults().count);
        this.prop        = existance(args.prop, this.getDefaults().prop);
        this.effect      = existance(args.effect, this.getDefaults().effect);
        this.interval    = existance(args.interval, this.getDefaults().interval);
        this.start();
    }
    getDefaults() {
        const self = this;
        return {
            default: 0,
            accumulator: 0,
            count: 0,
            interval: 1000,
            prop: '',
            effect: '',
        };
    }
    start() {
        this.subs();
        this.intervalId = setInterval(this.onInterval.bind(this), this.interval);
    }
    stop() {
        clearInterval(this.intervalId);
        this.unsubs();
    }
    reset() {
        this.accumulator = 0;
        this.count = 0;
    }
    subs() {
        const self = this;
        this.abortController = new AbortController();
        this.signal = { signal: self.abortController.signal };

        xf.sub(`${this.prop}`, this.onUpdate.bind(this), this.signal);
    }
    unsubs() {
        this.abortController.abort();
    }
    onUpdate(propValue) {
        this.accumulator += propValue;
        this.count += 1;
    }
    onInterval() {
        if(equals(this.accumulator, 0) || equals(this.count, 0)) return;

        this.state = this.accumulator / this.count;
        xf.dispatch(`${this.effect}`, this.state);
        this.reset();
    }
}

class PowerInZone {
    constructor(args = {}) {
        const self = this;
        this.ftpModel = existance(args.ftpModel);
        this.default  = existance(args.default, this.getDefaults().default);
        this.count    = existance(args.count,   this.getDefaults().count);
        this.weights  = existance(args.weights, this.getDefaults().weights);
        this.state    = existance(args.state,   this.getDefaults().default);
        this.prop     = existance(args.prop,    this.getDefaults().prop);
        this.start();
    }
    getDefaults() {
        const self = this;
        const value = self.ftpModel.zones.map(x => [0,0]);
        const weights = self.ftpModel.zones.map(x => 0);

        return {
            default: value,
            weights: weights,
            count: 0,
            prop: 'db:elapsed',
        };
    }
    start() {
        this.subs();
    }
    stop() {
        this.unsubs();
    }
    subs() {
        const self = this;
        this.abortController = new AbortController();
        this.signal = { signal: self.abortController.signal };

        xf.reg(`${this.prop}`, this.onUpdate.bind(this), this.signal);
    }
    unsubs() {
        this.abortController.abort();
    }
    onUpdate(propValue, db) {
        this.updateState(db.power);
    }
    powerToZone(power) {
        return this.ftpModel.powerToZone(power);
    }
    updateState(value) {
        if(equals(value, 0)) return this.state;

        const zone = this.powerToZone(value);

        this.count += 1;
        this.weights[zone.index] += 1;

        for(let i=0; i < this.state.length; i++) {
            if(!equals(this.weights[i], 0)) {
                this.state[i] = [this.weights[i] / this.count, this.weights[i]];
            }
        }

        xf.dispatch('powerInZone', this.state);
        return this.state;
    }
}

class VirtualState extends MetaProp {
    postInit() {
        this.speed           = this.getDefaults().speed;
        this.altitude        = this.getDefaults().altitude;
        this.distance        = this.getDefaults().distance;

        this.slope           = this.getDefaults().slope;
        this.riderWeight     = this.getDefaults().riderWeight;
        this.equipmentWeight = this.getDefaults().equipmentWeight;
        this.mass            = this.getDefaults().mass;

        this.source          = this.getDefaults().source;
        this.cycling         = Cycling();
    }
    getDefaults() {
        return {
            riderWeight: 75,
            equipmentWeight: 10,
            mass: 85,
            slope: 0.00,

            speed: 0,
            altitude: 0,
            distance: 0,

            prop: 'power',
            source: 'power',
            disabled: false,
            default: 0,
        };
    }
    subs() {
        xf.reg(`${this.prop}`, this.onUpdate.bind(this), this.signal);
        xf.sub(`db:sources`, this.onSources.bind(this), this.signal);
        xf.sub(`db:weight`, this.onWeight.bind(this), this.signal);
    }
    onSources(sources) {
        this.source = sources.virtualState;
    }
    onWeight(weight) {
        this.riderWeight = weight;
        this.systemWeight = this.riderWeight + this.equipmentWeight;
    }
    onUpdate(power, db) {
        if(!equals(this.source, this.prop)) return;

        const { speed, distance, altitude, } = this.cycling.virtualSpeedCF({
            power:    db.power,
            slope:    db.slopeTarget / 100,
            distance: db.distance,
            altitude: db.altitude,
            mass:     this.mass,
            speed:    this.speed,
            dt: 1/4,
        });

        this.speed = speed;

        xf.dispatch('speedVirtual', (speed * 3.6));
        xf.dispatch('distance', distance);
        xf.dispatch('altitude', altitude);

        console.log(`s: ${speed}, a: ${altitude}, d: ${distance}`);
    }
}

class SpeedState extends VirtualState {
    getDefaults() {
        return {
            prop: 'speed',
            source: 'power',
            disabled: false,
            default: 0,

            riderWeight: 75,
            equipmentWeight: 10,
            mass: 85,
            slope: 0.00,

            speed: 0,
            altitude: 0,
            distance: 0,
        };
    }
    onUpdate(speed, db) {
        if(!equals(this.source, this.prop)) return;

        const { distance, altitude } = this.cycling.trainerSpeed({
            slope:     db.slopeTarget / 100,
            speed:     db.speed / 3.6,
            distance:  db.distance,
            altitude:  db.altitude,
            speedPrev: this.speedPrev,
            mass:      this.mass,
            dt: 1/4,
        });

        this.speedPrev = speed / 3.6;

        xf.dispatch('distance', distance);
        xf.dispatch('altitude', altitude);

        console.log(`s: ${speed}, a: ${altitude}, d: ${distance}`);
    }
}

class TSS {
    // TSS = (t * NP * IF) / (FTP * 3600) * 100
    // NP:
    // 1. Calculate a rolling 30-second average power for the workout or
    //    specific section of data
    // 2. Raise the resulting values to the fourth power.
    // 3. Determine the average of these values.
    // 4. Find the fourth root of the resulting average.
    // IF = NP / FTP
}



const power = new Power({prop: 'power'});
const cadence = new Cadence({prop: 'cadence'});
const heartRate = new HeartRate({prop: 'heartRate'});
const speed = new Speed({prop: 'speed'});
const sources = new Sources({prop: 'sources', storage: LocalStorageItem});

const virtualState = new VirtualState();
const speedState   = new SpeedState();

const powerTarget = new PowerTarget({prop: 'powerTarget'});
const resistanceTarget = new ResistanceTarget({prop: 'resistanceTarget'});
const slopeTarget = new SlopeTarget({prop: 'slopeTarget'});
const cadenceTarget = new CadenceTarget({prop: 'cadenceTarget'});
const mode = new Mode({prop: 'mode'});
const page = new Page({prop: 'page'});

const ftp = new FTP({prop: 'ftp', storage: LocalStorageItem});
const weight = new Weight({prop: 'weight', storage: LocalStorageItem});
const theme = new Theme({prop: 'theme', storage: LocalStorageItem});
const measurement = new Measurement({prop: 'measurement', storage: LocalStorageItem});
const dataTileSwitch = new DataTileSwitch({prop: 'dataTileSwitch', storage: LocalStorageItem});

const power1s = new PropInterval({prop: 'power', effect: 'power1s', interval: 1000});
const powerInZone = new PowerInZone({ftpModel: ftp});

const workout = new Workout({prop: 'workout'});
const workouts = new Workouts({prop: 'workouts', workoutModel: workout});

const session = Session();

let models = {
    power,
    heartRate,
    cadence,
    speed,
    sources,

    virtualState,

    power1s,
    powerLap,
    powerAvg,
    powerInZone,

    heartRateLap,
    cadenceLap,

    powerTarget,
    resistanceTarget,
    slopeTarget,
    cadenceTarget,

    mode,
    page,
    ftp,
    weight,
    theme,
    measurement,
    dataTileSwitch,

    workout,
    workouts,
    session,
};

export { models };
