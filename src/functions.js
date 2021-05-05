


// Values
function equals(a, b) {
    return Object.is(a, b);
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

function isNull(x) {
    return Object.is(x, null);
}

function isUndefined(x) {
    return Object.is(x, undefined);
}

function exists(x) {
    if(equals(x, null) || equals(x, undefined)) { return false; }
    return true;
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


// Util
function prn(str) {
    console.log(str);
}
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
function getBitField(field, bit) {
    return (field >> bit) & 1;
};
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

// Events
function evt(name) {
    return function(value) {
        return new CustomEvent(name, {detail: {data: value}});
    };
}

function evtSource(name) {
    return first(name.split(':'));
}

function evtProp(name) {
    return second(name.split(':'));
}

function unsub(name, handler) {
}

function isStoreSource(name) {
    return equals(evtSource(name), 'db');
}

// Store
class Store {
    name = 'db';
    constructor(args) {
        this.data = args.data;
    }
    create(data) {
        const self = this;
        self.data = self.proxify(data);
    }
    proxify(data) {
        const self = this;
        let handler = {
            set: (target, key, value) => {
                target[key] = value;
                self.dispatch(`${self.name}:${key}`, target);
                return true;
            }
        };
        return new Proxy(data, handler);
    }
    reg(name, handler) {
        const self = this;
        document.addEventListener(name, e => handler(e.detail.data, self.data));
    }
    sub(name, handler, el = false) {
        if(el) {
            el.addEventListener(name, e => {
                handler(e);
            }, true);
        } else {
            document.addEventListener(name, e => {
                if(isStoreSource(name)) {
                    handler(e.detail.data[evtProp(name)]);
                } else {
                    handler(e.detail.data);
                }
            }, true);
        }
    }
    unsub(name, handler) {
        document.removeEventListener(name, handler, true);
    }
    dispatch(name, value) {
        document.dispatchEvent(evt(name)(value));
    }
    get(prop) {
        const self = this;
        return self.data[prop];
    }
};

const xf = new Store({});

export {
    // values
    equals,
    exists,

    // collections
    isNull,
    isUndefined,
    isArray,
    isObject,
    isString,
    isCollection,
    first,
    second,
    third,
    last,
    empty,
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
    prn,
    secondsToHms,
    timeDiff,
    dateToDashString,
    kphToMps,
    mpsToKph,
    scale,

    // bits
    nthBit,
    bitToBool,
    nthBitToBool,
    getBitField,
    hex,
    dataviewToString,
    xor,

    // async
    delay,

    // events
    xf,
};
