import { exists } from '../functions.js';
import { toDecimalPoint, divisors } from '../utils.js';

function readWarmup(el) {
    let duration  = parseInt(el.getAttribute('Duration'));
    let powerLow  = parseFloat(el.getAttribute('PowerLow'));
    let powerHigh = parseFloat(el.getAttribute('PowerHigh'));
    return {tag:       'Warmup',
            duration:  duration,
            powerLow:  powerLow,
            powerHigh: powerHigh};
}
function readIntervalsT(el) {
    let onDuration  = parseInt(el.getAttribute('OnDuration'));
    let offDuration = parseInt(el.getAttribute('OffDuration'));
    let repeat      = parseInt(el.getAttribute('Repeat'));
    let duration    = (onDuration + offDuration) * repeat;
    let onPower     = parseFloat(el.getAttribute('OnPower'));
    let offPower    = parseFloat(el.getAttribute('OffPower'));
    let onSlope     = undefined;
    let offSlope    = undefined;
    if(el.hasAttribute('OnSlopeTarget')) {
        onSlope = parseFloat(el.getAttribute('OnSlopeTarget'));
    }
    if(el.hasAttribute('OffSlopeTarget')) {
        offSlope = parseFloat(el.getAttribute('OffSlopeTarget'));
    }
    return {tag:        'IntervalsT',
            repeat:      repeat,
            onDuration:  onDuration,
            offDuration: offDuration,
            onPower:     onPower,
            offPower:    offPower,
            onSlope:     onSlope,
            offSlope:    offSlope};
}
function readSteadyState(el) {
    let duration = parseInt(el.getAttribute('Duration'));
    let power    = parseFloat(el.getAttribute('Power'));
    let slope    = undefined;
    if(el.hasAttribute('SlopeTarget')) {
        slope = parseFloat(el.getAttribute('SlopeTarget'));
    }
    return {tag:      'SteadyState',
            duration: duration,
            power:    power,
            slope:    slope};
}
function readCooldown(el) {
    let duration  = parseInt(el.getAttribute('Duration'));
    let powerLow  = parseFloat(el.getAttribute('PowerLow'));
    let powerHigh = parseFloat(el.getAttribute('PowerHigh'));
    return {tag:       'Cooldown',
            duration:  duration,
            powerLow:  powerLow,
            powerHigh: powerHigh};
}
function readFreeRide(el) {
    let duration  = parseInt(el.getAttribute('Duration'));
    let slope    = undefined;
    if(el.hasAttribute('SlopeTarget')) {
        slope = parseFloat(el.getAttribute('SlopeTarget'));
    }
    return {tag:      'FreeRide',
            duration: duration,
            slope: slope};
}
function unknownEl(el) {
    console.error(`Unknown Element in .zwo workout: ${el}`);
    return {tag: 'Uknown', duration: 0, power: 0};
}
function readZwoElement(el) {
    switch(el.tagName) {
    case 'Warmup':      return readWarmup(el); break;
    case 'IntervalsT':  return readIntervalsT(el); break;
    case 'SteadyState': return readSteadyState(el); break;
    case 'Cooldown':    return readCooldown(el); break;
    case 'FreeRide':    return readFreeRide(el); break;
    default:            return unknownEl(el); break;
    }
}

function timeUnit(duration) {
    let candidates = divisors(duration);
    if(duration < 12 || candidates.length === 1) {
        return 1;
    };
    if(duration < 121) {
        if(candidates.includes(4)) return 4;
        if(candidates.includes(3)) return 3;
        if(candidates.includes(2)) return 2;
        if(candidates.includes(5)) return 5;
        if(candidates.includes(6)) return 6;
        if(candidates.includes(7)) return 7;
    }
    if(duration < 301) {
        if(candidates.includes(7))  return 7;
        if(candidates.includes(6))  return 6;
        if(candidates.includes(5))  return 5;
        if(candidates.includes(11)) return 11;
        if(candidates.includes(13)) return 13;
        if(candidates.includes(13)) return 17;
        if(candidates.includes(4))  return 4;
        if(candidates.includes(3))  return 3;
        if(candidates.includes(2))  return 2;
    };
    if(duration > 300) {
        if(candidates.includes(9))  return 9;
        if(candidates.includes(10)) return 10;
        if(candidates.includes(7))  return 7;
        if(candidates.includes(11)) return 11;
        if(candidates.includes(13)) return 13;
        if(candidates.includes(6))  return 6;
        if(candidates.includes(5))  return 5;
        if(candidates.includes(17)) return 17;
        if(candidates.includes(19)) return 19;
        if(candidates.includes(23)) return 23;
        if(candidates.includes(4))  return 4;
        if(candidates.includes(3))  return 3;
        if(candidates.includes(2))  return 2;
    }
    return candidates[candidates.length - 1];
}

function warmupToInterval(step) {
    let interval   = {duration: step.duration, steps: []};
    let timeDx     = timeUnit(step.duration);
    let timeSteps  = (step.duration / timeDx);
    let powerDiff  = (parseInt(step.powerHigh * 100) - parseInt(step.powerLow * 100));
    let powerDx    = (powerDiff / timeSteps) / 100;
    let power      = step.powerLow;

    const nextToLastStep = (i) => i === (timeSteps - 2);

    for(let i = 0; i < timeSteps; i++) {
        interval.steps.push({duration: timeDx, power: toDecimalPoint(power)});

        if(nextToLastStep(i)) {
            power = step.powerHigh;
        } else {
            power = (power + powerDx);
        }
    };
    return [interval];
}
function intervalsTToInterval(step) {
    let intervals = [];
    for(let i = 0; i < step.repeat; i++) {
        intervals.push({duration: step.onDuration,
                        steps: [{duration: step.onDuration, power: step.onPower, slope: step.onSlope}]});
        intervals.push({duration: step.offDuration,
                        steps: [{duration: step.offDuration, power: step.offPower, slope: step.offSlope}]});
    };
    return intervals;
}
function steadyStateToInterval(step) {
    return {duration: step.duration,
            steps: [{duration: step.duration,
                     power:    step.power,
                     slope:    step.slope}]};
}
function cooldownToInterval(step) {
    let interval   = {duration: step.duration, steps: []};
    let timeDx     = timeUnit(step.duration);
    let timeSteps  = (step.duration / timeDx);
    let powerDiff  = (parseInt(step.powerHigh * 100) - parseInt(step.powerLow * 100));
    let powerDx    = (powerDiff / timeSteps) / 100;
    let power      = step.powerHigh;

    const nextToLastStep = (i) => i === (timeSteps - 2);

    for(let i = 0; i < timeSteps; i++) {
        interval.steps.push({duration: timeDx, power: toDecimalPoint(power)});

        if(nextToLastStep(i)) {
            power = step.powerLow;
        } else {
            power = (power - powerDx);
        }
    };
    return [interval];
}
function freeRideToInterval(step) {
    return {duration: step.duration,
            steps: [{duration: step.duration,
                     power:    0}]};
}
function unknownStep(step) {
    console.error(`Unknown Step in .zwo workout: ${step}`);
    return {duration: 0, steps: [{duration: 0, power: 0}]};
}

function stepToInterval(step) {
    switch(step.tag) {
    case 'Warmup':      return warmupToInterval(step); break;
    case 'IntervalsT':  return intervalsTToInterval(step); break;
    case 'SteadyState': return steadyStateToInterval(step); break;
    case 'Cooldown':    return cooldownToInterval(step); break;
    case 'FreeRide':    return freeRideToInterval(step); break;
    default:            return unknownStep(step); break;
    }
}

function parse(zwo) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(zwo, 'text/xml');

    let workoutEl = doc.querySelector('workout');
    let nameEl    = doc.querySelector('name');
    let descEl    = doc.querySelector('description');
    let effortEl  = doc.querySelector('effort-type');

    let elements = Array.from(workoutEl.children);

    let steps = elements.reduce((acc, el) => {
        acc.push(readZwoElement(el));
        return acc;
    }, []);

    let intervals   = steps.flatMap(step => stepToInterval(step));
    let duration    = Math.round(intervals.reduce( (acc, x) => acc + (x.duration / 60), 0));
    let name        = nameEl.textContent || 'Custom';
    let description = descEl.textContent || 'Custom Workout';

    let effort;

    if(exists(effortEl)) {
        effort = effortEl.textContent;
    } else {
        effort = 'Custom';
    }

    return {
        intervals: intervals,
        duration: duration,
        name: name,
        description: description,
        effort: effort
    };
}

function isValid(zwo) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(zwo, 'text/xml');

    const workoutEl = doc.querySelector('workout');
    const nameEl    = doc.querySelector('name');
    const descEl    = doc.querySelector('description');

    if(!exists(workoutEl)) return false;
    if(!exists(nameEl)) return false;
    if(!exists(descEl)) return false;
    return true;
}

const zwo = {
    parse: parse,
};

export { zwo };
