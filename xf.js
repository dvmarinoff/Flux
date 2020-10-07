let evt = name => value => new CustomEvent(name, {detail: {data: value}});

function dispatch (name, value) {
    document.dispatchEvent(evt(name)(value));
};
function reg (name, handler) {
    document.addEventListener(name, e => handler(e));
};
function sub(name, handler, el = false) {
    if(el) {
        el.addEventListener(name, e => handler(e));
    } else {
        document.addEventListener(name, e => handler(e));
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
