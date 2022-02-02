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

function intervalsToGraph(intervals, ftp, useGraphHeight = false, graphHeight = 118) {
    const minAbsPower = 9;

    const maxInterval = intervals.reduce((highest, interval) => {
        interval.steps.forEach((step) => {
            const power = models.ftp.toRelative(step.power, ftp);
            if(power > highest) highest = power;
        });
        return highest;
    }, 1.6);

    const scaleMax = ftp * maxInterval * (useGraphHeight ? (90 / graphHeight) : 1);

    return intervals.reduce( (acc, interval) => {
        const width = (interval.duration < 1) ? 1 : parseInt(Math.round(interval.duration)); // ?
        const stepsCount = interval.steps.length;
        return acc + interval.steps.reduce((a, step) => {
            const power   = existance(models.ftp.toAbsolute(step.power, ftp), 0);
            const cadence = step.cadence;
            const slope   = step.slope;

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
        this.prop = this.getAttribute('prop');
        this.metric = this.getAttribute('metric');
        this.width = this.getWidth();
        this.height = this.getHeight();

        xf.sub(`db:${this.prop}`, this.onUpdate.bind(this));
        xf.sub(`db:${this.metric}`, this.onMetric.bind(this));

        xf.sub('db:intervalIndex', index => {
            this.index = index;
            this.progress(this.index);
        });

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
    onWindowResize(e) {
        const height = this.getHeight();

        if(height < this.minHeight) {
            return;
        }

        this.width = this.getWidth();
        this.height = this.getHeight();
        this.render();
    }
    onUpdate(value) {
        this.workout = value;
        this.render();
    }
    progress() {
        const rect = this.dom.intervals[this.index].getBoundingClientRect();
        this.dom.active.style.left  = `${rect.left - this.getBoundingClientRect().left}px`;
        this.dom.active.style.width = `${rect.width}px`;
        this.dom.active.style.height = `${this.getBoundingClientRect().height}px`;

    }
    render() {
        const progress = `<div id="progress" class="progress"></div><div id="progress-active"></div>`;

        this.innerHTML = progress + intervalsToGraph(this.workout.intervals, this.metricValue, true, this.height);

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
