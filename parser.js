import { powerToColor,
         hrToColor,
         valueToHeight,
         secondsToHms } from './functions.js';

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
    let interval   = {duration: step.duration, steps: []};
    let powerDiff  = Math.round((step.powerHigh * 100) - (step.powerLow * 100));
    let powerDx    = 0.01;
    let steps      = powerDiff;
    let remainder  = (step.duration % steps);
    let durationDx = remainder > 0 ? remainder : step.duration / steps;
    let power      = step.powerLow;
    for(let i = 0; i < steps; i++) {
        interval.steps.push({duration: i === 0 ? durationDx + remainder : durationDx, power: power});
        power = toDecimalPoint(power + powerDx);
    };
    return [interval];
}
function intervalsTToInterval(step) {
    let intervals = [];
    for(let i = 0; i < step.repeat; i++) {
        intervals.push({duration: step.onDuration,  steps: [{duration: step.onDuration,  power: step.onPower}]});
        intervals.push({duration: step.offDuration, steps: [{duration: step.offDuration, power: step.offPower}]});
    };
    return intervals;
}
function steadyStateToInterval(step) {
    return {duration: step.duration,
            steps: [{duration: step.duration,
                     power:    step.power}]};
}
function cooldownToInterval(step) {
    let interval  = {duration: step.duration, steps: []};
    let powerDx    = 0.01;
    let steps      = Math.round((step.powerHigh-step.powerLow) / powerDx);
    let durationDx = Math.round(step.duration/steps);
    let power      = step.powerHigh;
    let stepsLen   = steps + 1;
    for(let i = 0; i < stepsLen; i++) {
        interval.steps.push({duration: durationDx, power: power});
        power = toDecimalPoint(power - powerDx);
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

function zwoToIntervals(zwo) {
    let intervals = zwo.flatMap(step => stepToInterval(step));
    return intervals;
}

function parseZwo(zwo) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(zwo, 'text/xml');

    let workoutEl = doc.querySelector('workout');
    let nameEl    = doc.querySelector('name');
    let descEl    = doc.querySelector('description');

    let elements = Array.from(workoutEl.children);

    let steps = elements.reduce((acc, el) => {
        acc.push(readZwoElement(el));
        return acc;
    }, []);

    let intervals   = steps.flatMap(step => stepToInterval(step));
    let duration    = Math.round(intervals.reduce( (acc, x) => acc + (x.duration / 60), 0));
    let name        = nameEl.textContent;
    let description = descEl.textContent;

    return {intervals: intervals, duration: duration, name: name, description: description};
}

function intervalsToGraph(intervals, ftp) {
    let scale = 400;
    return intervals.reduce( (acc, interval) => {
        let width = (interval.duration) < 1 ? 1 : parseInt(Math.round(interval.duration));
        let len = interval.steps.length;
        return acc + interval.steps.reduce((a, step) => {
            // let width = (step.duration) < 1 ? 1 : parseInt(Math.round(step.duration));
            let width = 100 / len;
            let height = valueToHeight(scale, (step.power === 0) ? 80 : step.power);
            return a +
                `<div class="graph-bar ${(powerToColor(step.power, ftp)).name}-zone" style="height: ${height}%; width: ${width}%">
                     <div class="graph-info t5">
                         <div class="power">${step.power}<span>W</span></div>
                         <div class="time">${secondsToHms(step.duration, true)}<span></span></div>
                     </div>
                </div>`;
        }, `<div class="graph-interval" style="width: ${width}px">`) + `</div>`;

    }, ``);
}

export { parseZwo, intervalsToGraph };
