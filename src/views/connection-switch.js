import { xf, exists, equals, prn } from '../functions.js';

class ConnectionSwitch extends HTMLElement {
    constructor() {
        super();
        this.status = 'off';
    }
    connectedCallback() {
        this.name         = this.getAttribute('name');
        this.onClass      = this.getAttribute('onClass')      || this.defaultOnClass();
        this.offClass     = this.getAttribute('offClass')     || this.defaultOffClass();
        this.loadingClass = this.getAttribute('loadingClass') || this.defaultLoadingClass();

        this.indicator = this.querySelector('.switch--indicator');

        xf.sub('pointerup',                 this.onEffect.bind(this), this);
        xf.sub(`${this.name}:connected`,    this.on.bind(this));
        xf.sub(`${this.name}:disconnected`, this.off.bind(this));
        xf.sub(`${this.name}:connecting`,   this.loading.bind(this));
    }
    defaultOnClass() { return 'on'; }
    defaultOffClass() { return 'off'; }
    defaultLoadingClass() { return 'loading'; }
    disconnectedCallback() {
        this.removeEventListener('pointerup', this.onEffect);
        document.removeEventListener(`${this.name}:connected`,    this.on);
        document.removeEventListener(`${this.name}:disconnected`, this.off);
        document.removeEventListener(`${this.name}:connecting`,   this.loading);
    }
    onEffect(e) {
        xf.dispatch(`ui:${this.name}:switch`);
    }
    on(e) {
        this.indicator.classList.remove(this.loadingClass);
        this.indicator.classList.remove(this.offClass);
        this.indicator.classList.add(this.onClass);
    }
    off(e) {
        this.indicator.classList.remove(this.loadingClass);
        this.indicator.classList.remove(this.onClass);
        this.indicator.classList.add(this.offClass);
    }
    loading(e) {
        this.indicator.classList.remove(this.offClass);
        this.indicator.classList.remove(this.onClass);
        this.indicator.classList.add(this.loadingClass);
    }
    render() {}
}

customElements.define('connection-switch', ConnectionSwitch);

export { ConnectionSwitch }
