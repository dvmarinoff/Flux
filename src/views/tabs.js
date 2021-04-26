import { xf, exists, equals, prn } from '../functions.js';

class TabBtn extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.effect = this.getAttribute('effect') || '';
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

class TabBtnGroup extends HTMLElement {
    constructor() {
        super();
        this.group = this.getAttribute('group') || '';
        this.btnSelector = this.defaultBtnSelector();
        this.btns = this.querySelectorAll(this.btnSelector);
        this.btns.forEach(btn => btn.addEventListener('pointerup', this.onChange.bind(this)));
    }
    defaultBtnSelector() { return 'tab-btn'; }
    connectedCallback() {}
    disconnectedCallback() {
        this.removeEventListener('pointerup', this.onChange);
    }
    onChange(e) {
        const target = e.currentTarget;
        this.btns.forEach(btn => {
            if(btn === target) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

class TabGroup extends HTMLElement {
    constructor() {
        super();
        this.tabClass = this.defaultTabSelector();
        this.tabAttr = this.defaultTabAttr();
        this.prop = this.getAttribute('prop') || '';
        this.tabs = this.querySelectorAll(this.tabClass);
    }
    defaultTabSelector() { return '.tab'; }
    defaultTabAttr() { return 'tab'; }
    connectedCallback() {
        xf.sub(`db:${this.prop}`, this.onUpdate.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener(`db:${this.prop}`, this.onUpdate);
    }
    onUpdate(param) {
        this.tabs.forEach(tab => {
            if(this.getId(tab) === param) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
    getId(tab) {
        return tab.getAttribute(this.tabAttr);
    }
}

customElements.define('tab-btn', TabBtn);
customElements.define('tab-btn-group', TabBtnGroup);
customElements.define('tab-group', TabGroup);



class PageBtn extends TabBtn {}
class PageBtnGroup extends TabBtnGroup {
    defaultBtnSelector() { return 'page-btn'; }
}
class PageGroup extends TabGroup {
    defaultTabSelector() { return '.page'; }
    defaultTabAttr() { return 'page'; }
}

customElements.define('page-btn', PageBtn);
customElements.define('page-btn-group', PageBtnGroup);
customElements.define('page-group', PageGroup);

export { TabBtn, TabBtnGroup, TabGroup };
