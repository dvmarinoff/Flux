import { xf, exists, equals } from '../functions.js';
import { stringToBool } from '../utils.js';
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


export { DataDisplay };
