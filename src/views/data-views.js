import { xf, exists, existance, validate, equals, isNumber, last, empty, avg, toFixed } from '../functions.js';
import { formatTime } from '../utils.js';
import { models } from '../models/models.js';

//
// DataView
//
// Usage:
// <data-view id="count-value" prop="db:count">--</data-view>
//
// Template Method:
// overwrite methods to augment the general logic
//
// getDefaults() -> setup default and fallback values
// config()      -> work with attributes and props here
// subs()        -> subscribe to events or db
// unsubs()      -> executes after abort signal
// getValue()    -> getter for the value for state from a complex prop say an object or array
// onUpdate()    -> determine the rules for state update that will trigger rendering
// transform()   -> apply transforming functions to state just before rendering
//
class DataView extends HTMLElement {
    constructor() {
        super();
        this.state = '';
        this.postInit();
    }
    postInit() { return; }
    static get observedAttributes() {
        return ['disabled'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(equals(name, 'disabled')) {
            this.disabled = exists(newValue) ? true : false;
        }
    }
    getDefaults() {
        return { prop: '', };
    }
    config() {
        return;
    }
    connectedCallback() {
        const self = this;
        this.abortController = new AbortController();
        this.signal = { signal: self.abortController.signal };

        this.prop     = existance(this.getAttribute('prop'), this.getDefaults().prop);
        this.disabled = this.hasAttribute('disabled');

        this.config();
        this.subs();
    }
    subs() {
        xf.sub(`${this.prop}`, this.onUpdate.bind(this), this.signal);
    }
    disconnectedCallback() {
        this.abortController.abort();
        this.unsub();
    }
    unsubs() {}
    getValue(propValue) {
        return propValue;
    }
    shouldUpdate(value) {
        return !equals(value, this.state) && !this.disabled;
    }
    updateState(value) {
        this.state = value;
    }
    onUpdate(propValue) {
        const value = this.getValue(propValue);

        if(this.shouldUpdate(value)) {
            this.updateState(value);
            this.render();
        }
    }
    transform(state) {
        return state;
    }
    render() {
        this.textContent = this.transform(this.state);
    }
}

customElements.define('data-view', DataView);


class TimerTime extends DataView {
    getDefaults() {
        return {
            format: 'hh:mm:ss',
            prop:   'db:elapsed',
        };
    }
    config() {
        this.format = existance(this.getAttribute('format'), this.getDefaults().format);
    }
    transform(state) {
        return formatTime({value: this.state, format: this.format, unit: 'seconds'});
    }
}

customElements.define('timer-time', TimerTime);


class IntervalTime extends DataView {
    getDefaults() {
        return {
            format: 'mm:ss',
            prop:   'db:lapTime',
        };
    }
    config() {
        this.format = existance(this.getAttribute('format'), this.getDefaults().format);
    }
    transform(state) {
        return formatTime({value: this.state, format: this.format, unit: 'seconds'});
    }
}

customElements.define('interval-time', IntervalTime);

class SpeedValue extends DataView {
    postInit() {
        this.measurement = this.getDefaults().measurement;
    }
    getDefaults() {
        return {
            prop: 'db:speed',
            measurement: 'metric',
        };
    }
    subs() {
        xf.sub(`${this.prop}`, this.onUpdate.bind(this), this.signal);
        xf.sub(`db:measurement`, this.onMeasurement.bind(this), this.signal);
    }
    onMeasurement(measurement) {
        this.measurement = measurement;
    }
    kmhToMph(kmh) {
        return 0.621371 * kmh;
    };
    format(value, measurement = 'metric') {
        if(equals(measurement, 'imperial')) {
            value = `${this.kmhToMph(value).toFixed(1)}`;
        } else {
            value = `${(value).toFixed(1)}`;
        }
        return value;
    }
    transform(state) {
        return this.format(state, this.measurement);
    }
}

customElements.define('speed-value', SpeedValue);

class SpeedVirtual extends SpeedValue {
    getDefaults() {
        return {
            prop: 'db:speedVirtual',
            measurement: 'metric',
        };
    }
}

customElements.define('speed-virtual', SpeedVirtual);


class DistanceValue extends DataView {
    postInit() {
        this.measurement = this.getDefaults().measurement;
    }
    getDefaults() {
        return {
            prop: 'db:distance',
            measurement: 'metric',
        };
    }
    subs() {
        xf.sub(`${this.prop}`, this.onUpdate.bind(this), this.signal);
        xf.sub(`db:measurement`, this.onMeasurement.bind(this), this.signal);
    }
    onMeasurement(measurement) {
        this.measurement = measurement;
    }
    metersToYards(meters) {
        return 1.09361 * meters;
    }
    format(meters, measurement = 'metric') {
        let value   = `0`;
        const km    = (meters / 1000);
        const miles = (meters / 1609.34);
        const yards = this.metersToYards(meters);

        if(equals(measurement, 'imperial')) {
            const yardsTemplate = `${(this.metersToYards(meters)).toFixed(0)}`;
            const milesTemplate = `${miles.toFixed(2)}`;
            return value = (yards < 1609.34) ? yardsTemplate : milesTemplate;
        } else {
            const metersTemplate = `${meters.toFixed(0)}`;
            const kmTemplate = `${km.toFixed(2)}`;
            return value = (meters < 1000) ? metersTemplate : kmTemplate;
        }
    }
    transform(state) {
        return this.format(state, this.measurement);
    }
}

customElements.define('distance-value', DistanceValue);

class CadenceValue extends DataView {
    getDefaults() {
        return {
            prop: 'db:cadence',
        };
    }
}

customElements.define('cadence-value', CadenceValue);


class CadenceTarget extends DataView {
    getDefaults() {
        return {
            prop: 'db:cadenceTarget',
        };
    }
    transform(state) {
        if(equals(state, 0)) {
            return '';
        }

        return state;
    }
}

customElements.define('cadence-target', CadenceTarget);


class CadenceGroup extends DataView {
    getDefaults() {
        return {
            prop: 'db:cadenceTarget',
        };
    }
    config() {
        this.$main = this.querySelector('cadence-value');
        this.$aux = this.querySelector('cadence-target');
    }
    render() {
        if(equals(this.state, 0)) {
            this.$main.classList.remove('active');
            this.$aux.classList.remove('active');
        } else {
            this.$main.classList.add('active');
            this.$aux.classList.add('active');
        }
    }
}

customElements.define('cadence-group', CadenceGroup);


class HeartRateValue extends DataView {
    getDefaults() {
        return {
            prop: 'db:heartRate',
        };
    }
}

customElements.define('heart-rate-value', HeartRateValue);


class WorkoutName extends DataView {
    getDefaults() {
        return {
            prop: 'db:workout',
        };
    }
    getValue(propValue) {
        return propValue.meta.name;
    }
}

customElements.define('workout-name', WorkoutName);


class PowerTarget extends DataView {
    getDefaults() {
        return {
            prop: 'db:powerTarget',
        };
    }
}

customElements.define('power-target', PowerTarget);

class SlopeTarget extends DataView {
    getDefaults() {
        return {
            prop: 'db:slopeTarget',
        };
    }
    transform(state) {
        return state.toFixed(1);
    }
}

customElements.define('slope-target', SlopeTarget);


class PowerTargetControl extends DataView {
    postInit() {
        const self = this;
        this.state = 0;
    }
    setDefaults() {
        this.prop = 'db:powerTarget';
        this.selectors = {
            input: '#power-target-input',
            inc:   '#power-target-inc',
            dec:   '#power-target-dec',
        };
        this.effects = {
            inc: 'power-target-inc',
            dec: 'power-target-dec',
            set: 'power-target-set',
        };
        this.parse = parseInt;
    }
    config() {
        this.setDefaults();
        this.$input = document.querySelector(this.selectors.input);
        this.$inc   = document.querySelector(this.selectors.inc);
        this.$dec   = document.querySelector(this.selectors.dec);
    }
    subs() {
        this.$input.addEventListener('change', this.onChange.bind(this), this.signal);
        this.$inc.addEventListener('pointerup', this.onInc.bind(this), this.signal);
        this.$dec.addEventListener('pointerup', this.onDec.bind(this), this.signal);

        xf.sub(`${this.prop}`, this.onUpdate.bind(this), this.signal);
    }
    onInc(e) {
        xf.dispatch(`ui:${this.effects.inc}`);
    }
    onDec(e) {
        xf.dispatch(`ui:${this.effects.dec}`);
    }
    onChange(e) {
        this.state = this.parse(e.target.value);
        xf.dispatch(`ui:${this.effects.set}`, this.state);
    }
    render() {
        this.$input.value = this.transform(this.state);
    }
}

customElements.define('power-target-control', PowerTargetControl);


class ResistanceTargetControl extends PowerTargetControl {
    setDefaults() {
        this.prop = 'db:resistanceTarget';
        this.selectors = {
            input: '#resistance-target-input',
            inc:   '#resistance-target-inc',
            dec:   '#resistance-target-dec',
        };
        this.effects = {
            inc: 'resistance-target-inc',
            dec: 'resistance-target-dec',
            set: 'resistance-target-set',
        };
        this.parse = parseInt;
    }
}

customElements.define('resistance-target-control', ResistanceTargetControl);


class SlopeTargetControl extends PowerTargetControl {
    setDefaults() {
        this.prop = 'db:slopeTarget';
        this.selectors = {
            input: '#slope-target-input',
            inc:   '#slope-target-inc',
            dec:   '#slope-target-dec',
        };
        this.effects = {
            inc: 'slope-target-inc',
            dec: 'slope-target-dec',
            set: 'slope-target-set',
        };
        this.parse = parseFloat;
    }
    transform(state) {
        return (state).toFixed(1);
    }
}

customElements.define('slope-target-control', SlopeTargetControl);


class PowerValue extends DataView {
    getDefaults() {
        return {
            prop: 'db:power',
        };
    }
    subs() {
        xf.sub(`${this.prop}`, this.onUpdate.bind(this), this.signal);
    }
    transform(state) {
        return Math.round(state);
    }
}

customElements.define('power-value', PowerValue);

class PowerAvg extends DataView {
    getDefaults() {
        return {
            prop: 'db:powerAvg',
        };
    }
    subs() {
        xf.sub(`${this.prop}`, this.onUpdate.bind(this), this.signal);
    }
    transform(state) {
        return Math.round(state);
    }
}

customElements.define('power-avg', PowerAvg);

class PowerLap extends DataView {
    getDefaults() {
        return {
            prop: 'db:powerLap',
        };
    }
    subs() {
        xf.sub(`${this.prop}`, this.onUpdate.bind(this), this.signal);
    }
    transform(state) {
        return Math.round(state);
    }
}

customElements.define('power-lap', PowerLap);

class PowerInZone extends HTMLElement {
    constructor() {
        super();
        this.state = [[0,0],[0,0],[0,0],[0,0], [0,0],[0,0],[0,0]];
        this.selectors = {
            values: '.power--zone-value',
            bars: '.power--zone-bar',
            btn: '.power--unit',
        };
        this.format = 'percentage';
        this.prop = 'db:powerInZone';
    }
    connectedCallback() {
        const self = this;
        this.abortController = new AbortController();
        this.signal = { signal: self.abortController.signal };

        this.$values = this.querySelectorAll(this.selectors.values);
        this.$bars = this.querySelectorAll(this.selectors.bars);
        this.$btn = this.querySelector(this.selectors.btn);

        this.$btn.addEventListener('pointerup', this.onSwitch.bind(this), this.signal);

        xf.sub(`${this.prop}`, this.onUpdate.bind(this), this.signal);
    }
    disconnectedCallback() {
        this.abortController.abort();
    }
    onUpdate(propValue) {
        this.state = propValue;
        this.render();
    }
    onSwitch() {
        console.log(this.format);
        if(equals(this.format, 'time')) {
            this.format = 'percentage';
            this.$btn.textContent = '%';
            this.render();
        } else {
            this.format = 'time';
            this.$btn.textContent = 'min';
            this.render();
        }
    }
    render() {
        for(let i=0; i < this.state.length; i++) {
            let text;
            if(equals(this.format, 'percentage')) {
                 text = Math.round(this.state[i][0]*100);
            } else {
                 text = formatTime({value:Math.round(this.state[i][1]), format: 'mm:ss'});
            }
            const height = `${this.state[i][0]*100}%`;

            this.$values[i].textContent = text;
            this.$bars[i].style.height = height;
        }
    }
}

customElements.define('power-in-zone', PowerInZone);


class LapsList extends DataView {
    postInit() {
        this.isEmpty = true;
    }
    getDefaults() {
        return { prop: 'db:lap', };
    }
    config() {
        this.$lapsCont = this.querySelector('.laps--cont');
    }
    subs() {
        xf.reg(`${this.prop}`, this.onUpdate.bind(this), this.signal);
    }
    toLap(lap, index) {
        const duration     = lap.totalElapsedTime;
        const powerLap     = Math.round(validate([exists, isNumber], lap.avgPower, 0));
        const cadenceLap   = Math.round(validate([exists, isNumber], lap.avgCadence, 0));
        const heartRateLap = Math.round(validate([exists, isNumber], lap.avgHeartRate, 0));
        const zone         = models.ftp.powerToZone(powerLap).name;

        return `<div class="lap--item">
                    <div class="lap--item--inner">
                    <div class="lap--value lap--index">${index}</div>
                    <div class="lap--value lap--duration">${formatTime({value: duration, format: 'mm:ss'})}</div>
                    <div class="lap--value lap--power zone-${zone}-color">${powerLap} W</div>
                    <div class="lap--value lap--cadence">${cadenceLap} rpm</div>
                    <div class="lap--value lap--heart-rate">${heartRateLap} bpm</div>
                    </div>
                </div>`;
    }
    restore(laps) {
        this.state = laps;
        laps.forEach((lap, index) => this.render(lap, index+1));
    }
    onUpdate(propValue, db) {
        if(empty(db.laps)) {
            return;
        } else if(this.isEmpty) {
            this.restore(db.laps);
            this.isEmpty = false;
        } else {
            this.updateState(db.laps);
            this.render(last(db.laps), this.state.length);
        }

    }
    render(lap, i) {
        this.$lapsCont.insertAdjacentHTML('afterbegin', this.toLap(lap, i));
    }
}

customElements.define('laps-list', LapsList);


function scale(value, max = 100) {
    return 100 * (value/max);
}

class InstantPowerGraph extends HTMLElement {
    constructor() {
        super();
        this.value       = this.defaults().value;
        this.metricValue = this.defaults().metricValue;
        this.scaleFactor = this.defaults().scaleFactor;
        this.barsCount   = this.defaults().barsCount;
        this.scaleMax    = this.setScaleMax();
        this.model       = {};
        this.postInit();
    }
    postInit() {
        this.model  = models.ftp;
        this.prop   = 'power';
        this.metric = 'ftp';
    }
    defaults () {
        return {
            value:       0,
            barsCount:   0,
            metricValue: 200,
            scaleFactor: 1.6,
        };
    }
    connectedCallback() {
        const self = this;
        this.abortController = new AbortController();
        this.signal = { signal: self.abortController.signal };

        this.graphWidth = this.calcGraphWidth();

        xf.sub(`db:${this.prop}`, this.onUpdate.bind(this), this.signal);
        xf.sub(`db:${this.metric}`, this.onMetric.bind(this), this.signal);
    }
    disconnectedCallback() {
        this.abortController.abort();
    }
    calcGraphWidth() {
        return this.getBoundingClientRect().width;
    }
    onUpdate(value) {
        this.value = value;
        this.render();
    }
    onMetric(value) {
        this.metricValue = value;
        this.setScaleMax();
    }
    setScaleMax() {
        this.scaleMax = this.metricValue * this.scaleFactor;
    }
    bar(zone = 'one', height = 80, width = 1) {
        return `<div class="graph-bar zone-${zone}" style="height: ${height}%; width: ${width}px;"></div>`;
    }
    shift() {
        this.removeChild(this.childNodes[0]);
    }
    render() {
        const zone = models.ftp.powerToZone(this.value, this.metricValue).name;
        const barHeight = scale(this.value, this.scaleMax);
        if(this.barsCount >= this.graphWidth) {
            this.shift();
        }
        this.insertAdjacentHTML('beforeend', this.bar(zone, barHeight, 1));
        this.barsCount += 1;
    }
}

customElements.define('instant-power-graph', InstantPowerGraph);


class PowerGraph extends HTMLElement {
    constructor() {
        super();
    }

    toBar(power) {
        const zone = models.ftp.powerToZone(this.value).name;
        const height = this.powerToHeight();
    }
    powerToHeight(power) {
        return 100;
    }
    render(power) {
        this.insertAdjacentHTML('beforeend', this.toBar(power));
        this.barsCount += 1;
    }
}

customElements.define('power-graph', PowerGraph);


class SwitchGroup extends HTMLElement {
    constructor() {
        super();
        this.state = 0;
        this.postInit();
    }
    connectedCallback() {
        const self = this;
        this.abortController = new AbortController();
        this.signal = { signal: self.abortController.signal };

        this.$switchList = this.querySelectorAll('.switch-item');
        this.config();

        xf.sub(`db:${this.prop}`, this.onState.bind(this), this.signal);
        this.addEventListener('pointerup', this.onSwitch.bind(this), this.signal);
    }
    disconnectedCallback() {
        this.abortController.abort();
    }
    eventOwner(e) {
        const pathLength = e.path.length;

        for(let i = 0; i < pathLength; i++) {
            if(exists(e.path[i].hasAttribute) &&
               e.path[i].hasAttribute('index')) {
                return e.path[i];
            }
        }

        return e.path[0];
    }
    onSwitch(e) {
        const element = this.eventOwner(e);

        if(exists(element.attributes.index)) {

            const id = parseInt(element.attributes.index.value) || 0;

            if(equals(id, this.state)) {
                return;
            } else {
                xf.dispatch(`${this.effect}`, id);
            }
        }
    }
    onState(state) {
        this.state = state;
        this.setSwitch(this.state);
        this.renderEffect(this.state);
    }
    setSwitch(state) {
        this.$switchList.forEach(function(s, i) {
            if(equals(i, state)) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    }
    // overwrite the rest to augment behavior
    postInit() {
        this.prop = '';
    }
    config() {
    }
    renderEffect(state) {
        return state;
    }
}

class DataTileSwitchGroup extends SwitchGroup {
    postInit() {
        this.prop = 'dataTileSwitch';
        this.effect = 'ui:data-tile-switch-set';
    }
    config() {
        this.$speed    = document.querySelector('#data-tile--speed');     // tab 0
        this.$distance = document.querySelector('#data-tile--distance');  // tab 0
        this.$powerAvg = document.querySelector('#data-tile--power-avg'); // tab 1
        this.$slope    = document.querySelector('#data-tile--slope');     // tab 1

        this.renderEffect(this.state);
    }
    renderEffect(state) {
        if(equals(state, 0)) {
            this.$speed.classList.add('active');
            this.$distance.classList.add('active');
            this.$powerAvg.classList.remove('active');
            this.$slope.classList.remove('active');
        }
        if(equals(state, 1)) {
            this.$speed.classList.remove('active');
            this.$distance.classList.remove('active');
            this.$powerAvg.classList.add('active');
            this.$slope.classList.add('active');
        }
        return;
    }
}

customElements.define('data-tile-switch-group', DataTileSwitchGroup);

class LibrarySwitchGroup extends SwitchGroup {
    postInit() {
        this.prop = 'librarySwitch';
        this.effect = 'ui:library-switch-set';
    }
    config() {
        this.$workouts   = document.querySelector('#workouts');    // tab 0
        this.$rideReport = document.querySelector('#ride-report'); // tab 1

        this.renderEffect(this.state);
    }
    renderEffect(state) {
        if(equals(state, 1)) {
            this.$rideReport.classList.add('active');
            this.$workouts.classList.remove('active');
        }
        if(equals(state, 0)) {
            this.$workouts.classList.add('active');
            this.$rideReport.classList.remove('active');
        }
        return;
    }
}

customElements.define('library-switch-group', LibrarySwitchGroup);


class MeasurementUnit extends DataView {
    getDefaults() {
        return {
            state: models.measurement.default,
            prop: 'db:measurement',
        };
    }
    formatUnit(measurement = models.measurement.default) {
        if(measurement === 'imperial') {
            return `lbs`;
        } else {
            return `kg`;
        }
    }
    transform(state) {
        return this.formatUnit(state);
    }
}

customElements.define('measurement-unit', MeasurementUnit);

class ThemeValue extends DataView {
    getDefaults() {
        return {
            prop: 'db:theme',
        };
    }
}

customElements.define('theme-value', ThemeValue);

class MeasurementValue extends DataView {
    getDefaults() {
        return {
            prop: 'db:measurement',
        };
    }
}

customElements.define('measurement-value', MeasurementValue);

export {
    DataView,

    TimerTime,
    IntervalTime,
    CadenceValue,
    CadenceTarget,
    CadenceGroup,
    SpeedValue,
    DistanceValue,
    HeartRateValue,
    PowerAvg,
    PowerValue,
    MeasurementUnit,
    ThemeValue,
    MeasurementValue,

    SlopeTarget,
    PowerTarget,

    WorkoutName,

    InstantPowerGraph,

    SwitchGroup,
    DataTileSwitchGroup,
}

