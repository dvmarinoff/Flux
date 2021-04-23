import { xf, exists, equals, prn } from '../functions.js';

class TargetInput extends HTMLInputElement {
    constructor() {
        super();
        this.state = 0;
    }
    connectedCallback() {
        this.prop = this.getAttribute('prop');
        this.effect = this.getAttribute('effect');
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
        xf.dispatch(`ui:${this.effect}`, parseInt(e.target.value));
    }
    render() {
        this.value = this.state;
    }
}

customElements.define('target-input', TargetInput, {extends: 'input'});



class EffectButton extends HTMLButtonElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.effect = this.getAttribute('effect');
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

export { TargetInput, EffectButton };
