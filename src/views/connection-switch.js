import { xf, equals, exists, existance, } from '../functions.js';
import { models } from '../models/models.js';

class ConnectionSwitch extends HTMLElement {
    constructor() {
        super();
        this.status = 'off';
    }
    connectedCallback() {
        this.for            = this.getAttribute('for');
        this.onClass        = existance(this.getAttribute('onClass'), this.defaultOnClass());
        this.offClass       = existance(this.getAttribute('offClass'), this.defaultOffClass());
        this.loadingClass   = existance(this.getAttribute('loadingClass'), this.defaultLoadingClass());
        this.indicatorClass = existance(this.getAttribute('indicatorClass'), this.defaultIndicatorClass());

        this.indicator = this.querySelector(`.${this.indicatorClass}`);

        xf.sub('pointerup',                this.onEffect.bind(this), this);
        xf.sub(`${this.for}:connected`,    this.on.bind(this));
        xf.sub(`${this.for}:disconnected`, this.off.bind(this));
        xf.sub(`${this.for}:connecting`,   this.loading.bind(this));
    }
    defaultOnClass() {
        return 'on';
    }
    defaultOffClass() {
        return 'off';
    }
    defaultLoadingClass() {
        return 'loading';
    }
    defaultIndicatorClass() {
        return 'connection-switch--indicator';
    }
    disconnectedCallback() {
        this.removeEventListener('pointerup', this.onEffect);
        document.removeEventListener(`${this.for}:connected`,    this.on);
        document.removeEventListener(`${this.for}:disconnected`, this.off);
        document.removeEventListener(`${this.for}:connecting`,   this.loading);
    }
    onEffect(e) {
        xf.dispatch(`ui:${this.for}:switch`);
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

class SourceSwitch extends HTMLElement {
    constructor() {
        super();
        this.prop   = 'db:sources';
        this.effect = 'sources';
    }
    connectedCallback() {
        this.path     = this.getAttribute('for');
        this.value    = this.getAttribute('use');
        this.dataView = this.querySelector('.data-view');

        xf.sub(`${this.prop}`, this.onUpdate.bind(this));
        this.addEventListener('pointerup', this.onEffect.bind(this));
        this.render();
    }
    disconnectedCallback() {
        xf.unsub(`${this.prop}`, this.onUpdate.bind(this));
        this.removeEventListener('pointerup', this.onEffect.bind(this));
    }
    onUpdate(sources) {
        this.render();
    }
    onEffect(e) {
        const update = {};
        update[this.path] = this.value;
        xf.dispatch(`${this.effect}`, update);
    }
    disable() {
        this.classList.add('active');
        this.dataView.removeAttribute('disabled');
    };
    enable() {
        this.classList.remove('active');
        this.dataView.setAttribute('disabled', '');
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

export {
    ConnectionSwitch,
    SourceSwitch,
}
