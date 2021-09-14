import { xf, exists, equals } from '../functions.js';
import { secondsToHms, stringToBool } from '../utils.js';
import { models } from '../models/models.js';

class DataDisplay extends HTMLElement {
    constructor() {
        super();
        this.state = '';
        this.postInit();
    }
    postInit() { return; }
    static get observedAttributes() {
        return ['disabled'];
    }
    connectedCallback() {
        this.prop = this.getAttribute('prop');
        this.path = this.getAttribute('path') || false;

        if(this.hasAttribute('disabled')) {
            this.disabled = true;
        } else {
            this.disabled = false;
        }

        xf.sub(`db:${this.prop}`, this.onUpdate.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener(`db:${this.prop}`, this.onUpdate);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'disabled') {
            this.disabled = newValue === null ? false : true;
        }
    }
    onUpdate(value) {
        if(!equals(value, this.state)) {
            if(this.path) {
                this.state = value[this.path];
            } else {
                this.state = value;
            }
            this.render();
        }
    }
    render() {
        if(this.disabled) return;
        this.textContent = this.state;
    }
}

customElements.define('data-display', DataDisplay);

class EffectDisplay extends HTMLElement {
    constructor() {
        super();
        this.state = '';
    }
    connectedCallback() {
        this.effect = this.getAttribute('effect');
        xf.sub(`${this.effect}`, this.onEffect.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener(`${this.effect}`, this.onEffect);
    }
    onEffect(value) {
        if(!equals(value, this.state)) {
            this.state = value;
            this.render();
        }
    }
    render() {
        this.textContent = this.state;
    }
}

customElements.define('effect-display', EffectDisplay);

class TimeDisplay extends DataDisplay {
    postInit() {
        this.state = 0;
        this.form = this.getAttribute('form') || this.defaultForm();

        this.compact = false;
        if(this.form === 'hh:mm:ss') this.compact = false;
        if(this.form === 'mm:ss') this.compact = true;
    }
    defaultForm() { return 'hh:mm:ss'; }
    render() {
        this.textContent = secondsToHms(this.state, this.compact);
    }
}

customElements.define('time-display', TimeDisplay);



class DistanceDisplay extends DataDisplay {
    postInit() {
        this.measurement = models.measurement.default;
        this.unit = ``;
        this.dom = {
            unit: this.querySelector(`unit`),
            value: this.querySelector(`value`)
        };
        xf.sub(`db:measurement`, this.onMeasurement.bind(this));
    }
    onMeasurement(measurement) {
        this.measurement = measurement;
    }
    mToYd(meters) {
        return 1.09361 * meters;
    }
    formatDistance(meters, measurement) {
        let value = `0`;
        const km    = (meters / 1000);
        const miles = (meters / 1609.34);
        const yards = this.mToYd(meters);

        if(measurement === 'imperial') {
            const yardsTemplate = `${(this.mToYd(meters)).toFixed(0)}`;
            const milesTemplate = `${miles.toFixed(2)}`;
            return value = (yards < 1609.34) ? yardsTemplate : milesTemplate;
        } else {
            const metersTemplate = `${meters.toFixed(0)}`;
            const kmTemplate = `${km.toFixed(2)}`;
            return value = (meters < 1000) ? metersTemplate : kmTemplate;
        }
    }
    formatUnit(meters, measurement) {
        let value = ``;
        if(measurement === 'imperial') {
            const yards = this.mToYd(meters);
            return value = (yards < 1609.34) ? `yd` : `mi`;
        } else {
            return value = (meters < 1000) ? `m` : `km`;
        }
    }
    render() {
        this.dom.value.textContent = this.formatDistance(this.state, this.measurement);
        this.dom.unit.textContent = this.formatUnit(this.state, this.measurement);
    }
}

class SpeedDisplay extends DataDisplay {
    postInit() {
        this.measurement = models.measurement.default;
        this.unit = ``;
        this.dom = {
            unit: this.querySelector(`unit`),
            value: this.querySelector(`value`)
        };
        xf.sub(`db:measurement`, this.onMeasurement.bind(this));
    }
    onMeasurement(measurement) {
        this.measurement = measurement;
        if(measurement === 'imperial') {
            this.unit = ` mph`;
        } else {
            this.unit = ` kph`;
        }
    }
    kmhToMph(kmh) {
        return 0.621371 * kmh;
    };
    formatSpeed(value, measurement = models.measurement.default) {
        if(measurement === 'imperial') {
            value = `${this.kmhToMph(value).toFixed(1)}`;
        } else {
            value = `${(value).toFixed(1)}`;
        }
        return value;
    }
    renderUnit(text) {
        this.dom.unit.textContent = text;
    }
    render() {
        if(this.disabled) return;
        this.dom.value.textContent = this.formatSpeed(this.state, this.measurement);;
        this.dom.unit.textContent = this.unit;
    }
}

class UnitDisplay extends HTMLElement {
    constructor() {
        super();
        this.postInit();
    }
    postInit() {
        this.measurement = models.measurement.default;
        xf.sub(`db:measurement`, this.onMeasurement.bind(this));
    }
    onMeasurement(measurement) {
        this.measurement = measurement;
        this.render();
    }
    formatUnit(measurement = models.measurement.default) {
        if(measurement === 'imperial') {
            return `lbs`;
        } else {
            return `kg`;
        }
    }
    render() {
        this.textContent = this.formatUnit(this.measurement);
    }
}

customElements.define('distance-display', DistanceDisplay);
customElements.define('speed-display', SpeedDisplay);
customElements.define('unit-display', UnitDisplay);

class BatteryDisplay extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.state = '--';
        this.effect = this.getAttribute('effect');

        xf.sub(`${this.effect}`, this.onEffect.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener(`${this.effect}`, this.onEffect);
    }
    onEffect(data) {
        if('level' in data) {
            this.state = data.level;
            this.render();
        }
    }
    render() {
        this.textContent = this.state;
    }
}

customElements.define('battery-display', BatteryDisplay);

class DeviceInfoDisplay extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        const self = this;
        this.state = { manufacturer: '--' };
        this.effect = this.getAttribute('effect');
        xf.sub(`${self.effect}`, this.onEffect.bind(this));
        console.log(this.effect);
    }
    disconnectedCallback() {
        document.removeEventListener(`${this.effect}`, this.onEffect);
    }
    onEffect(data) {
        if('manufacturer' in data) {
            this.state.manufacturer = data.manufacturer;
            this.render();
        }
    }
    render() {
        this.textContent = this.state.manufacturer;
    }
}

customElements.define('device-info-display', DeviceInfoDisplay);


export { DataDisplay, TimeDisplay };
