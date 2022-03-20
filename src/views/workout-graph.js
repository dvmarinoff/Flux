import { xf, exists, existance, equals } from '../functions.js';
import { formatTime, translate } from '../utils.js';
import { models } from '../models/models.js';

function Interval(acc, interval, width, ftp, scaleMax) {
    const stepsCount = interval.steps.length;

    return acc + interval.steps.reduce((a, step) => {
        const power    = existance(models.ftp.toAbsolute(step.power, ftp), 0);
        const cadence  = step.cadence;
        const slope    = step.slope;
        const duration = step.duration;

        const width    = 100 / stepsCount;
        const height   = scale(equals(power, 0) ? 80 : power, scaleMax); // ??

        const zone     = (models.ftp.powerToZone(power, ftp)).name;
        const infoTime = formatTime({value: duration, format: 'mm:ss'});


        const powerAttr    = exists(power) ? `power="${power}"` : '';
        const cadenceAttr  = exists(cadence) ? `cadence="${cadence}"` : '';
        const slopeAttr    = exists(slope) ? `slope="${slope}"` : '';
        const durationAttr = exists(duration) ? `duration="${infoTime}"` : '';

        return a +
            `<div class="graph--bar zone-${zone}" style="height: ${height}%; width: ${width}%" ${powerAttr} ${cadenceAttr} ${slopeAttr} ${durationAttr}></div>`;
    }, `<div class="graph--bar-group" style="width: ${width}px">`) + `</div>`;
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

    const scaleMax = ftp * maxDuration;

    return intervals.reduce((acc, interval) => {
        let width = 1;

        if(exists(interval.duration)) {
            width = (interval.duration < 1) ? 1 : Math.round(interval.duration);
            return Interval(acc, interval, width, ftp, scaleMax);
        }

        return '';
    }, '<div id="graph--info--cont"></div>');
}

class WorkoutGraph extends HTMLElement {
    constructor() {
        super();
        this.workout = {};
        this.metricValue = 0;
        this.index = 0;
        this.minHeight = 30;
    }
    connectedCallback() {
        const self = this;
        this.width = this.getWidth();
        this.height = this.getHeight();
        this.dom = {};
        this.viewPort = {
            width: self.width,
            height: self.height,
            aspectRatio: self.width / self.height,
        };

        this.abortController = new AbortController();
        this.signal = { signal: self.abortController.signal };

        xf.sub(`db:workout`, this.onUpdate.bind(this), this.signal);
        xf.sub(`db:ftp`, this.onFTP.bind(this), this.signal);

        xf.sub('db:intervalIndex', this.onIntervalIndex.bind(this), this.signal);

        this.addEventListener('mouseover', this.onHover.bind(this), this.signal);
        this.addEventListener('mouseout', this.onMouseOut.bind(this), this.signal);
        window.addEventListener('resize', this.onWindowResize.bind(this), this.signal);
    }
    disconnectedCallback() {
        this.abortController.abort();
    }
    getWidth() {
        return this.getBoundingClientRect().width;
    }
    getHeight() {
        return this.getBoundingClientRect().height;
    }
    onFTP(value) {
        this.ftp = value;
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
    onHover(e) {
        const target = this.querySelector('.graph--bar:hover');
        if(exists(target)) {
            const power    = target.getAttribute('power');
            const cadence  = target.getAttribute('cadence');
            const slope    = target.getAttribute('slope');
            const duration = target.getAttribute('duration');
            const distance = target.getAttribute('distance');
            const rect     = target.getBoundingClientRect();

            this.renderInfo({power,cadence,slope,duration,distance,rect});
        }
    }
    onMouseOut(e) {
        this.dom.info.style.display = 'none';
    }
    onUpdate(value) {
        this.workout = value;
        this.render();
    }
    onIntervalIndex(index) {
        const self = this;
        this.index = index;
        this.progress({index: self.index, dom: self.dom, parent: self,});
    }
    progress(args = {}) {
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
        const self = this;
        // const info     = `<div id="graph--info--cont"></div>`;
        const progress = `<div id="progress" class="progress"></div><div id="progress-active"></div>`;

        this.innerHTML = progress +
            intervalsToGraph(this.workout.intervals, this.ftp, this.viewPort);

        this.dom.info      = this.querySelector('#graph--info--cont');
        this.dom.progress  = this.querySelector('#progress');
        this.dom.active    = this.querySelector('#progress-active');
        this.dom.intervals = this.querySelectorAll('.graph--bar-group');
        this.dom.steps     = this.querySelectorAll('.graph--bar');

        this.progress({index: self.index, dom: self.dom, parent: self,});
    }
    renderInfo(args = {}) {
        const self = this;
        const power    = exists(args.power) ? `${args.power}W `: '';
        const cadence  = exists(args.cadence) ? `${args.cadence}rpm `: '';
        const slope    = exists(args.slope) ? `${args.slope}% `: '';
        const duration = exists(args.duration) ? `${args.duration}min `: '';
        const distance = exists(args.distance) ? `${args.distance}m `: '';

        const left = args.rect.left ?? 0;
        const width = args.rect.width ?? 0;

        this.dom.info.style.display = 'block';
        this.dom.info.innerHTML = `<div>${power}</div><div>${cadence}</div><div>${slope}</div><div class="graph--info--time">${duration}</div>`;
        this.dom.info.style.left = left;
        this.dom.info.style.bottom = args.rect.height;
    }
}

customElements.define('workout-graph', WorkoutGraph);



function slopeToColor(slope) {
    // avg hex
    const colors = new Map([
        ['-40',   '#328AFF'],
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
        ['40',    '#FE340B'],
    ]);

    for(var [key, value] of colors) {
        if(slope <= parseFloat(key)) {
            return value;
        }
    }
    // end avg hex

    // base hue
    // const baseHue = 120;
    // const hue = baseHue - (slope * 12);

    // return `hsl(${hue}, 45%, 55%)`;
    // end base hue
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

function AltitudeSpec(course) {
    return course.reduce((acc, point) => {
        acc.start = point.altitude ?? 727;
        let altitude = acc.start;

        point.steps.forEach((step, stepIndex, steps) => {
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

function scale(value, max = 100) {
    return 100 * (value/max);
}

function courseToGraph(course, viewPort) {
    const altitudeSpec   = AltitudeSpec(course);
    const distanceTotal  = course.distance;
    const aspectRatio    = viewPort.aspectRatio;
    const altitudeOffset = Math.min(altitudeSpec.min, altitudeSpec.start, altitudeSpec.end);
    const yMax           = (altitudeSpec.max - altitudeSpec.min);
    const yScale         = (1 / ((aspectRatio * yMax) / course.distance));
    const altitudeScale  = yScale * 0.7;

    const viewBox = { width: course.distance, height: yMax, };

    // console.table({distanceTotal, yMax, aspectRatio, yScale, altitudeScale, altitudeSpec});

    let state = { altitude: altitudeSpec.start, distance: 0, distanceH: 0, deg: 0 };

    // const stepsSimplified = simplify(steps);

    const track = course.steps.reduce((acc, step, i) => {
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

        return acc + `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}" stroke="none" fill="${color}" class="graph--bar" index="${i}" slope="${step.slope}" distance="${step.distance}" />`;

    }, ``);

    return `<svg class="graph--bar-group" height="100%" viewBox="0 0 ${viewBox.width} ${viewBox.height+(viewBox.height)}" preserveAspectRatio="xMinYMax meet">${track}</svg>`;
}

class CourseGraph extends HTMLElement {
    constructor() {
        super();
        this.course = {};
    }
    connectedCallback() {
        const self = this;
        this.width = this.getWidth();
        this.height = this.getHeight();
        this.viewPort = {
            width: self.width,
            height: self.height,
            aspectRatio: self.width / self.height,
        };

        this.abortController = new AbortController();
        this.signal = { signal: self.abortController.signal };

        xf.sub(`db:course`, this.onCourse.bind(this), this.signal);
        xf.reg('distance',  this.onDistance.bind(this), this.signal);

        this.addEventListener('mouseover', this.onHover.bind(this));
        this.addEventListener('mouseout', this.onMouseOut.bind(this));
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    disconnectedCallback() {
        this.abortController.abort();
    }
    onCourse(course) {
        this.course = course;
        this.render();
    }
    onDistance(distance, db) {
        this.distance = distance;
        this.progress({});
    }
    progress(args = {}) {
        // accumulate and draw only when a min descreate px reached
        const position    = args.position ?? 0;
        const distance    = args.distance ?? 0;
        const viewPort    = args.viewPort;
        const markerWidth = 3;
        const leftOffset  = translate(position, 0, distance, 0, viewPort.width);

        this.dom.active.style.left = `${leftOffset - (markerWidth)}px`;
        this.dom.active.style.width = `${markerWidth}px`;
    }
    render() {
        const self = this;
        const progress = `<div id="progress" class="progress"></div><div id="progress-active"></div>`;

        this.innerHTML = progress + courseToGraph(this.course, this.viewPort);

        this.dom.progress  = this.querySelector('#progress');
        this.dom.active    = this.querySelector('#progress-active');

        this.progress({index: self.index, dom: self.dom, parent: self,});
    }
}

customElements.define('course-graph', CourseGraph);



export {
    WorkoutGraph,
    CourseGraph,
    intervalsToGraph
};

