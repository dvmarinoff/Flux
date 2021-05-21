import { xf, exists, equals, prn } from '../functions.js';
import { models } from '../models/models.js';

class IntInput extends HTMLInputElement {
    constructor() {
        super();
        this.state = 0;
        this.prop = this.getAttribute('prop');
        this.effect = this.getAttribute('effect');
        this.postInit();
    }
    postInit() { return; }
    connectedCallback() {
        this.addEventListener('change', this.onChange.bind(this));
        xf.sub(`db:${this.prop}`, this.onUpdate.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener(`db:${this.prop}`, this.onUpdate);
        this.removeEventListener('change', this.onChange);
    }
    onUpdate(value) {
        if(!equals(value, this.state)) {
            this.state = value;
            this.render();
        }
    }
    onChange(e) {
        this.state = parseInt(e.target.value);
        xf.dispatch(`ui:${this.effect}`, this.state);
    }
    render() {
        this.value = this.state;
    }
}

class FloatInput extends IntInput {
    postInit() {
        this.points = this.getAttribute('points') || 2;
    }
    onChange(e) {
        this.state = parseFloat(e.target.value);
        xf.dispatch(`ui:${this.effect}`, this.state);
    }
    render() {
        this.value = (this.state).toFixed(this.points);
    }
}

class WeightInput extends IntInput {
    postInit() {
        this.measurement = models.measurement.default;
        xf.sub(`db:measurement`, this.onMeasurement.bind(this));
    }
    onMeasurement(measurement) {
        this.measurement = measurement;
        this.render();
    }
    kgToLbs(kg) {
        return Math.round(2.20462 * kg);
    };
    parseKg(weight) {
        if(this.measurement === 'imperial') {
            return Math.round(0.453592 * weight);
        }
        return Math.round(weight);
    }
    formatWeight(value, measurement) {
        if(measurement === 'imperial') {
            value = `${this.kgToLbs(value)}`;
        } else {
            value = `${value}`;
        }
        return value;
    }
    onChange(e) {
        this.state = this.parseKg(e.target.value);
        xf.dispatch(`ui:${this.effect}`, this.state);
    }
    render() {
        this.value = this.formatWeight(this.state, this.measurement);
    }
}

customElements.define('int-input', IntInput, {extends: 'input'});
customElements.define('float-input', FloatInput, {extends: 'input'});
customElements.define('weight-input', WeightInput, {extends: 'input'});


class EffectButton extends HTMLButtonElement {
    constructor() {
        super();
        this.effect = this.getAttribute('effect');
    }
    connectedCallback() {
        this.addEventListener('pointerup', this.onEffect.bind(this));
    }
    disconnectedCallback() {
        this.removeEventListener('pointerup', this.onEffect);
    }
    onEffect(e) {
        xf.dispatch(`ui:${this.effect}`);
    }
}

customElements.define('effect-button', EffectButton, {extends: 'button'});

class SourceSwitch extends HTMLElement {
    constructor() {
        super();
        this.effect = this.getAttribute('effect');
        this.path = this.getAttribute('path');
        this.value = this.getAttribute('value');

        let dataDisplay = this.querySelector('data-display');
        let speedDisplay = this.querySelector('speed-display');
        if(exists(dataDisplay)) this.dataDisplay = dataDisplay;
        if(exists(speedDisplay)) this.dataDisplay = speedDisplay;

    }
    connectedCallback() {
        xf.sub(`db:sources`, this.onSources.bind(this));
        this.addEventListener('pointerup', this.onEffect.bind(this));
        this.render();
    }
    disconnectedCallback() {
        this.removeEventListener('pointerup', this.onEffect);
        this.removeEventListener(`${this.effect}`, this.onSources);
    }
    onSources(sources) {
        this.render();
    }
    onEffect(e) {
        let state = {};
        state[this.path] = this.value;
        xf.dispatch(`${this.effect}`, state);
    }
    disable() {
        this.classList.add('active');
        this.dataDisplay.removeAttribute('disabled');
    };
    enable() {
        this.classList.remove('active');
        this.dataDisplay.setAttribute('disabled', '');
    }
    render() {
        if(models.sources.isSource(this.path, this.value)) {
            this.disable();
        } else {
            this.enable();
        };
    }
}

customElements.define('source-switch', SourceSwitch);


class InputButton extends HTMLInputElement {
}

customElements.define('input-button', InputButton);


class SetButton extends HTMLButtonElement {
    constructor() {
        super();
        this.effect = this.getAttribute('effect');
        this.prop = this.getAttribute('prop');
        this.state = 0;
    }
    connectedCallback() {
        xf.sub(`db:${this.prop}`, this.onUpdate.bind(this));
        this.addEventListener('pointerup', this.onEffect.bind(this));
    }
    disconnectedCallback() {
        this.removeEventListener('pointerup', this.onEffect);
    }
    onEffect(e) {
        xf.dispatch(`ui:${this.effect}`, parseInt(this.state));
    }
    onUpdate(value) {
        this.state = value;
    }
}

customElements.define('set-button', SetButton, {extends: 'button'});


export { IntInput, FloatInput, EffectButton };
