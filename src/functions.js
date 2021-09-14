//
// A collection of common functions that makes JS more functional
//


// Values
function equals(a, b) {
    return Object.is(a, b);
}

function isNull(x) {
    return Object.is(x, null);
}

function isUndefined(x) {
    return Object.is(x, undefined);
}

function exists(x) {
    if(isNull(x) || isUndefined(x)) { return false; }
    return true;
}

function existance(value, fallback) {
    if(exists(value))    return value;
    if(exists(fallback)) return fallback;
    throw new Error(`existance needs a fallback value `, value);
}

// Collections
function isArray(x) {
    return Array.isArray(x);
}

function isObject(x) {
    return equals(typeof x, 'object') && !(isArray(x));
}

function isCollection(x) {
    return isArray(x) || isObject(x);
}

function isString(x) {
    return equals(typeof x, 'string');
}

function empty(x) {
    if(isNull(x)) throw new Error(`empty called with null: ${x}`);
    if(!isCollection(x) && !isString(x) && !isUndefined(x)) {
        throw new Error(`empty takes a collection: ${x}`);
    }
    if(isUndefined(x)) return true;
    if(isArray(x))  {
        if(equals(x.length, 0)) return true;
    }
    if(isObject(x)) {
        if(equals(Object.keys(x).length, 0)) return true;
    }
    if(isString(x)) {
        if(equals(x, "")) return true;
    }
    return false;
};

function first(xs) {
    if(!isArray(xs) && !isString(xs) && !isUndefined(xs)) {
        throw new Error(`first takes ordered collection or a string: ${xs}`);
    }
    if(isUndefined(xs)) return undefined;
    if(empty(xs)) return undefined;
    return xs[0];
}

function second(xs) {
    if(!isArray(xs) && !isString(xs) && !isUndefined(xs)) {
        throw new Error(`second takes ordered collection or a string: ${xs}`);
    }
    if(isUndefined(xs)) return undefined;
    if(empty(xs)) return undefined;
    if(xs.length < 2) return undefined;
    return xs[1];
}

function third(xs) {
    if(!isArray(xs) && !isString(xs) && !isUndefined(xs)) {
        throw new Error(`third takes ordered collection or a string: ${xs}`);
    }
    if(isUndefined(xs)) return undefined;
    if(empty(xs)) return undefined;
    if(xs.length < 3) return undefined;
    return xs[2];
}

function last(xs) {
    if(!isArray(xs) && !isString(xs) && !isUndefined(xs)) {
        throw new Error(`last takes ordered collection or a string: ${xs}`);
    }
    if(isUndefined(xs)) return undefined;
    if(empty(xs)) return undefined;
    return xs[xs.length - 1];
}

function map(coll, fn) {
    if(isArray(coll)) return coll.map(fn);
    if(isObject(coll)) {
        return Object.fromEntries(
            Object.entries(coll).map(([k, v], i) => [k, (fn(v, k, i))]));
    }
    if(isString(coll)) {
        return coll.split('').map(fn).join('');
    }
    throw new Error(`map called with unkown collection `, coll);
}

function traverse(obj, fn = ((x) => x), acc = []) {

    function recur(fn, obj, keys, acc) {
        if(empty(keys)) {
            return acc;
        } else {
            let [k, ...ks] = keys;
            let v = obj[k];

            if(isObject(v)) {
                acc = recur(fn, v, Object.keys(v), acc);
                return recur(fn, obj, ks, acc);
            } else {
                acc = fn(acc, k, v, obj);
                return recur(fn, obj, ks, acc);
            }
        }
    }
    return recur(fn, obj, Object.keys(obj), acc);
}

function getIn(...args) {
    let [collection, ...path] = args;
    return path.reduce((acc, key) => {
        if(acc[key]) return acc[key];
        return undefined;
    }, collection);
}

function avg(xs, prop = false) {
    if(prop !== false) {
        return xs.reduce( (acc,v,i) => acc+(v[prop]-acc)/(i+1), 0);
    } else {
        return xs.reduce( (acc,v,i) => acc+(v-acc)/(i+1), 0);
    }
}

function max(xs, prop = false) {
    if(prop !== false) {
        return xs.reduce( (acc,v,i) => v[prop] > acc ? v[prop] : acc, 0);
    } else {
        return xs.reduce( (acc,v,i) => v > acc ? v : acc, 0);
    }
};

function sum(xs, path = false) {
    if(path !== false) {
        return xs.reduce( (acc,v,i) => acc + v[path], 0);
    } else {
        return xs.reduce( (acc,v,i) => acc + v, 0);
    }
};

// Functions
function compose2(f, g) {
    return function(...args) {
        return f(g(...args));
    };
}

function compose(...fns) {
    return fns.reduce(compose2);
}

function pipe(...fns) {
    return fns.reduceRight(compose2);
}

function repeat(n) {
    return function(f) {
        return function(x) {
            if (n > 0) {
                return repeat(n - 1)(f)(f(x));
            } else {
                return x;
            }
        };
    };
};

// Async
function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

// XF (Events)
function XF(args = {}) {
    let data = {};
    let name = args.name || 'db';

    function create(obj) {
        data = proxify(obj);
    }

    function proxify(obj) {
        let handler = {
            set: (target, key, value) => {
                target[key] = value;
                dispatch(`${name}:${key}`, target);
                return true;
            }
        };
        return new Proxy(obj, handler);
    }

    function dispatch(eventType, value) {
        document.dispatchEvent(evt(eventType)(value));
    }

    function sub(eventType, handler, element = false) {
        if(element) {
            element.addEventListener(eventType, handler, true);
            return handler;
        } else {
            function handlerWraper(e) {
                if(isStoreSource(eventType)) {
                    handler(e.detail.data[evtProp(eventType)]);
                } else {
                    handler(e.detail.data);
                }
            }

            document.addEventListener(eventType, handlerWraper, true);

            return handlerWraper;
        }
    }

    function reg(eventType, handler) {
        document.addEventListener(eventType, e => handler(e.detail.data, data));
    }

    function unsub(eventType, handler, element = false) {
        if(element) {
            element.removeEventListener(eventType, handler, true);
        } else {
            document.removeEventListener(eventType, handler, true);
        }
    }

    function isStoreSource(eventType) {
        return equals(evtSource(eventType), name);
    }

    function evt(eventType) {
        return function(value) {
            return new CustomEvent(eventType, {detail: {data: value}});
        };
    }

    function evtProp(eventType) {
        return second(eventType.split(':'));
    }

    function evtSource(eventType) {
        return first(eventType.split(':'));
    }

    return Object.freeze({ create, reg, sub, dispatch, unsub });
}

const xf = XF();

// Bits
function nthBit(field, bit) {
    return (field >> bit) & 1;
};

function bitToBool(bit) {
    return !!(bit);
};

function nthBitToBool(field, bit) {
    return bitToBool(nthBit(field, bit));
}

function dataviewToArray(dataview) {
    return Array.from(new Uint8Array(dataview.buffer));
}

function dataviewToString(dataview) {
    let utf8decoder = new TextDecoder('utf-8');
    return utf8decoder.decode(dataview.buffer);
}

function stringToCharCodes(str) {
    return str.split('').map(c => c.charCodeAt(0));
}

function stringToDataview(str) {
    let charCodes = stringToCharCodes(str);
    let uint8 = new Uint8Array(charCodes);
    let dataview = new DataView(uint8.buffer);

    return dataview;
}

function fromUint16(n) {
    let buffer = new ArrayBuffer(2);
    let view = new DataView(buffer);
    view.setUint16(0, n, true);
    return view;
}

function fromUint32(n) {
    let buffer = new ArrayBuffer(4);
    let view = new DataView(buffer);
    view.setUint32(0, n, true);
    return view;
}

function toUint8Array(n, type) {
    if(type === 32) return fromUint32(n);
    if(type === 16) return fromUint16(n);
    return n;
}

function xor(view) {
    let cs = 0;
    for (let i=0; i < view.byteLength; i++) {
        cs ^= view.getUint8(i);
    }
    return cs;
}

export {
    // values
    equals,
    isNull,
    isUndefined,
    exists,
    existance,

    // collections
    isArray,
    isObject,
    isString,
    isCollection,
    first,
    second,
    third,
    last,
    empty,
    map,
    traverse,
    avg,
    max,
    sum,
    getIn,

    // functions
    compose,
    pipe,
    repeat,

    // async
    delay,

    // events
    xf,

    // bits
    nthBit,
    bitToBool,
    nthBitToBool,
    dataviewToArray,
    dataviewToString,
    stringToCharCodes,
    toUint8Array,
    xor,
};

