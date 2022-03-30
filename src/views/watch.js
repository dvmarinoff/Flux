import { xf } from '../functions.js';

class Watch extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.dom = {
            start:   document.querySelector('#watch-start'),
            pause:   document.querySelector('#watch-pause'),
            lap:     document.querySelector('#watch-lap'),
            stop:    document.querySelector('#watch-stop'),
            save:    document.querySelector('#activity-save'),
            workout: document.querySelector('#start-workout'),
        };

        this.dom.start.addEventListener('pointerup', this.onStart);
        this.dom.pause.addEventListener('pointerup', this.onPause);
        this.dom.lap.addEventListener('pointerup', this.onLap);
        this.dom.stop.addEventListener('pointerup', this.onStop);
        this.dom.workout.addEventListener('pointerup', this.onWorkoutStart);
        this.dom.save.addEventListener(`pointerup`, this.onSave);

        this.renderInit(this.dom);

        xf.sub(`db:watchStatus`, this.onWatchStatus.bind(this));
        xf.sub(`db:workoutStatus`, this.onWorkoutStatus.bind(this));

    }
    disconnectedCallback() {
       this.dom.start.removeEventListener(`pointerup`, this.onStart);
       this.dom.pause.removeEventListener(`pointerup`, this.onPause);
       this.dom.lap.removeEventListener(`pointerup`, this.onLap);
       this.dom.stop.removeEventListener(`pointerup`, this.onStop);
       this.dom.workout.removeEventListener(`pointerup`, this.onWorkoutStart);
       this.dom.save.removeEventListener(`pointerup`, this.onSave);
       document.removeEventListener(`db:watchStatus`, this.onWatchStatus);
       document.removeEventListener(`db:workoutStatus`, this.onWorkoutStatus);
    }
    onStart(e) { xf.dispatch('ui:watchStart'); }
    onPause(e) { xf.dispatch('ui:watchPause'); }
    onLap(e)   { xf.dispatch('ui:watchLap'); }
    onStop(e)  { xf.dispatch('ui:watchStop'); }
    onSave(e)  { xf.dispatch('ui:activity:save'); }
    onWorkoutStart(e) { xf.dispatch('ui:workoutStart'); }
    onWatchStatus(status) {
        if(status === 'started') { this.renderStarted(this.dom); }
        if(status === 'paused')  { this.renderPaused(this.dom);  }
        if(status === 'stopped') { this.renderStopped(this.dom); }
    }
    onWorkoutStatus(status) {
        if(status === 'started') { this.renderWorkoutStarted(this.dom); }
        if(status === 'done')    {  }
    }
    renderInit(dom) {
        dom.pause.style.display = 'none';
        dom.stop.style.display  = 'none';
        dom.save.style.display  = 'none';
        dom.lap.style.display   = 'none';
    };
    renderStarted(dom) {
        dom.start.style.display = 'none';
        dom.save.style.display  = 'none';
        dom.pause.style.display = 'inline-block';
        dom.lap.style.display   = 'inline-block';
        dom.stop.style.display  = 'none';
        // dom.stop.style.display  = 'inline-block';
    };
    renderPaused(dom) {
        dom.pause.style.display = 'none';
        dom.start.style.display = 'inline-block';
        dom.stop.style.display  = 'inline-block';
    };
    renderStopped(dom) {
        dom.pause.style.display   = 'none';
        dom.lap.style.display     = 'none';
        dom.stop.style.display    = 'none';
        dom.save.style.display    = 'inline-block';
        dom.workout.style.display = 'inline-block';
        dom.start.style.display   = 'inline-block';
    };
    renderWorkoutStarted(dom) {
        dom.workout.style.display = 'none';
    };
}

customElements.define('watch-control', Watch);

export { Watch };
