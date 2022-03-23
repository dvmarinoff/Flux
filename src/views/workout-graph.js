import { xf, exists, existance, equals } from '../functions.js';
import { formatTime, translate } from '../utils.js';
import { models } from '../models/models.js';
import { g } from './graph.js';

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
        this.type = 'workout';
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

        xf.sub(`db:workout`, this.onWorkout.bind(this), this.signal);
        xf.sub(`db:ftp`, this.onFTP.bind(this), this.signal);

        xf.sub('db:intervalIndex', this.onIntervalIndex.bind(this), this.signal);
        xf.sub('db:distance', this.onDistance.bind(this), this.signal);

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
    onWorkout(value) {
        if(exists(value.intervals)) {
            this.type = 'workout';
        }
        if(exists(value.points)) {
            this.type = 'course';
        }
        // this.workout = Object.assign({}, value);
        this.workout = value;
        this.render();
    }
    onIntervalIndex(index) {
        const self = this;
        this.index = index;
        this.progress({index: self.index, dom: self.dom, parent: self,});
    }
    onDistance(distance) {
        const self = this;
        if(exists(this.workout?.points)) {
            const totalDistance = this.workout.meta.distance;
            const $dom = self.dom;
            const $parent = self;
            const left = translate(distance, 0, totalDistance, 0, window.innerWidth);
            $dom.active.style.left   = `${left % window.innerWidth}px`;
            $dom.active.style.width  = `2px`;
            $dom.active.style.height = `${$parent.getBoundingClientRect().height}px`;
        }
        return;
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
        const progress = `<div id="progress" class="progress"></div><div id="progress-active"></div>`;

        if(equals(this.type, 'workout')) {
            this.innerHTML = progress +
                intervalsToGraph(this.workout.intervals, this.ftp, this.viewPort);

            this.dom.info      = this.querySelector('#graph--info--cont');
            this.dom.progress  = this.querySelector('#progress');
            this.dom.active    = this.querySelector('#progress-active');
            this.dom.intervals = this.querySelectorAll('.graph--bar-group');
            this.dom.steps     = this.querySelectorAll('.graph--bar');

            this.progress({index: self.index, dom: self.dom, parent: self,});
        }

        if(equals(this.type, 'course')) {
            this.innerHTML = progress +
                courseToGraph(this.workout, this.viewPort);

            this.dom.progress  = this.querySelector('#progress');
            this.dom.active = this.querySelector('#progress-active');
        }
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




function Segment(points, prop) {
    return points.reduce((acc, point, i) => {
        const value = point[prop];
        if(value > acc.max) acc.max = value;
        if(value < acc.min) acc.min = value;
        if(equals(i, 0)) acc.min = value; acc.start = value;
        if(equals(i, points.length-1)) acc.end = value;
        return acc;
    }, {min: 0, max: 0, start: 0, end: 0,});
}

function scale(value, max = 100) {
    return 100 * (value/max);
}

function courseToGraph(course, viewPort) {
    const altitudeSpec   = Segment(course.points, 'y');

    const distanceTotal = course.meta.distance;
    const aspectRatio   = viewPort.aspectRatio;
    const yOffset       = Math.min(altitudeSpec.min, altitudeSpec.start, altitudeSpec.end);
    const yMax          = (altitudeSpec.max - altitudeSpec.min);
    const yScale        = (1 / ((aspectRatio * yMax) / distanceTotal));
    const flatness      = ((altitudeSpec.max - altitudeSpec.min));
    const altitudeScale = yScale * ((flatness < 100) ? 0.2 : 0.7);

    const viewBox = { width: distanceTotal, height: yMax, };

    // console.table({distanceTotal, yMax, aspectRatio, yScale, flatness, altitudeScale, altitudeSpec});

    const track = course.pointsSimplified.reduce((acc, p, i, xs) => {
        const color = g.slopeToColor(p.slope);

        const px1 = p.x;
        const px2 = xs[i+1]?.x ?? px1;
        const py1 = p.y;
        const py2 = xs[i+1]?.y ?? py1;

        const x1 = px1;
        const y1 = yMax;
        const x2 = px1;
        const y2 = yMax - ((py1-yOffset) * altitudeScale);
        const x3 = px2;
        const y3 = yMax - ((py2-yOffset) * altitudeScale);
        const x4 = px2;
        const y4 = yMax;

        return acc + `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}" stroke="none" fill="${color}" class="graph--bar" index="${i}" slope="${p.slope}" />`;

    }, ``);

    return `<svg class="graph--bar-group" height="100%" viewBox="0 0 ${viewBox.width} ${viewBox.height}" preserveAspectRatio="xMinYMax meet">${track}</svg>`;
}

export {
    WorkoutGraph,
    intervalsToGraph,
    courseToGraph,
};

