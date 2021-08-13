


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
        console.warn(`:getIn 'no such key' :key ${key}`);
        return undefined;
    }, collection);
}

function filterIn(coll, prop, value) {
    return first(coll.filter(x => x[prop] === value));
}

function filterByValue(obj, value) {
    return Object.entries(obj).filter(kv => kv[1] === value);
}

function findByValue(obj, value) {
    return first(first(filterByValue(obj, value)));
}

function splitAt(xs, at) {
    if(!isArray(xs)) throw new Error(`splitAt takes an array: ${xs}`);
    let i = -1;
    return xs.reduce((acc, x) => {
        if((equals(x, at)) || (equals(acc.length, 0) && !equals(x, at))) {
            acc.push([x]); i++;
        } else {
            acc[i].push(x);
        }
        return acc;
    },[]);
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

// Math
function digits(n) {
    return Math.log(n) * Math.LOG10E + 1 | 0;
}

function rand(min = 0, max = 10) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function gte(a, b) { return a >= b; }
function lte(a, b) { return a <= b; }
function gt(a, b) { return a > b; }
function lt(a, b) { return a < b; }

function inRange(min, max, value, lb=gte, ub=lte) {
    return (lb(value, min) && ub(value, max));
}

function fixInRange(min, max, value) {
    if(value >= max) {
        return max;
    } else if(value < min) {
        return min;
    } else {
        return value;
    }
}

function divisors(number) {
    let divisors = [1];
    for(let i=2; i < number/2; i++) {
        if(number % i === 0) { divisors.push(i); }
    }
    return divisors;
}

function toDecimalPoint (x, point = 2) {
    return Number((x).toFixed(point));
}

const bod = Math.pow(2, 31) / 180;
const dob = 180 / Math.pow(2, 31);

function degToSemicircles(degrees) {
    return degrees * bod;
}

function semicirclesToDeg(semicircles) {
    return semicircles * dob;
}

// Util
function secondsToHms(elapsed, compact = false) {
    let hour = Math.floor(elapsed / 3600);
    let min  = Math.floor(elapsed % 3600 / 60);
    let sec  = elapsed % 60;
    let sD   = (sec < 10)  ? `0${sec}`  : `${sec}`;
    let mD   = (min < 10)  ? `0${min}`  : `${min}`;
    let hD   = (hour < 10) ? `0${hour}` : `${hour}`;
    let hDs  = (hour < 10) ? `${hour}`  : `${hour}`;
    let res  = ``;
    if(compact) {
        if(elapsed < 3600) {
            res = `${mD}:${sD}`;
        } else {
            res = `${hD}:${mD}:${sD}`;
        }
    } else {
        res = `${hD}:${mD}:${sD}`;
    }
    return res ;
}

function timeDiff(timestamp1, timestamp2) {
    let difference = (timestamp1 / 1000) - (timestamp2 / 1000);
    return Math.round(Math.abs(difference));
};

function dateToDashString(date) {
    const day    = (date.getDate()).toString().padStart(2, '0');
    const month  = (date.getMonth()+1).toString().padStart(2, '0');
    const year   = date.getFullYear().toString();
    const hour   = (date.getHours()).toString().padStart(2, '0');
    const minute = (date.getMinutes()).toString().padStart(2, '0');
    return `${day}-${month}-${year}-at-${hour}-${minute}h`;
}

function format(x, precision = 1000) {
    return Math.round(x * precision) / precision;
}

function kphToMps(kph) {
    return format(kph / 3.6);
};

function mpsToKph(mps) {
    return 3.6 * mps;
};

function scale(value, max = 100) {
    return 100 * (value/max);
}

function stringToBool(str) {
    if(str === 'true') return true;
    if(str === 'false') return false;
    return false;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Bits
function dataviewToArray(dataview) {
    return Array.from(new Uint8Array(dataview.buffer));
}

function nthBit(field, bit) {
    return (field >> bit) & 1;
};

function bitToBool(bit) {
    return !!(bit);
};

function nthBitToBool(field, bit) {
    return bitToBool(nthBit(field, bit));
}

function getBitField(field, bit) {
    return (field >> bit) & 1;
};

function getUint16(uint8array, index = 0, endianness = true) {
    let dataview = new DataView(uint8array.buffer);
    return dataview.getUint16(index, dataview, endianness);
}

function getUint32(uint8array, index = 0, endianness = true) {
    let dataview = new DataView(uint8array.buffer);
    return dataview.getUint32(index, dataview, endianness);
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

function hex(n) {
    let h = parseInt(n).toString(16).toUpperCase();
    if(h.length === 1) {
        h = '0'+ h;
    }
    return '0x' + h;
}

function dataviewToString(dataview) {
    let utf8decoder = new TextDecoder('utf-8');
    return utf8decoder.decode(dataview.buffer);
}

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
    getIn,
    filterIn,
    filterByValue,
    findByValue,
    splitAt,
    avg,
    max,
    sum,

    // math
    digits,
    rand,
    gte,
    lte,
    gt,
    lt,
    inRange,
    fixInRange,
    toDecimalPoint,
    divisors,

    // utils
    secondsToHms,
    timeDiff,
    dateToDashString,
    format,
    kphToMps,
    mpsToKph,
    scale,
    stringToBool,
    capitalize,

    // bits
    dataviewToArray,
    nthBit,
    bitToBool,
    nthBitToBool,
    getBitField,
    getUint16,
    getUint32,
    fromUint16,
    fromUint32,
    toUint8Array,
    xor,
    hex,
    dataviewToString,

    // async
    delay,

    // events
    xf,
};
