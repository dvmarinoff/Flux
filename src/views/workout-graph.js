import { xf, exists, equals } from '../functions.js';
import { secondsToHms, scale } from '../utils.js';
import { models } from '../models/models.js';

function intervalsToGraph(intervals, ftp, graphHeight = 118) {
    let scaleMax = ftp * 1.6 * (100 / graphHeight);
    return intervals.reduce( (acc, interval) => {
        let width = (interval.duration) < 1 ? 1 : parseInt(Math.round(interval.duration)); // ?
        let stepsCount = interval.steps.length;
        return acc + interval.steps.reduce((a, step) => {
            const power = parseInt(ftp * step.power);
            const width = 100 / stepsCount;
            const height = scale((power === 0) ? 80 : power, scaleMax);
            const zone = (models.ftp.powerToZone(power, ftp)).name;
            const infoPower = power === 0 ? 'Free ride' : power;
            const infoPowerUnit = power === 0 ? '' : 'W';
            const infoTime = secondsToHms(step.duration, true);

            return a +
                `<div class="graph--bar zone-${zone}" style="height: ${height}%; width: ${width}%">
                     <div class="graph--info t5">
                         <div class="graph--info--power">${infoPower}${infoPowerUnit}</div>
                         <div class="graph--info--time">${infoTime}<span></span></div>
                     </div>
                </div>`;
        }, `<div class="graph--bar-group" style="width: ${width}px">`) + `</div>`;

    }, ``);
}

class WorkoutGraph extends HTMLElement {
    constructor() {
        super();
        this.workout = {};
        this.metricValue = 0;
        this.dom = {};
        this.index = 0;
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
        if(exists(this.workout.intervals)) this.initRender();
    }
    onWindowResize(e) {
        this.width = this.getWidth();
        this.height = this.getHeight();
        this.initRender();
    }
    onUpdate(value) {
        this.workout = value;
        this.initRender();
    }
    progress() {
        const rect = this.dom.intervals[this.index].getBoundingClientRect();
        this.dom.active.style.left  = `${rect.left}px`;
        this.dom.active.style.width = `${rect.width}px`;

    }
    initRender() {
        const progress = `<div id="progress" class="progress"></div><div id="progress-active"></div>`;

        this.innerHTML = progress + intervalsToGraph(this.workout.intervals, this.metricValue, this.height);

        this.dom.progress  = this.querySelector('#progress');
        this.dom.active    = this.querySelector('#progress-active');
        this.dom.intervals = this.querySelectorAll('.graph--bar-group');
        this.dom.steps     = this.querySelectorAll('.graph--bar');

        this.progress();
    }
}

customElements.define('workout-graph', WorkoutGraph);

export { WorkoutGraph };
