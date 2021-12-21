import { xf, exists, existance, equals, avg, rand } from '../functions.js';
import { formatTime, stringToBool } from '../utils.js';
import { models } from '../models/models.js';
// import { scale } from '../utils.js';

//
// DataView
//
// Usage:
// <data-view id="count-value"
//            prop="db:count">--</data-view>
//
// Template Method:
// overwrite methods to augment the general logic
//
// getDefaults() -> setup default and fallback values
// config()      -> work with attributes and props here
// subs()        -> subscribe to events or db
// unsubs()      -> clean up subscribe to events or db
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
        return {};
    }
    config() {
        return;
    }
    subs() {
        xf.sub(`${this.prop}`, this.onUpdate.bind(this));
    }
    connectedCallback() {
        this.prop     = existance(this.getAttribute('prop'), this.getDefaults().prop);
        this.disabled = this.hasAttribute('disabled');

        this.config();
        this.subs();
    }
    unsubs() { return; }
    disconnectedCallback() {
        window.removeEventListener(`${this.prop}`, this.onUpdate);
        this.unsubs();
    }
    getValue(propValue) {
        return propValue;
    }
    shouldUpdate(value) {
        return !equals(value, this.state) && !this.disabled;
    }
    updataState(value) {
        this.state = value;
    }
    onUpdate(propValue) {
        const value = this.getValue(propValue);

        if(this.shouldUpdate(value)) {
            this.updataState(value);
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
    config() {
        xf.sub(`db:measurement`, this.onMeasurement.bind(this));
    }
    unsubs() {
        xf.unsub(`db:measurement`, this.onMeasurement.bind(this));
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
    config() {
        xf.sub(`db:measurement`, this.onMeasurement.bind(this));
    }
    unsubs() {
        xf.unsub(`db:measurement`, this.onMeasurement.bind(this));
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
        this.main = this.querySelector('cadence-value');
        this.aux = this.querySelector('cadence-target');
    }
    render() {
        if(equals(this.state, 0)) {
            this.main.classList.remove('active');
            this.aux.classList.remove('active');
        } else {
            this.main.classList.add('active');
            this.aux.classList.add('active');
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

class PowerAvg extends DataView {
    postInit() {
        this.prev = 0;
        this.length = 0;
    }
    getDefaults() {
        return {
            prop: 'db:power',
        };
    }
    subs() {
        xf.sub(`${this.prop}`, this.onUpdate.bind(this));
        xf.sub('watch:lap', this.onWatchLap.bind(this));
    }
    unsubs() {
        xf.unsub(`${this.prop}`, this.onUpdate.bind(this));
        xf.unsub('watch:lap', this.onWatchLap.bind(this));
    }
    updataState(value) {
        if(equals(this.state, 0) && equals(value, 0)) {
            this.state = 0;
        } else if(equals(value, 0)) {
            return;
        } else {
            this.length += 1;
            this.state = (value + ((this.length - 1) * this.state)) / this.length;
            // console.log(`${this.length} ---- ${this.state} //// ${value}`);
        }
    }
    onWatchLap() {
        this.reset();
    }
    reset() {
        this.length = 0;
    }
    transform(state) {
        return Math.floor(state);
    }
}

customElements.define('power-avg', PowerAvg);

class PowerValue extends DataView {
    postInit() {
        this.period = 1;
        this.buffer = [];
        this.bufferLength = 0;
    }
    subs() {
        xf.sub(`${this.prop}`, this.onUpdate.bind(this));
        xf.sub('db:powerSmoothing', this.onPowerSmoothing.bind(this));
    }
    unsubs() {
        xf.unsub(`${this.prop}`, this.onUpdate.bind(this));
        xf.unsub('db:powerSmoothing', this.onPowerSmoothing.bind(this));
    }
    getDefaults() {
        return {
            prop: 'db:power',
        };
    }
    canUpdate() {
        return this.bufferLength >= this.period;
    }
    shouldUpdate(value) {
        if(this.canUpdate()) {
            return !equals(value, this.state) && !this.disabled;
        } else {
            return false;
        }
    };
    onUpdate(propValue) {
        const value = this.getValue(propValue);

        this.buffer.push(value);
        this.bufferLength += 1;

        if(this.shouldUpdate()) {
            this.state = avg(this.buffer);
            this.buffer = [];
            this.bufferLength = 0;
            this.render();
        }
    }
    onPowerSmoothing(value) {
        this.period = value;
    }
    transform(state) {
        return Math.floor(state);
    }
}

customElements.define('power-value', PowerValue);

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
        this.graphWidth = this.calcGraphWidth();

        xf.sub(`db:${this.prop}`, this.onUpdate.bind(this));
        xf.sub(`db:${this.metric}`, this.onMetric.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener(`db:${this.prop}`, this.onUpdate);
        document.removeEventListener(`db:${this.metric}`, this.onMetric);
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


class SwitchGroup extends HTMLElement {
    constructor() {
        super();
        this.state = 0;
        this.postInit();
    }
    connectedCallback() {
        this.switchList = this.querySelectorAll('.switch-item');
        this.config();

        xf.sub(`db:${this.prop}`, this.onState.bind(this));
        this.addEventListener('pointerup', this.onSwitch.bind(this));
    }
    disconnectedCallback() {
        xf.unsub(`db:${this.prop}`, this.onState.bind(this));
        this.removeEventListener('pointerup', this.onSwitch.bind(this));
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
        this.switchList.forEach(function(s, i) {
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
        this.speed    = document.querySelector('#data-tile--speed');     // tab 0
        this.distance = document.querySelector('#data-tile--distance');  // tab 0
        this.powerAvg = document.querySelector('#data-tile--power-avg'); // tab 1
        this.slope    = document.querySelector('#data-tile--slope');     // tab 1
    }
    renderEffect(state) {
        if(equals(state, 0)) {
            this.speed.classList.add('active');
            this.distance.classList.add('active');
            this.powerAvg.classList.remove('active');
            this.slope.classList.remove('active');
        }
        if(equals(state, 1)) {
            this.speed.classList.remove('active');
            this.distance.classList.remove('active');
            this.powerAvg.classList.add('active');
            this.slope.classList.add('active');
        }
        return;
    }
}

customElements.define('data-tile-switch-group', DataTileSwitchGroup);

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

    SlopeTarget,
    PowerTarget,

    WorkoutName,

    InstantPowerGraph,

    SwitchGroup,
    DataTileSwitchGroup,
}
