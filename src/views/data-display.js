import { xf, exists, equals, prn } from '../functions.js';

class DataDisplay extends HTMLElement {
    constructor() {
        super();
        this.state = '';
    }
    connectedCallback() {
        this.prop = this.getAttribute('prop');
        xf.sub(`db:${this.prop}`, this.onUpdate.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener(`${this.prop}`, this.onUpdate);
    }
    onUpdate(value) {
        if(!equals(value, this.state)) {
            this.state = value;
            this.render();
        }
    }
    render() {
        this.textContent = this.state;
    }
}

customElements.define('data-display', DataDisplay);

export { DataDisplay };
