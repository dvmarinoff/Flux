const evt       = name => value => new CustomEvent(name, {detail: {data: value}});
const evtSource = name => name.split(':')[0];
const evtProp   = name => name.split(':')[1];
const dbSource  = name => name.startsWith('db');

class XF {
    constructor() {
        this.db = {};
    }
    reg(name, handler) {
        let self = this;
        document.addEventListener(name, e => handler(e.detail.data, self.db));
    }
    sub(name, handler, el = false) {
        if(el) {
            el.addEventListener(name, e => {
                handler(e);
            });
        } else {
            document.addEventListener(name, e => {
                dbSource(name) ? handler(e.detail.data[evtProp(name)]) : handler(e.detail.data) ;
            });
        }
    }
    dispatch(name, value) {
        document.dispatchEvent(evt(name)(value));
    }
    remove(name, handler) {
        document.removeEventListener(name, handler);
    }
    store(data) {
        let self = this;
        let handler = {
            set: (target, key, value) => {
                target[key] = value;
                self.dispatch(`db:${key}`, target);
                return true;
            }
        };
        return new Proxy(data, handler);
    }
    initDB(data) {
        let self = this;
        self.db = self.store(data);
    }
};

let xf = new XF();

export { xf };
