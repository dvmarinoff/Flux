import { xf, exists, empty, equals, secondsToHms, scale } from '../functions.js';
import { models } from '../models/models.js';

function intervalsToGraph(intervals, ftp) {
    let scaleMax = ftp * 1.6;

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

const radioOff = `
        <svg class="radio radio-off" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path class="path" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12
                    2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
        </svg>`;

const radioOn = `
        <svg class="radio radio-on" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path class="path" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0
                    18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
            <circle class="circle" cx="12" cy="12" r="5"/>
        </svg>`;

function workoutTemplate(workout) {
    return `<li is="workout-item" class='workout list-item cf' id="${workout.id}" metric="ftp">
                <div class="first-row">
                    <div class="name t6">${workout.name}</div>
                    <div class="type t6">${workout.effort}</div>
                    <div class="time t6">${workout.duration} min</div>
                    <div class="select" id="btn${workout.id}">${radioOff}</div>
                </div>
                <div class="second-row">
                    <div class="desc">
                        <div class="graph-workout--cont">${workout.graph}</div>
                        <div class="content t5">${workout.description}</div>
                    </div>
                </div>
            </li>`;
}

class WorkoutList extends HTMLUListElement {
    constructor() {
        super();
        this.state = [];
        this.metric = 0;
        this.items = [];
        this.postInit();
    }
    postInit() { return; }
    connectedCallback() {
        this.prop = this.getAttribute('prop');
        this.metricProp = this.getAttribute('metric');
        xf.sub(`db:${this.prop}`, this.onUpdate.bind(this));
        xf.sub(`db:${this.metricProp}`, this.onMetric.bind(this));

    }
    disconnectedCallback() {
        document.removeEventListener(`db:${this.prop}`, this.onUpdate);
    }
    onMetric(value) {
        if(!equals(value, this.metric)) {
            this.metric = value;
            if(!empty(this.state)) {
                this.render();
            }
        }
    }
    onUpdate(value) {
        if(!equals(value, this.state)) {
            this.state = value;
            this.render();
        }
    }
    stateToHtml (state, metric) {
        return state.reduce((acc, workout, i) => {
            const graph = intervalsToGraph(workout.intervals, metric);
            workout = Object.assign(workout, {graph: graph});
            return acc + workoutTemplate(workout);
        }, '');
    }
    render() {
        // console.log(this.state);
        this.innerHTML = this.stateToHtml(this.state, this.metric);
    }
}



class WorkoutListItem extends HTMLLIElement {
    constructor() {
        super();
        this.state = '';
        this.postInit();
        this.isExpanded = false;
        this.isSelected = false;
    }
    postInit() { return; }
    connectedCallback() {
        this.summary = this.querySelector('.first-row');
        this.description = this.querySelector('.second-row .desc');
        this.selectBtn = this.querySelector('.select');
        this.indicator = this.selectBtn;
        this.id = this.getAttribute('id');

        xf.sub('db:workout', this.onWorkout.bind(this));
        this.summary.addEventListener('pointerup', this.toggleExpand.bind(this));
        this.selectBtn.addEventListener('pointerup', this.onRadio.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener('db:workout', this.onWorkout);
        this.summary.removeEventListener('pointerup', this.toggleExpand);
        this.selectBtn.removeEventListener('pointerup', this.onRadio);
    }

    onWorkout(workout) {
        this.toggleSelect(workout.id);
    }
    toggleExpand(e) {
        if(this.isExpanded) {
            this.collapse();
        } else {
            this.expand();
        }
    }
    expand() {
        this.description.style.display = 'block';
        this.isExpanded = true;
    }
    collapse() {
        this.description.style.display = 'none';
        this.isExpanded = false;
    }
    toggleSelect(id) {
        if(equals(this.id, id)) {
            if(!this.isSelected) {
                this.select();
                this.expand();
            }
        } else {
            this.diselect();
        }
    }
    select() {
        this.indicator.innerHTML = radioOn;
        this.isSelected = true;
    }
    diselect() {
        this.indicator.innerHTML = radioOff;
        this.isSelected = false;
    }
    onRadio(e) {
        e.stopPropagation();
        xf.dispatch('ui:workout:select', this.id);
    }
    onUpdate(value) {
        if(!equals(value, this.state)) {
            this.state = value;
            this.render();
        }
    }
    render() {
        // this.innerHTML = workoutTemplate(this.state);
    }
}

customElements.define('workout-list', WorkoutList, {extends: 'ul'});
customElements.define('workout-item', WorkoutListItem, {extends: 'li'});
