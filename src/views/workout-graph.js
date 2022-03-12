import { xf, exists, existance, equals } from '../functions.js';
import { formatTime } from '../utils.js';
import { models } from '../models/models.js';

function powerTargetToHtml(args = {}) {
    const name  = existance(args.name, 'power');
    const value = existance(args.value, 0);
    const unit  = existance(args.unit, 'W');

    if(equals(value, 0)) {
        return `<div class="graph--info--${name}">Free ride</div>`;
    } else {
        return `<div class="graph--info--${name}">${value} ${unit}</div>`;
    }
}

function cadenceTargetToHtml(args = {}) {
    const name  = existance(args.name, 'cadence');
    const value = existance(args.value, 0);
    const unit  = existance(args.unit, 'rpm');

    if(equals(value, 0)) {
        return '';
    } else {
        return `<div class="graph--info--${name}">${value} ${unit}</div>`;
    }
}

function slopeTargetToHtml(args = {}) {
    const name  = existance(args.name, 'slope');
    const value = existance(args.value, 'na');
    const unit  = existance(args.unit, '%');

    if(equals(value, 'na')) {
        return '';
    } else {
        return `<div class="graph--info--${name}">${value} ${unit}</div>`;
    }
}

function targetsToHtml(args = {}) {
    return powerTargetToHtml({value: args.power}) +
           cadenceTargetToHtml({value: args.cadence}) +
           slopeTargetToHtml({value: args.slope});
}

function scale(value, max = 100) {
    return 100 * (value/max);
}

function durationInterval(acc, interval, width, ftp, scaleMax) {
    const stepsCount = interval.steps.length;

    return acc + interval.steps.reduce((a, step) => {
        const power    = existance(models.ftp.toAbsolute(step.power, ftp), 0);
        const cadence  = step.cadence;
        const slope    = step.slope;

        const width    = 100 / stepsCount;
        const height   = scale(equals(power, 0) ? 80 : power, scaleMax);

        const zone     = (models.ftp.powerToZone(power, ftp)).name;
        const infoTime = formatTime({value: step.duration, format: 'mm:ss'});

        return a +
            `<div class="graph--bar zone-${zone}" style="height: ${height}%; width: ${width}%">
                     <div class="graph--info">
                         ${targetsToHtml({power, cadence, slope})}
                         <div class="graph--info--time">${infoTime}<span></span></div>
                     </div>
                </div>`;
    }, `<div class="graph--bar-group" style="width: ${width}px">`) + `</div>`;
}

function hexColorToArray(hex) {
    return hex.replace('#','').match(/.{1,2}/g).map(x => parseInt(x, 16));
}

function arrayToHexColor(arr) {
    return '#' + arr.map(x => x.toString(16).toUpperCase()).join('');
}

function avgColor(hex1, hex2) {
    const color1 = hexColorToArray(hex1);
    const color2 = hexColorToArray(hex2);
    const color =  color1.map((channel, i) => parseInt((channel+color2[i])/2));
    return arrayToHexColor(color);
}

function slopeToColor(slope) {
    const colors = new Map([
        ['-20',   '#328AFF'],
        ['-17.5', '#3690EA'],
        ['-15',   '#3B97D5'],
        ['-12.5', '#3F9EC0'],
        ['-10',   '#44A5AB'],
        ['-7.5',  '#48AB96'],
        ['-5',    '#4DB281'],
        ['-2.5',  '#52B96C'],
        ['0',     '#57C057'],
        ['2.5',   '#68AC4E'],
        ['5',     '#799845'],
        ['7.5',   '#8A843C'],
        ['10',    '#9B7134'],
        ['12.5',  '#B36129'],
        ['15',    '#CC521F'],
        ['17.5',  '#E54315'],
        ['20',    '#FE340B'],
    ]);

    for(var [key, value] of colors) {
        if(slope <= parseFloat(key)) {
            return value;
        }
    }
}

function translate(value, leftMin, leftMax, rightMin, rightMax) {
    const leftSpan = leftMax - leftMin;
    const rightSpan = rightMax - rightMin;

    const valueScaled = (value - leftMin) / (leftSpan);

    return rightMin + (valueScaled * rightSpan);
}

function slopeToAltitude(slope, distance) {
    return distance * Math.sin(Math.atan(slope/100));
}

function slopeToDistanceH(slope, distance) {
    return distance * Math.cos(Math.atan(slope/100));
}

function gradeToDeg(grade) {
    // 10 % = 5.71 deg, 5% = 2.86
    return 180/Math.PI * Math.atan(grade/100);
}

function adjacent(deg, r) {
    return r * Math.cos(Math.PI/180 * deg);
}

function opposite(deg, r) {
    return r * Math.sin(Math.PI/180 * deg);
}

function stepToDelta(step) {
    const { distance, slope } = step;
    const deg   = gradeToDeg(slope);
    const delta = {};
    delta.distance  = distance;
    delta.altitude  = opposite(deg, distance);
    delta.distanceH = adjacent(deg, distance);
    delta.deg       = deg;
    return delta;
}

function nextState(state, delta) {
    state.altitude  += delta.altitude;
    state.distance  += delta.distance;
    state.distanceH += delta.distanceH;
    state.deg        = delta.deg;
    return state;
}

function distanceInterval(acc, interval, viewPort, altitudeSpec) {
    const distanceTotal  = interval.distance;
    const aspectRatio    = viewPort.aspectRatio;
    const altitudeOffset = Math.min(altitudeSpec.min, altitudeSpec.start, altitudeSpec.end);
    const yMax           = (altitudeSpec.max - altitudeSpec.min);
    const yScale         = (1 / ((aspectRatio * yMax) / interval.distance));
    const altitudeScale  = yScale * 0.6;

    const viewBox = { width: interval.distance, height: yMax, };

    // console.table({distanceTotal, yMax, aspectRatio, yScale, altitudeScale, altitudeSpec});

    let state = { altitude: altitudeSpec.start, distance: 0, distanceH: 0, deg: 0 };

    const track = interval.steps.reduce((a, step) => {
        const color = slopeToColor(step.slope);
        const delta = stepToDelta(step);
        state = nextState(state, delta);

        const x1 = (state.distance - delta.distance);
        const y1 = yMax;
        const x2 = (state.distance - delta.distance);
        const y2 = yMax - ((state.altitude - delta.altitude - altitudeOffset) * altitudeScale);
        const x3 = (state.distance);
        const y3 = yMax - ((state.altitude - altitudeOffset) * altitudeScale);
        const x4 = (state.distance);
        const y4 = yMax;

        return a + `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}" stroke="#000" fill="${color}" />`;
    }, ``);

    return acc + `<svg class="graph--bar-group" height="100%" viewBox="0 0 ${viewBox.width} ${viewBox.height}" preserveAspectRatio="xMinYMax meet">${track}</svg>`;
}

function AltitudeSpec(intervals) {
    return intervals.reduce((acc, interval) => {
        acc.start = interval.altitude ?? 727;
        let altitude = acc.start;

        interval.steps.forEach((step, stepIndex, steps) => {
            if(exists(step.distance)) {
                altitude += slopeToAltitude(step.slope, step.distance);
                if(altitude > acc.max) acc.max = altitude;
                if(altitude < acc.min) acc.min = altitude;
                if(equals(stepIndex, 0)) acc.min = altitude;
                if(equals(stepIndex, steps.length-1)) acc.end = altitude;
            }
        });

        return acc;

    }, {min: 0, max: 0, start: 0, end: 0});
}

function intervalsToGraph(intervals, ftp, viewPort) {
    const minAbsPower = 9;
    const graphHeight = viewPort.height ?? 118;

    const maxDuration = intervals.reduce((highest, interval) => {
        interval.steps.forEach((step) => {
            const power = models.ftp.toRelative(step.power, ftp);
            if(power > highest) highest = power;
        });
        return highest;
    }, 1.6);

    const altitudeSpec = AltitudeSpec(intervals);

    const scaleMax = ftp * maxDuration;

    return intervals.reduce((acc, interval) => {
        let width = 1;

        if(exists(interval.duration)) {
            width = (interval.duration < 1) ? 1 : Math.round(interval.duration);
            return durationInterval(acc, interval, width, ftp, scaleMax);
        }

        if(exists(interval.distance)) {
            width = Math.round(interval.distance);
            return distanceInterval(acc, interval, viewPort, altitudeSpec);
        }

        return '';
    }, '');
}

class WorkoutGraph extends HTMLElement {
    constructor() {
        super();
        this.workout = {};
        this.metricValue = 0;
        this.dom = {};
        this.index = 0;
        this.minHeight = 30;
    }
    connectedCallback() {
        const self = this;
        this.prop = this.getAttribute('prop'); // db:workout
        this.metric = this.getAttribute('metric');
        this.width = this.getWidth();
        this.height = this.getHeight();
        this.viewPort = {
            width: self.width,
            height: self.height,
            aspectRatio: self.width / self.height,
        };

        xf.sub(`db:${this.prop}`, this.onUpdate.bind(this));
        xf.sub(`db:${this.metric}`, this.onMetric.bind(this));

        xf.sub('db:intervalIndex', this.onIntervalIndex.bind(this));
        xf.reg('distance',      this.onDistance.bind(this));

        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    disconnectedCallback() {
        window.removeEventListener(`db:${this.prop}`, this.onUpdate);
        window.removeEventListener(`db:${this.metric}`, this.onMetric);
        window.removeEventListener('resize', this.onWindowResize);
    }
    getWidth() {
        return this.getBoundingClientRect().width;
    }
    getHeight() {
        return this.getBoundingClientRect().height;
    }
    onMetric(value) {
        this.metricValue = value;
        if(exists(this.workout.intervals)) this.render();
    }
    isIntervalType(type = 'duration') {
        return exists(this.workout.intervals[this.index][type]);
    }
    onWindowResize(e) {
        const self = this;
        const height = this.getHeight();

        if(height < this.minHeight) {
            return;
        }

        this.width    = this.getWidth();
        this.height   = this.getHeight();
        this.viewPort = {
            width: self.width,
            height: self.height,
            aspectRatio: self.width / self.height,
        };
        this.render();
    }
    onUpdate(value) {
        this.workout = value;
        this.render();
    }
    onIntervalIndex(index) {
        this.index = index;
        this.progress();
    }
    onDistance(distance, db) {
        const self = this;

        this.distance = distance;
        this.lapPosition = db.lapPosition;
        this.lapDistance = db.lapDistance;

        // if(this.isIntervalType('duration')) return;
        this.progress();

    }
    progress() {
        const self = this;
        if(this.isIntervalType('duration')) {
            this.progressDuration({
                index:  self.index,
                dom:    self.dom,
                parent: self,
            });
        };
        if(this.isIntervalType('distance')) {
            this.progressDistance({
                distance:    self.distance,
                lapPosition: self.lapPosition,
                lapDistance: self.lapDistance,
                viewPort:    self.viewPort,
            });
        };
    }
    progressDistance(args = {}) {
        // accumulate and draw only when a min descreate px reached
        const lapPosition = args.lapPosition ?? 0;
        const lapDistance = args.lapDistance ?? 0;
        const viewPort    = args.viewPort;
        const markerWidth = 3;
        const position    = translate(lapPosition, 0, lapDistance, 0, viewPort.width);

        this.dom.active.style.left = `${position - (markerWidth / 1)}px`;
        this.dom.active.style.width = `${markerWidth}px`;
    }
    progressDuration(args = {}) {
        const index   = args.index ?? 0;
        const $dom    = args.dom;
        const $parent = args.parent;
        const rect    = $dom.intervals[index].getBoundingClientRect();
        const left    = rect.left - $parent.getBoundingClientRect().left;

        $dom.active.style.left   = `${left}px`;
        $dom.active.style.width  = `${rect.width}px`;
        $dom.active.style.height = `${$parent.getBoundingClientRect().height}px`;
    }
    render() {
        const progress = `<div id="progress" class="progress"></div><div id="progress-active"></div>`;

        this.innerHTML = progress + intervalsToGraph(this.workout.intervals, this.metricValue, this.viewPort);

        this.dom.progress  = this.querySelector('#progress');
        this.dom.active    = this.querySelector('#progress-active');
        this.dom.intervals = this.querySelectorAll('.graph--bar-group');
        this.dom.steps     = this.querySelectorAll('.graph--bar');

        this.progress();
    }
}

customElements.define('workout-graph', WorkoutGraph);

export {
    WorkoutGraph,
    intervalsToGraph
};
