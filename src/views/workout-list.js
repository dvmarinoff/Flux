import { xf, empty, equals } from '../functions.js';
import { models } from '../models/models.js';
import { intervalsToGraph } from './workout-graph.js';

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
    let duration = '';
    if(workout.meta.duration) {
        duration = `${Math.round(workout.meta.duration / 60)} min`;
    }
    if(workout.meta.distance) {
        duration = `${Math.round(workout.meta.distance) / 1000} km`;
    }
    return `<li is="workout-item" class='workout cf' id="${workout.id}" metric="ftp">
                <div class="workout--short-info">
                    <div class="workout--name">${workout.meta.name}</div>
                    <div class="workout--type">${workout.meta.category}</div>
                    <div class="workout--duration">${duration}</div>
                    <div class="workout--select" id="btn${workout.id}">${workout.selected ? radioOn : radioOff}</div>
                </div>
                <div class="workout--full-info">
                    <div class="workout--graph-cont">${workout.graph}</div>
                    <div class="workout--description">${workout.meta.description}</div>
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
        this.workout = {};
    }
    postInit() { return; }
    connectedCallback() {
        this.prop = this.getAttribute('prop');
        this.metricProp = this.getAttribute('metric');
        xf.sub(`db:${this.prop}`, this.onUpdate.bind(this));
        xf.sub(`db:${this.metricProp}`, this.onMetric.bind(this));
        xf.sub('db:workout', this.onWorkout.bind(this));
    }
    disconnectedCallback() {
        document.removeEventListener(`db:${this.prop}`, this.onUpdate);
    }
    getWidth() {
        return window.innerWidth;
    }
    onWorkout(workout) {
        this.workout = workout;
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
        // if(!equals(value, this.state)) {
            this.state = value;
            this.render();
        // }
    }
    stateToHtml (state, metric, selectedWorkout) {
        const self = this;
        const viewPort = {height: 118, width: self.getWidth(), aspectRatio: self.getWidth() / 118 };
        return state.reduce((acc, workout, i) => {
            const graph = intervalsToGraph(workout.intervals, metric, viewPort);
            const selected = equals(workout.id, selectedWorkout.id);
            workout = Object.assign(workout, {graph: graph, selected: selected});
            return acc + workoutTemplate(workout);
        }, '');
    }
    render() {
        this.innerHTML = this.stateToHtml(this.state, this.metric, this.workout);
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
        this.summary = this.querySelector('.workout--short-info');
        this.description = this.querySelector('.workout--full-info');
        this.selectBtn = this.querySelector('.workout--select');
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
    onWorkout(workout) {
        this.workout = workout;
        this.toggleSelect(workout.id);
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
    render() {}
}

customElements.define('workout-list', WorkoutList, {extends: 'ul'});
customElements.define('workout-item', WorkoutListItem, {extends: 'li'});

