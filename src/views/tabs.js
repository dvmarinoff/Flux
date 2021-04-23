import { xf, exists, equals, prn } from '../functions.js';

class Tabs extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.effect = this.getAttribute('effect');
        this.param = this.getAttribute('param') || '';
        this.addEventListener('pointerup', this.onEffect.bind(this));
    }
    disconnectedCallback() {
        this.removeEventListener('pointerup', this.onEffect);
    }
    onEffect(e) {
        xf.dispatch(`ui:${this.effect}`, this.param);
    }
}

customElements.define('ui-tabs', Tabs);

export { Tabs };
