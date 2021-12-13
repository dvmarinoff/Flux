import { xf, exists, existance, equals, avg } from '../functions.js';
import { formatTime, stringToBool } from '../utils.js';

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
            this.disabled = exists(newValue) ? false : true;
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

export {
    DataView,

    TimerTime,
    IntervalTime,
    CadenceValue,
    CadenceTarget,
    HeartRateValue,
    PowerAvg,
    PowerValue,

    SlopeTarget,
    PowerTarget,

    WorkoutName,
}
