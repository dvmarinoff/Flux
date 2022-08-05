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

        this.$indicator = this.querySelector(`.${this.indicatorClass}`) ?? this;

        this.addEventListener('pointerup', this.onEffect.bind(this), this.signal);
        xf.sub(`${this.for}:connected`,    this.on.bind(this), this.signal);
        xf.sub(`${this.for}:disconnected`, this.off.bind(this), this.signal);
        xf.sub(`${this.for}:connecting`,   this.loading.bind(this), this.signal);
    }
    disconnectedCallback() {
        this.abortController.abort();
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
    onEffect(e) {
        xf.dispatch(`ui:${this.for}:switch`);
    }
    on(e) {
        this.$indicator.classList.remove(this.loadingClass);
        this.$indicator.classList.remove(this.offClass);
        this.$indicator.classList.add(this.onClass);
        this.status = 'on';
    }
    off(e) {
        this.$indicator.classList.remove(this.loadingClass);
        this.$indicator.classList.remove(this.onClass);
        this.$indicator.classList.add(this.offClass);
        this.status = 'off';
    }
    loading(e) {
        this.$indicator.classList.remove(this.offClass);
        this.$indicator.classList.remove(this.onClass);
        this.$indicator.classList.add(this.loadingClass);
        this.status = 'loading';
    }
}

customElements.define('connection-switch', ConnectionSwitch);

class ProtocolSwitch extends ConnectionSwitch {
    constructor() {
        super();
        this.confirmMsg = "Proceeding will stop the ANT+ driver! Are you sure?";
    }
    getDefaults() {
        return {
            class: {
                on: 'on',
                off: 'off',
                loading: 'loading',
                indicator: 'this',
            },
        };
    }
    onEffect(e) {
        console.log(this.status);
        if(equals(this.status, 'on') || equals(this.status, 'loading')) {
            const proceed = confirm(this.confirmMsg);
            if(proceed) {
                xf.dispatch(`ui:${this.for}:switch`);
            }
        } else {
            xf.dispatch(`ui:${this.for}:switch`);
        }
    }
}

customElements.define('protocol-switch', ProtocolSwitch);

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

class ANTDeviceRequest extends HTMLElement {
    constructor() {
        super();
        this.devices = new Map();
        this.selected = undefined;
        this._status = 'closed';
        this.listSelector   = '.device-request--list';
        this.cancelSelector = '#device-request--cancel';
        this.pairSelector   = '#device-request--pair';
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
        console.log(this._status);
    }
    connectedCallback() {
        const self = this;
        this.abortController = new AbortController();
        this.signal = { signal: self.abortController.signal };

        this.$list      = this.querySelector(this.listSelector);
        this.$cancelBtn = this.querySelector(this.cancelSelector);
        this.$pairBtn   = this.querySelector(this.pairSelector);

        xf.sub(`ant:search:start`,  this.onStart.bind(this), this.signal);
        xf.sub(`ant:search:cancel`, this.onCancel.bind(this), this.signal);
        xf.sub(`ant:search:found`,  this.onFound.bind(this), this.signal);

        this.$list.addEventListener(`pointerup`, this.onSelectAction.bind(this), this.signal);
        this.$cancelBtn.addEventListener(`pointerup`, this.onCancelAction.bind(this), this.signal);
        this.$pairBtn.addEventListener(`pointerup`, this.onPairAction.bind(this), this.signal);
    }
    disconnectedCallback() {
        this.abortController.abort();
    }
    onStart() {
        this.open();
    }
    onCancel() {
        this.close();
    }
    onPair() {
        this.pair();
        this.close();
    }
    onFound(channelId) {
        this.add(channelId);
    }
    onLost(device) {
        this.remove(device);
    }
    onSelectAction(e) {
        const el = e.target.closest('.device-request--item');
        const els = this.$list.querySelectorAll('.device-request--item');

        if(el === undefined || el === null) return;
        if(el.id === undefined) return;

        els.forEach(el => el.classList.remove('active'));
        el.classList.add('active');

        this.select(parseInt(el.id));
    }
    onCancelAction() {
        xf.dispatch(`ant:search:cancel`);
    }
    onPairAction() {
        this.pair();
    }
    open() {
        this.status = 'opened';
        this.classList.add('active');
    }
    close() {
        this.status = 'closed';
        this.clear();
        this.classList.remove('active');
    }
    select(deviceNumber) {
        const channelId = this.devices.get(deviceNumber);
        this.selected = channelId;
        console.log(`:device-selected ${channelId}`);
    }
    pair() {
        this.status = 'pairing';
        this.close();
        xf.dispatch('ant:search:pair', this.selected);
    }
    deviceItemTemplate(args = { deviceNumber: '--', deviceType: '--'}) {
        return `<div class="device-request--item" id="${args.deviceNumber}">
        <div class="device-request--item--protocol">ANT+</div>
        <div class="device-request--item--number">${args.deviceNumber}</div>
        <div class="device-request--item--type">${args.deviceType}</div>
     </div>`;
    }
    add(channelId) {
        if(this.devices.has(channelId.deviceNumber)) return;

        this.devices.set(channelId.deviceNumber, channelId);
        const item = this.deviceItemTemplate(channelId);
        this.$list.insertAdjacentHTML('beforeend', item);
    }
    remove(device) {
        const item = this.$list.querySelector(`#${device.deviceNumber}`);
        this.$list.removeChild(item);
    }
    clear() {
        this.$list.innerHTML = '';
        this.devices = new Map();
    }
}

customElements.define('ant-device-request', ANTDeviceRequest);

export {
    ConnectionSwitch,
    SourceSwitch,
}
