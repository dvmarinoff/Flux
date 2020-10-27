let sin    = x => Math.sin(x);
let cos    = x => Math.cos(x);
let arctan = x => Math.atan(x);
let abs    = x => Math.abs(x);
let sqr    = x => x * x;
let exp    = x => Math.exp(x);
let mps    = kph => kph / 3.6;
let kph    = mps => 3.6 * mps;
let avg        = (x, y) => (x + y) / 2;
let avgOfArray = xs => xs.reduce( (p,c,i) => p+(c-p)/(i+1), 0);

function powerToColor(value, ftp = 256) {
    let color = 'gray';
    let hex   = '#636468';
    if(value < (ftp * 0.55)) {
        color = 'gray'; hex = '#636468';
    } else if(value < (ftp * 0.76)) {
        color = 'blue'; hex = '#328AFF';
    } else if(value < (ftp * 0.88)) {
        color = 'green'; hex = '#57C057';
    } else if(value < (ftp * 0.95)) {
        color = 'yellow'; hex = '#F8C73A';
    } else if(value < (ftp * 1.06)) {
        color = 'yellow'; hex = '#F8C73A';
    } else if (value < (ftp * 1.20)) {
        color = 'orange'; hex = '#FF663A';
    } else {
        color = 'red'; hex = '#FE340B';
    }
    return {name: color, hex: hex};
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

function secondsToHms(elapsed, compact = false) {
    let hour = Math.floor(elapsed / 3600);
    let min  = Math.floor(elapsed % 3600 / 60);
    let sec  = elapsed % 60;
    let sD = (sec < 10)  ? `0${sec}`  : `${sec}`;
    let mD = (min < 10)  ? `0${min}`  : `${min}`;
    let hD = (hour < 10) ? `0${hour}` : `${hour}`;
    return compact ? `${mD}:${sD}` : `${hD}:${mD}:${sD}`;
}

function metersToDistance(meters) {
    let km = (meters / 1000);
    let s = (meters < 1000) ? `${meters} m`  : `${km.toFixed(2)} km`;
    return s;
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
    powerToColor,
    hrToColor,
    valueToHeight,
    secondsToHms,
    metersToDistance };
