import { xf, exists, equals, prn } from '../functions.js';

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

customElements.define('int-input', IntInput, {extends: 'input'});
customElements.define('float-input', FloatInput, {extends: 'input'});



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


class InputButton extends HTMLInputElement {
}

customElements.define('input-button', InputButton);


class SetButton extends HTMLButtonElement {
    constructor() {
        super();
        this.effect = this.getAttribute('effect');
        this.prop = this.getAttribute('prop');
        this.state = this.value;
    }
    connectedCallback() {
        xf.sub(`${this.prop}`, this.onUpdate.bind(this));
        this.addEventListener('pointerup', this.onEffect.bind(this));
    }
    disconnectedCallback() {
        this.removeEventListener('pointerup', this.onEffect);
    }
    onEffect(e) {
        xf.dispatch(`ui:${this.effect}`, this.state);
    }
    onUpdate(value) {
        this.state = value;
    }
}

customElements.define('set-button', SetButton, {extends: 'button'});

export { IntInput, FloatInput, EffectButton };
