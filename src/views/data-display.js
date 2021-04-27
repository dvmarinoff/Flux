import { xf, exists, equals, secondsToHms, formatDistance, prn } from '../functions.js';

class DataDisplay extends HTMLElement {
    constructor() {
        super();
        this.state = '';
        this.postInit();
    }
    postInit() { return; }
    connectedCallback() {
        this.prop = this.getAttribute('prop');
        this.path = this.getAttribute('path') || false;
        xf.sub(`db:${this.prop}`, this.onUpdate.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener(`db:${this.prop}`, this.onUpdate);
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
        this.textContent = this.state;
    }
}

customElements.define('data-display', DataDisplay);


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
        this.measurement = 'metric';
        xf.sub(`db:measurement`, this.onMeasurement.bind(this));
    }
    onMeasurement(measurement) { this.measurement = measurement; }
    render() {
        // this.textContent = formatDistance(this.state, this.measurement);
        this.textContent = '--';
    }
}

customElements.define('distance-display', DistanceDisplay);

export { DataDisplay, TimeDisplay };
