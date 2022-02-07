import { equals, existance, curry2, avg, clamp } from '../functions.js';

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
        const max      = applyResolution(definitions[prop].max);
        const value    = existance(input, fallback);

        return Math.floor(clamp(min, max, transform(value)));
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
        maxRevs: 2**16,
        maxTime: 2**16,
        transform: ((x) => x),

        rate:         1024/2, // 0.5 second,
        maxRateCount: 3,
        rateCount:    0,
    };

    const resolution = existance(args.resolution, defaults.resolution);
    const transform  = existance(args.transform, defaults.transform);
    const maxRevs    = existance(args.maxRevs, defaults.maxRevs);
    const maxTime    = existance(args.maxTime, defaults.maxTime);
    const calculate  = existance(args.calculate, defaultCalculate);

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
        maxRateCount = existance(maxCount, defaults.maxRateCount);
        console.log(`maxRateCount: ${maxRateCount}`);
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

    function rollOverTime() {
        return getTime() - maxTime;
    }

    function rollOverRevs() {
        return getRevs() - maxRevs;
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
            setTime(rollOverTime());
        }

        if(isRolloverRevs(revs_2)) {
            setRevs(rollOverRevs());
        }

        value = transform(
            (revs_2 - getRevs()) / ((time_2 - getTime()) / resolution)
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
        rollOverTime,
        rollOverRevs,
    };
}

function RateAdjuster(args = {}) {
    const defaults = {
        sampleSize: 0,
        rate: 3, // [0,1,2,3]
        cutoff: 20,
        maxStillTime: 3000, // ms
        status: 'reading',
        statusList: ['reading', 'done'],
        sensor: 'cscs',
        onDone: ((x) => x),
    };

    let _sample = [];
    let _sampleSize = defaults.sampleSize;
    let _rate = defaults.rate;
    let _maxStillTime = defaults.maxStillTime;

    let _cutoff = defaults.cutoff;
    let _status = defaults.status;

    const onDone = existance(args.onDone, defaults.onDone);
    const sensor = existance(args.sensor, defaults.sensor);

    function getSampleSize() { return _sampleSize; }
    function getSample() { return _sample; }
    function getRate() { return _rate; }
    function getStatus() { return _status; }
    function getCutoff() { return _cutoff; }
    function getMaxStillTime(ms) { return _maxStillTime; }

    function setCutoff(count) { _cutoff = count; }
    function setMaxStillTime(ms) { _maxStillTime = ms; }

    function reset() {
        _sample = [];
        _sampleSize = defaults.sampleSize;
        _rate = defaults.rate;
        _status = defaults.status;
    }

    function isDone() {
        return equals(_status, 'done');
    }

    function timestampAvgDiff(sample) {
        return sample.reduce(function(acc, x, i, xs) {
            let tsd = 1000;
            if(i > 0) {
                tsd = xs[i].ts - xs[i-1].ts;
            }
            acc += (tsd-acc)/(i+1);
            return acc;
        }, 0);
    }

    function calculate(sample) {
        const tsAvgDiff = timestampAvgDiff(sample);

        const maxRateCount = clamp(2, 15, Math.round(_maxStillTime / tsAvgDiff) - 1);

        console.log(`rateAdjuster :on ${sensor} :tsAvgDiff ${tsAvgDiff} :result ${maxRateCount}`);

        return maxRateCount;
    }

    function update(value) {
        if(isDone()) return;

        _sample.push(value);
        _sampleSize += 1;

        if(_sampleSize >= _cutoff) {
            _status = 'done';
            _rate = calculate(_sample);
            onDone(_rate);
        }
    };

    return Object.freeze({
        getSampleSize,
        getSample,
        getRate,
        getStatus,
        getCutoff,
        getMaxStillTime,
        setCutoff,
        setMaxStillTime,

        reset,
        isDone,
        timestampAvgDiff,
        calculate,
        update,
    });
}

export {
    Spec,
    State,
    RateAdjuster,
}

