let sin    = x => Math.sin(x);
let cos    = x => Math.cos(x);
let arctan = x => Math.atan(x);
let abs    = x => Math.abs(x);
let sqrt   = x => Math.sqrt(x);
let round  = x => Math.round(x);
let floor  = x => Math.floor(x);
let ceil   = x => Math.ceil(x);
let exp    = x => Math.exp(x);
let sqr    = x => x * x;
let avg    = (x, y) => (x + y) / 2;
let format = (x, precision = 1000) => round(x * precision) / precision;
let mps    = kph => format(kph / 3.6);
let kph    = mps => 3.6 * mps;
let mToYd  = m   => 1.09361 * m;
let mpsToMph   = mps => 2.23694  * mps;
let kmhToMph   = kmh => 0.621371 * kmh;
let kgToLbs    = kg  => parseInt(2.20462 * kg);
let lbsToKg    = lbs => (0.453592 * lbs);
let nextToLast = xs  => xs[xs.length - 2];

const empty   = (arr) => { return ( (arr === undefined) || !(arr.length > 0)); };
const delay   = ms => new Promise(res => setTimeout(res, ms));
const digits  = n => Math.log(n) * Math.LOG10E + 1 | 0;
const rand    = (min = 0, max = 10) => Math.floor(Math.random() * (max - min + 1) + min);

let last   = xs => xs[xs.length - 1];
let first  = xs => xs[0];
let second = xs => xs[1];
let third  = xs => xs[2];

function memberOf(xs, y) {
    return xs.filter(x => x === y).length > 0;
}

function isArray(x) {
    return Array.isArray(x);
}
function isObject(x) {
    return typeof x === 'object' && !isArray(x);
}
function conj(target, source) {
    return Object.assign(target, source);
}

function avgOfArray(xs, prop = false) {
    if(prop !== false) {
        return xs.reduce( (acc,v,i) => acc+(v[prop]-acc)/(i+1), 0);
    } else {
        return xs.reduce( (acc,v,i) => acc+(v-acc)/(i+1), 0);
    }
}

function maxOfArray(xs, prop = false) {
    if(prop !== false) {
        return xs.reduce( (acc,v,i) => v[prop] > acc ? v[prop] : acc, 0);
    } else {
        return xs.reduce( (acc,v,i) => v > acc ? v : acc, 0);
    }
};

function sum(xs, prop = false) {
    if(prop !== false) {
        return xs.reduce( (acc,v,i) => acc + v[prop], 0);
    } else {
        return xs.reduce( (acc,v,i) => acc + v, 0);
    }
};

function splitAt(xs, at) {
    let i = -1;
    return xs.reduce((acc, x) => {
        if((x === at) || (acc.length === 0 && x !== at)) {
            acc.push([x]); i++;
        } else {
            acc[i].push(x);
        }
        return acc;
    },[]);
}

function parseNumber(n, type = 'Int') {
    let value = 0;
    if(type === 'Int') {
        value = parseInt(n || 0);
    } else {
        value = parseFloat(n || 0);
    }
    return value;
};

function fixInRange(target, min, max) {
    if(target >= max) {
        return max;
    } else if(target < min) {
        return min;
    } else {
        return target;
    }
};

function powerToZone(value, ftp = 256) {
    let name = 'one';
    let hex   = '#636468';
    if(value < (ftp * 0.55)) {
        name = 'one';
    } else if(value < (ftp * 0.76)) {
        name = 'two';
    } else if(value < (ftp * 0.88)) {
        name = 'three';
    } else if(value < (ftp * 0.95)) {
        name = 'four';
    } else if(value < (ftp * 1.06)) {
        name = 'five';
    } else if (value < (ftp * 1.20)) {
        name = 'six';
    } else {
        name = 'seven';
    }
    return {name: name};
}

function valueToHeight(max, value) {
    return 100 * (value/max);
}

function hrToColor(value) {
    let color = 'gray';
    if(value < 100) {
        color = 'gray';
    } else if(value < 120) {
        color = 'blue';
    } else if(value < 160) {
        color = 'green';
    } else if(value < 175) {
        color = 'yellow';
    } else if(value < 190) {
        color = 'orange';
    } else {
        color = 'red';
    }
    return color;
}

function dateToDashString(date) {
    const day    = (date.getDate()).toString().padStart(2, '0');
    const month  = (date.getMonth()+1).toString().padStart(2, '0');
    const year   = date.getFullYear().toString();
    const hour   = (date.getHours()).toString().padStart(2, '0');
    const minute = (date.getMinutes()).toString().padStart(2, '0');
    return `${day}-${month}-${year}-at-${hour}-${minute}h`;
}

function timeDiff(timestamp1, timestamp2) {
    let difference = (timestamp1 / 1000) - (timestamp2 / 1000);
    return round(abs(difference));
};

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


function formatSpeed(value, measurement = 'metric') {
    if(measurement === 'imperial') {
        value = `${kmhToMph(value).toFixed(1)}`;
    } else {
        value = `${(value).toFixed(1)}`;
    }
    return value;
}

function formatDistance(meters, measurement = 'metric') {
    let value = `0`;
    let km    = (meters / 1000);
    let miles = (meters / 1609.34);
    let yards = mToYd(meters);

    if(measurement === 'imperial') {
        value = (yards < 1609.34) ? `${(mToYd(meters)).toFixed(0)} yd` : `${miles.toFixed(2)} mi`;
    } else {
        value = (meters < 1000) ? `${meters.toFixed(0)} m` : `${km.toFixed(2)} km`;
    }

    return value;
}

function toDecimalPoint (x, point = 2) {
    return Number((x).toFixed(point));
}

function divisors(number) {
    let divisors = [1];
    for(let i=2; i < number/2; i++) {
        if(number % i === 0) { divisors.push(i); }
    }
    return divisors;
}

function hexToString(str) {
    var j;
    var hexes = str.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }
    return back;
}

function stringToHex(str) {
    var hex, i;
    var result = "";
    for (i=0; i<str.length; i++) {
        hex = str.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }
    return result;
}

function hex (n) {
    let h = parseInt(n).toString(16).toUpperCase();
    if(h.length === 1) {
        h = '0'+ h;
    }
     return '0x' + h;
}

function arrayToString(array) {
    return String.fromCharCode.apply(String, array);
}

function dataViewToString (dataview) {
    let len = dataview.byteLength;
    let str = '';
    for(let i = 0; i < len; i++) {
        let value = dataview.getUint8(i, true);
        if(value === 0) {
            str += '';
        } else {
            str += hexToString(hex(value));
        }
    }
    return str;
}

const nthBit       = (field, bit) => (field >> bit) & 1;
const toBool       = (bit) => !!(bit);
const nthBitToBool = (field, bit) => toBool(nthBit(field, bit));

function xor(view) {
    let cs = 0;
    for (let i=0; i < view.byteLength; i++) {
        cs ^= view.getUint8(i);
    }
    return cs;
}

function exists(x) {
    if(x === null || x === undefined) {
        return false;
    }
    return x;
}

function isSet(x, msg = 'Does not exist!') {
    if(x === null || x === undefined) {
        return false;
    }
    return true;
}

export {
    sin,
    cos,
    arctan,
    abs,
    sqr,
    exp,
    sqrt,
    mps,
    kph,
    mpsToMph,
    kmhToMph,
    kgToLbs,
    lbsToKg,
    avg,
    rand,
    digits,
    conj,
    first,
    second,
    third,
    last,
    nextToLast,
    empty,
    avgOfArray,
    maxOfArray,
    sum,
    splitAt,
    memberOf,
    delay,
    parseNumber,
    toDecimalPoint,
    divisors,
    fixInRange,
    round,
    floor,
    ceil,
    hexToString,
    stringToHex,
    hex,
    arrayToString,
    dataViewToString,

    nthBit,
    toBool,
    nthBitToBool,

    powerToZone,
    hrToColor,
    valueToHeight,
    dateToDashString,
    timeDiff,
    secondsToHms,
    formatDistance,
    formatSpeed,
    xor,
    exists,
    isSet
};
