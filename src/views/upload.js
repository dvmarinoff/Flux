import { xf } from '../functions.js';

class Upload extends HTMLInputElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.addEventListener('change', this.onSubmit.bind(this));
    }
    disconnectedCallback() {
       this.removeEventListener(`pointerup`, this.onSubmit);
    }
    onSubmit(e) {
        const file = e.target.files[0];
        xf.dispatch('ui:workout:upload', file);
    }
}

customElements.define('workout-upload', Upload, {extends: 'input'});
