const evt       = name => value => new CustomEvent(name, {detail: {data: value}});
const evtSource = name => name.split(':')[0];
const evtProp   = name => name.split(':')[1];
const dbSource  = name => name.startsWith('db');

function dispatch (name, value) {
    document.dispatchEvent(evt(name)(value));
};
function reg (name, handler) {
    document.addEventListener(name, e => handler(e.detail.data));
};
function sub(name, handler, el = false) {
    if(el) {
        el.addEventListener(name, e => handler(e));
    } else {
        document.addEventListener(name, e => {
            dbSource(name) ? handler(e.detail.data[evtProp(name)]) : handler(e.detail.data) ;
            // handler(e);
        });
    }
};

let xf = {
    evt: evt,
    dispatch: dispatch,
    reg: reg,
    sub: sub
};

function DB(data) {
    let handler = {
        set: (target, key, value) => {
            target[key] = value;
            dispatch(`db:${key}`, target);
            return true;
        }
    };
    return new Proxy(data, handler);
}

export { xf, DB };
