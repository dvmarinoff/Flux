import { xf, exists, equals, prn } from '../functions.js';
import { q } from './q.js';

function Switch(args) {
    if(!exists(args)) { args = false; }
    const onClass = args.onClass || defaultOnClass();
    const offClass = args.offClass || defaultOffClass();
    const loadingClass = args.loadingClass || defaultLoadingClass();

    function defaultOnClass() { return 'on'; }
    function defaultOffClass() { return 'off'; }
    function defaultLoadingClass() { return 'loading'; }

    function on() {
        const dom = args.dom;
        dom.indicator.classList.remove(loadingClass);
        dom.indicator.classList.remove(offClass);
        dom.indicator.classList.add(onClass);
        return {on: true, off: false, loading: false};
    }
    function off() {
        const dom = args.dom;
        dom.indicator.classList.remove(loadingClass);
        dom.indicator.classList.remove(onClass);
        dom.indicator.classList.add(offClass);
        return {on: false, off: true, loading: false};
    }
    function loading() {
        const dom = args.dom;
        dom.indicator.classList.remove(offClass);
        dom.indicator.classList.remove(onClass);
        dom.indicator.classList.add(loadingClass);
        return {on: false, off: false, loading: true};
    }
    return { on, off, loading };
}

function ConnectionSwitch(args) {
    let dom = args.dom;
    let name = args.name;

    const switchBtn = Switch({dom: dom});

    xf.sub('pointerup', e => xf.dispatch(`ui:${name}:switch`), dom.switchBtn);

    xf.sub(`${name}:connected`, e => {
        switchBtn.on();
    });
    xf.sub(`${name}:disconnected`, e => {
        switchBtn.off();
    });
    xf.sub(`${name}:connecting`, e => {
        switchBtn.loading();
    });
}

function ConnectionSwitches() {
    let dom = {
        controllable: {
            switchBtn: q.get('#switch-controllable'),
            indicator: q.get('#switch-controllable .switch--indicator'),
        },
        hrm: {
            switchBtn: q.get('#switch-hrm'),
            indicator: q.get('#switch-hrm .switch--indicator'),
        },
    };

    ConnectionSwitch({name: 'hrm', dom: dom.hrm});
    ConnectionSwitch({name: 'controllable', dom: dom.controllable});
}


class ViewModel {
    constructor(args) {
        this.prop = args.prop;
        this.default = args.default || this.defaultValue();
        this.prev = args.default;
        this.renderers = args.renderers || [this.defaultRenderer.bind(this)];
        this.init();
    }
    init() {
        const self = this;
        xf.sub(`${self.prop}`, self.onUpdate.bind(self));
    }
    onUpdate(value) {
        const self = this;
        self.renderers.forEach(renderer => renderer(value, self.prev));
        self.prev = value;
    }
    defaultValue() { return ''; }
    defaultRenderer(value, prev) {
        const self = this;
        if(equals(value, prev)) return;
        console.log(`:${self.prop} ${value}`);
    }
}

function ViewModels() {
    let dom = {
        heartRate: q.get(`#heart-rate-value`),
        power: q.get(`#power-value`),

        powerTargetInput: q.get(`#power-target-input`),
        powerTargetInc: q.get(`#power-target-inc`),
        powerTargetDec: q.get(`#power-target-dec`),
    };

    function heartRateToDom(value, prev) {
        dom.heartRate.textContent = `${value}`;
    }
    function powerToDom(value, prev) {
        dom.power.textContent = `${value}`;
    }
    function powerTargetToDom(value, prev) {
        dom.powerTarget.textContent = `${value}`;
    }

    const heartRate   = new ViewModel({prop: `heartRate`, default: '--', renderers: [heartRateToDom]});
    const power       = new ViewModel({prop: `power`, default: '--', renderers: [powerToDom]});
    const powerTarget = new ViewModel({prop: `powerTarget`, default: '--', renderers: [powerTargetToDom]});

    let vms = { heartRate, power, powerTarget };

    return vms;
}

function start() {
    prn('start views.');

    ConnectionSwitches();
    ViewModels();
}

start();
