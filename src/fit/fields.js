import { exists, existance, equals, first, last, map } from '../functions.js';



function Timestamp() {
    const garmin_epoch = Date.parse('31 Dec 1989 00:00:00 GMT');

    function encode(jsTimestamp) {
        return Math.round((jsTimestamp - garmin_epoch) / 1000);
    }

    function decode(encoded) {
        return (encoded * 1000) + garmin_epoch;
    }

    function elapsed(start, end) {
        return (encode(end) - encode(start)) * 1000;
    }

    function timer(start, end) {
        return (encode(end) - encode(start)) * 1000;
    }

    return Object.freeze({
        encode,
        decode,
        elapsed,
        timer,
    });
}

function Speed() {
    const scale = 1000;

    function encode(speed) { return (speed / 3.6) * scale; }
    function decode(encoded) { return (encoded / scale) * 3.6; }

    return Object.freeze({
        encode,
        decode,
    });
}

function Distance(unit = 'm') {
    const scale = 100;

    function encode(distance) { return distance * scale; }
    function decode(encoded) { return encoded / scale; }

    return Object.freeze({
        encode,
        decode,
    });
}

function Grade() {
    const scale = 100;

    function encode(grade) { return grade * scale; }
    function decode(encoded) { return encoded / scale; }

    return Object.freeze({
        encode,
        decode,
    });
}

function Altitude() {
    const scale  = 5;
    const offset = 500;

    function encode(altitude) {
        return (altitude * scale) + (offset * scale);
    }

    function decode(encoded) {
        return (encoded - (offset * scale)) / scale;
    }

    return Object.freeze({
        encode,
        decode,
    });
}

const fields = {
    timestamp: Timestamp(),
    speed:     Speed(),
    distance:  Distance(),
    grade:     Grade(),
    altitude:  Altitude(),
};

export { fields };
