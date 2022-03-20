import { xf, equals, exists, } from './functions.js';
import { models } from './models/models.js';

function Course() {

    const abortController = new AbortController();
    const signal = {signal: abortController.signal};

    xf.reg(`db:distance`, onDistance.bind(this), signal);

    let distance = 0;

    function onDistance(value, db) {
        distance = value;
    }

    function start() {
    }

    Object.freeze({
        start,
    });
}
