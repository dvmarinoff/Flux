let sin    = x => Math.sin(x);
let cos    = x => Math.cos(x);
let arctan = x => Math.atan(x);
let abs    = x => Math.abs(x);
let round  = x => Math.round(x);
let floor  = x => Math.floor(x);
let ceil   = x => Math.ceil(x);
let exp    = x => Math.exp(x);
let sqr    = x => x * x;
let avg    = (x, y) => (x + y) / 2;
let last   = xs => xs[xs.length - 1];
let first  = xs => xs[0];
let format = (x, precision = 1000) => round(x * precision) / precision;
let mps    = kph => format(kph / 3.6);
let kph    = mps => 3.6 * mps;

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

function metersToDistance(meters) {
    let km = (meters / 1000);
    let s = (meters < 1000) ? `${meters.toFixed(0)} m`  : `${km.toFixed(2)} km`;
    return s;
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
    return '0x' + parseInt(n).toString(16).toUpperCase();
}

function dataViewToString (dataview) {
    let len = dataview.byteLength;
    let str = '';
    for(let i = 0; i < len; i++) {
        str += hexToString(hex(dataview.getUint8(i, true)));
    }
    return str;
}

export {
    sin,
    cos,
    arctan,
    abs,
    sqr,
    exp,
    mps,
    kph,
    avg,
    avgOfArray,
    maxOfArray,
    sum,
    first,
    last,
    round,
    floor,
    ceil,
    hexToString,
    stringToHex,
    hex,
    dataViewToString,
    powerToZone,
    hrToColor,
    valueToHeight,
    timeDiff,
    secondsToHms,
    metersToDistance };
