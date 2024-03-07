import { equals, expect, clamp, } from '../../functions.js';

function RevsOverTime(args = {}) {
    const defaults = {
        revs: -1,
        time: -1,
        value: 0,
        rate: 0.5, // (1024/2 / 1024), 0.5 second,
        maxRateCount: 3,
        rateCount: 0,
    };

    const format = args.format ?? ((x) => x);
    const resolution = expect(args.resolution, 'needs resolution.');
    const maxRevs = expect(args.maxRevs, 'needs maxRevs.');
    const maxTime = expect(args.maxTime, 'needs maxTime.');
    const rate = args.rate ?? defaults.rate;

    // state
    let maxRateCount = defaults.maxRateCount;
    let rateCount = defaults.rateCount;
    let revs_1 = defaults.revs;
    let time_1 = defaults.time;
    let value  = defaults.value;

    const setRevs = (revs) => { revs_1 = revs; return revs_1; };
    const setTime = (time) => { time_1 = time; return time_1; };
    const setRateCount = (count) => { rateCount = count; return rateCount; };
    const getRevs = () => revs_1;
    const getTime = () => time_1;
    const getRateCount = () => rateCount;
    const getMaxRateCount = () => maxRateCount;
    const isRolloverTime = (time_2) => time_2 < getTime();
    const isRolloverRevs = (revs_2) => revs_2 < getRevs();
    const rollOverTime = () => getTime() - maxTime;
    const rollOverRevs = () => getRevs() - maxRevs;
    // coasting or not moving
    const stillRevs = (revs_2) => equals(getRevs(), revs_2);
    // multiple transmissions of the same time
    const stillTime = (time) => equals(getTime(), time);

    function setMaxRateCount(maxCount) {
        maxRateCount = maxCount ?? defaults.maxRateCount;
        console.log(`maxRateCount: ${maxRateCount}`);
        return maxRateCount;
    }

    function reset() {
        setRevs(defaults.revs);
        setTime(defaults.time);
        setRateCount(defaults.rateCount);
        value = defaults.value;
        return { revs: revs_1, time: time_1 };
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

    function calculate(revs_2, time_2) {
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

        value = format(
            (revs_2 - getRevs()) / ((time_2 - getTime()) / resolution)
        );

        setRevs(revs_2);
        setTime(time_2);
        return value;
    }

    return {
        reset,
        calculate,
        setMaxRateCount,
    };
}

function RateAdjuster(args = {}) {
    const Status = {
        reading: 'reading',
        done: 'done',
        is: (expected, value) => equals(expected, value)
    };

    const defaults = {
        sampleSize: 0,
        rate: 3, // [0,1,2,3]
        cutoff: 20,
        maxStillTime: 3000, // ms
        sensor: 'cscs',
        onDone: ((x) => x),
    };

    let _sample = [];
    let _sampleSize = defaults.sampleSize;
    let _rate = defaults.rate;
    let _maxStillTime = defaults.maxStillTime;

    let _cutoff = defaults.cutoff;
    let _status = Status.reading;

    const onDone = args.onDone ?? defaults.onDone;
    const sensor = args.sensor ?? defaults.sensor;

    const setCutoff = (count) => _cutoff = count;
    const setMaxStillTime = (ms) => _maxStillTime = ms;
    const getSampleSize = () => _sampleSize;
    const getSample = () => _sample;
    const getRate = () => _rate;
    const getStatus = () => _status;
    const getCutoff = () => _cutoff;
    const getMaxStillTime = (ms) => _maxStillTime;
    const isDone = () => equals(_status, Status.done);

    function reset() {
        _sample = [];
        _sampleSize = defaults.sampleSize;
        _rate = defaults.rate;
        _status = Status.reading;
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

        console.log(`rateAdjuster on: ${sensor} tsAvgDiff: ${tsAvgDiff} result: ${maxRateCount}`);

        return maxRateCount;
    }

    function update(value) {
        if(isDone()) return;

        _sample.push(value);
        _sampleSize += 1;

        if(_sampleSize >= _cutoff) {
            _status = Status.done;
            _rate = calculate(_sample);
            onDone(_rate);
        }
    };

    return Object.freeze({
        reset,
        isDone,
        timestampAvgDiff,
        calculate,
        update,
    });
}

export {
    RevsOverTime,
    RateAdjuster,
}
