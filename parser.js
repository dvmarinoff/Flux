import { powerToColor,
         hrToColor,
         valueToHeight } from './functions.js';

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
    return {tag:        'IntervalsT',
            repeat:      repeat,
            onDuration:  onDuration,
            offDuration: offDuration,
            onPower:     onPower,
            offPower:    offPower};
}
function readSteadyState(el) {
    let duration = parseInt(el.getAttribute('Duration'));
    let power    = parseFloat(el.getAttribute('Power'));
    return {tag:      'SteadyState',
            duration: duration,
            power:    power};
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
    return {tag:      'FreeRide',
            duration: duration};
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

function toDecimalPoint (x, point = 2) {
    return Number((x).toFixed(point));
}

function warmupToInterval(step) {
    let intervals  = [];
    let powerDx    = 0.01;
    let steps      = Math.round((step.powerHigh-step.powerLow) / powerDx);
    let durationDx = Math.round(step.duration/steps);
    let power      = step.powerLow;
    let stepsLen   = steps + 1;
    let isLap = false;
    for(let i = 0; i < stepsLen; i++) {
        isLap =  (i === stepsLen - 1) ? true : false;
        intervals.push({duration: durationDx, power: power, lap: isLap});
        power = toDecimalPoint(power + powerDx);
    };
    return intervals;
}
function intervalsTToInterval(step) {
    let intervals = [];
    for(let i = 0; i < step.repeat; i++) {
        intervals.push({duration: step.onDuration, power: step.onPower, lap: true});
        intervals.push({duration: step.offDuration, power: step.offPower, lap: true});
    };
    return intervals;
}
function steadyStateToInterval(step) {
    return {duration: step.duration,
            power:    step.power,
            lap:      true};
}
function cooldownToInterval(step) {
    let intervals  = [];
    let powerDx    = 0.01;
    let steps      = Math.round((step.powerHigh-step.powerLow) / powerDx);
    let durationDx = Math.round(step.duration/steps);
    let power      = step.powerHigh;
    let stepsLen   = steps + 1;
    let isLap = false;
    for(let i = 0; i < stepsLen; i++) {
        isLap =  (i === stepsLen - 1) ? true : false;
        intervals.push({duration: durationDx, power: power, lap: isLap});
        power = toDecimalPoint(power - powerDx);
    };
    return intervals;
}
function freeRideToInterval(step) {
    return {duration: step.duration,
            power:    0,
            lap:      true};
}
function unknownStep(step) {
    console.error(`Unknown Step in .zwo workout: ${step}`);
    return {duration: 0, power: 0, lap: false};
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

function zwoToIntervals(zwo) {
    let intervals = zwo.flatMap(step => stepToInterval(step));
    return intervals;
}

function parseZwo(zwo) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(zwo, 'text/xml');

    let workoutEl = doc.querySelector('workout');
    let elements = Array.from(workoutEl.children);

    let steps = elements.reduce((acc, el) => {
        acc.push(readZwoElement(el));
        return acc;
    }, []);

    let intervals = steps.flatMap(step => stepToInterval(step));

    return intervals;
}

function intervalsToGraph(intervals) {
    let scale = 400;
    return intervals.reduce( (acc, interval) => {
        let width = (interval.duration) < 1 ? 1 : parseInt(Math.round(interval.duration));
        let height = valueToHeight(scale, (interval.power === 0) ? 80 : interval.power);

        return acc +
            // `<polygon points="100,100 150,25 150,75 200,0" fill="${(powerToColor(interval.target)).hex}" />`;
        `<div class="graph-bar ${(powerToColor(interval.power)).name}-zone" style="height: ${height}%; width: ${width}px"></div>`;
    }, ``);
}

export { parseZwo, intervalsToGraph };
