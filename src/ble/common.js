import { equals, existance, curry2 } from '../functions.js';
import { fixInRange, hex } from '../utils.js';

function Spec(args = {}) {
    const definitions = existance(args.definitions);

    const applyResolution = curry2((prop, value) => {
        return value / definitions[prop].resolution;
    });

    const removeResolution = curry2((prop, value) => {
        return value * definitions[prop].resolution;
    });

    function encodeField(prop, input, transform = applyResolution(prop)) {
        const fallback = definitions[prop].default;
        const min      = applyResolution(definitions[prop].min);
        const max      = applyResolution(prop, definitions[prop].max);
        const value    = existance(input, fallback);

        return Math.floor(fixInRange(min, max, transform(value)));
    }

    function decodeField(prop, input, transform = removeResolution) {
        return transform(prop, input);
    }

    return {
        definitions,
        applyResolution,
        removeResolution,
        encodeField,
        decodeField,
    };
}

function State(args = {}) {

    const defaults = {
        revs: -1,
        time: -1,
        value: 0,
        resolution: 1024,
        rolloverRevs: 2**16,
        rolloverTime: 2**16,
        transform: ((x) => x),

        rate:         1024/2, // 0.5 second,
        maxRateCount: 3,
        rateCount:    0,
    };

    const resolution   = existance(args.resolution, defaults.resolution);
    const transform    = existance(args.transform, defaults.transform);
    const rolloverRevs = existance(args.rolloverRevs, defaults.rolloverRevs);
    const rolloverTime = existance(args.rolloverTime, defaults.rolloverTime);
    const calculate    = existance(args.calculate, defaultCalculate);

    const rate       = existance(args.rate, defaults.rate);
    let maxRateCount = existance(args.maxRateCount, defaults.maxRateCount);
    let rateCount    = defaults.rateCount;

    let revs_1 = defaults.revs;
    let time_1 = defaults.time;
    let value  = defaults.value;

    function setRevs(revs) {
        revs_1 = revs;
        return revs_1;
    }

    function setTime(time) {
        time_1 = time;
        return time_1;
    }

    function setRateCount(count) {
        rateCount = count;
        return rateCount;
    }

    function setMaxRateCount(maxCount) {
        maxRateCount = maxCount;
        return maxRateCount;
    }

    function getRevs() {
        return revs_1;
    }

    function getTime() {
        return time_1;
    }

    function getRateCount() {
        return rateCount;
    }

    function getMaxRateCount() {
        return maxRateCount;
    }

    function reset() {
        setRevs(defaults.revs);
        setTime(defaults.time);
        setRateCount(defaults.rateCount);
        value = defaults.value;
        return { revs: revs_1, time: time_1 };
    }

    function isRolloverTime(time_2) {
        return time_2 < getTime();
    }

    function isRolloverRevs(revs_2) {
        return revs_2 < getRevs();
    }

    function stillRevs(revs_2) {
        // coasting or not moving
        return equals(getRevs(), revs_2);
    }

    function stillTime(time) {
        // multiple transmissions of the same time
        return equals(getTime(), time);
    }

    function underRate(time) {
        if(equals(rateCount, maxRateCount)) {
            rateCount = 0;
            return false;
        }
        if(equals(getTime(), time)) {
            rateCount += 1;
            return true;
        }
        if((time - getTime()) < rate) {
            rateCount += 1;
            return true;
        }
        rateCount = 0;
        return false;
    }

    function defaultCalculate(revs_2, time_2) {
        if(getRevs() < 0) setRevs(revs_2); // set initial revs
        if(getTime() < 0) setTime(time_2); // set initial time

        if(underRate(time_2)) {
            return value;
        }

        if(stillRevs(revs_2)) {
            setTime(time_2);
            value = 0;
            return value;
        }
        if(isRolloverTime(time_2)) {
            setTime(getTime() - rolloverTime);
        }
        if(isRolloverRevs(revs_2)) {
            setRevs(getRevs() - rolloverRevs);
        }

        value = transform(
            (getRevs() - revs_2) / ((getTime() - time_2) / resolution)
        );

        setRevs(revs_2);
        setTime(time_2);
        return value;
    }

    return {
        setRevs,
        setTime,
        setRateCount,
        setMaxRateCount,
        getRevs,
        getTime,
        getRateCount,
        getMaxRateCount,
        reset,
        calculate,
    };
}

export {
    Spec,
    State,
}

