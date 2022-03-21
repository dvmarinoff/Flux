import { xf, equals, exists, existance, } from '../functions.js';
import { models } from '../models/models.js';

class ConnectionSwitch extends HTMLElement {
    constructor() {
        super();
        this.status = 'off';
    }
    getDefaults() {
        return {
            class: {
                on: 'on',
                off: 'off',
                loading: 'loading',
                indicator: 'connection-switch--indicator',
            },
        };
    }
    connectedCallback() {
        const self = this;
        this.abortController = new AbortController();
        this.signal = { signal: self.abortController.signal };

        this.for            = this.getAttribute('for');
        this.onClass        = existance(this.getAttribute('onClass'), this.getDefaults().class.on);
        this.offClass       = existance(this.getAttribute('offClass'), this.getDefaults().class.off);
        this.loadingClass   = existance(this.getAttribute('loadingClass'), this.getDefaults().class.loading);
        this.indicatorClass = existance(this.getAttribute('indicatorClass'), this.getDefaults().class.indicator);

        this.$indicator = this.querySelector(`.${this.indicatorClass}`);

        this.addEventListener('pointerup', this.onEffect.bind(this), this.signal);
        xf.sub(`${this.for}:connected`,    this.on.bind(this), this.signal);
        xf.sub(`${this.for}:disconnected`, this.off.bind(this), this.signal);
        xf.sub(`${this.for}:connecting`,   this.loading.bind(this), this.signal);
    }
    defaultOnClass() {
        return ;
    }
    defaultOffClass() {
        return ;
    }
    defaultLoadingClass() {
        return ;
    }
    defaultIndicatorClass() {
        return ;
    }
    disconnectedCallback() {
        this.abortController.abort();
    }
    onEffect(e) {
        xf.dispatch(`ui:${this.for}:switch`);
    }
    on(e) {
        this.$indicator.classList.remove(this.loadingClass);
        this.$indicator.classList.remove(this.offClass);
        this.$indicator.classList.add(this.onClass);
    }
    off(e) {
        this.$indicator.classList.remove(this.loadingClass);
        this.$indicator.classList.remove(this.onClass);
        this.$indicator.classList.add(this.offClass);
    }
    loading(e) {
        this.$indicator.classList.remove(this.offClass);
        this.$indicator.classList.remove(this.onClass);
        this.$indicator.classList.add(this.loadingClass);
    }
}

customElements.define('connection-switch', ConnectionSwitch);

class SourceSwitch extends HTMLElement {
    constructor() {
        super();
        this.prop   = 'db:sources';
        this.effect = 'sources';
    }
    connectedCallback() {
        const self = this;
        this.abortController = new AbortController();
        this.signal = { signal: self.abortController.signal };

        this.path      = this.getAttribute('for');
        this.value     = this.getAttribute('use');
        this.$dataView = this.querySelector('.data-view');

        xf.sub(`${this.prop}`, this.onUpdate.bind(this), this.signal);
        this.addEventListener('pointerup', this.onEffect.bind(this), this.signal);
        this.render();
    }
    disconnectedCallback() {
        this.abortController.abort();
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
        this.$dataView.removeAttribute('disabled');
    };
    enable() {
        this.classList.remove('active');
        this.$dataView.setAttribute('disabled', '');
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
