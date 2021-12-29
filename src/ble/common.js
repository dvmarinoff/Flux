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
        resolution: 1024,
        rolloverRevs: 2**16,
        rolloverTime: 2**16,
        transform: ((x) => x),
    };

    const resolution   = existance(args.resolution, defaults.resolution);
    const transform    = existance(args.transform, defaults.transform);
    const rolloverRevs = existance(args.rolloverRevs, defaults.rolloverRevs);
    const rolloverTime = existance(args.rolloverTime, defaults.rolloverTime);
    const calculate    = existance(args.calculate, defaultCalculate);

    let revs_1 = defaults.revs;
    let time_1 = defaults.time;

    function setRevs(value) {
        revs_1 = value;
        return revs_1;
    }

    function setTime(value) {
        time_1 = value;
        return time_1;
    }

    function getRevs(value) {
        return revs_1;
    }

    function getTime(value) {
        return time_1;
    }

    function reset() {
        setRevs(defaults.revs);
        setTime(defaults.time);
        return { revs: revs_1, time: time_1 };
    }

    function isRolloverTime(time_2) {
        return time_2 < getTime();
    }

    function isRolloverRevs(revs_2) {
        return revs_2 < getRevs();
    }

    function isStill(revs_2) {
        // coasting or not moving
        return equals(getRevs(), revs_2);
    }

    function defaultCalculate(revs_2, time_2) {
        if(getRevs() < 0) setRevs(revs_2); // set initial value
        if(getTime() < 0) setTime(time_2); // set initial value

        if(isRolloverTime(time_2)) {
            setTime(getTime() - rolloverTime);
        }
        if(isRolloverRevs(revs_2)) {
            setRevs(getRevs() - rolloverRevs);
        }
        if(isStill(revs_2)) {
            setTime(time_2);
            return 0;
        }

        const cadence = transform(
            (getRevs() - revs_2) / ((getTime() - time_2) / resolution)
        );

        setRevs(revs_2);
        setTime(time_2);
        return cadence;
    }

    return {
        setRevs,
        setTime,
        getRevs,
        getTime,
        reset,
        calculate,
    };
}

export {
    Spec,
    State,
}

