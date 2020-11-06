import { xf } from './xf.js';
import { avgOfArray,
         powerToColor,
         hrToColor,
         valueToHeight,
         secondsToHms,
         metersToDistance } from './functions.js';
import { parseZwo, intervalsToGraph } from './parser.js';

function ControllableConnectionView(args) {
    let dom = args.dom;
    xf.sub('pointerup', e => xf.dispatch('ui:controllableSwitch'), dom.switchBtn);

    xf.sub('controllable:connected', e => {
        dom.indicator.classList.remove('off');
        dom.indicator.classList.add('on');
    });

    xf.sub('controllable:disconnected', e => {
        dom.indicator.classList.remove('on');
        dom.indicator.classList.add('off');
    });
}

function HrbConnectionView(args) {
    let dom = args.dom;
    xf.sub('pointerup', e => xf.dispatch('ui:hrbSwitch'), dom.switchBtn);

    xf.sub('hrb:connected', e => {
        dom.indicator.classList.remove('off');
        dom.indicator.classList.add('on');
    });

    xf.sub('hrb:disconnected', e => {
        dom.indicator.classList.remove('on');
        dom.indicator.classList.add('off');
    });
}

function DataScreen(args) {
    let dom = args.dom;
    xf.sub('db:hr', e => {
        let hr = e.detail.data.hr;
        dom.heartRate.textContent = `${hr}`;
    });
    xf.sub('db:pwr', e => {
        let pwr = e.detail.data.pwr;
        dom.power.textContent = `${pwr}`;
    });
    xf.sub('db:vspd', e => {
        let vspd = e.detail.data.vspd;
        dom.speed.textContent = `${vspd.toFixed(1)}`;
    });
    xf.sub('db:vdis', e => {
        let vdis = e.detail.data.vdis;
        dom.distance.textContent = `${metersToDistance(vdis)}`;
    });
    xf.sub('db:spd', e => {
        let spd = e.detail.data.spd;
        dom.speed.textContent = `${spd.toFixed(1)}`;
    });
    xf.sub('db:cad', e => {
        let cad = e.detail.data.cad;
        dom.cadence.textContent = `${cad}`;
    });
    xf.sub('db:elapsed', e => {
        let elapsed = e.detail.data.elapsed;
        dom.time.textContent = secondsToHms(elapsed);
    });
    xf.sub('db:lapTime', e => {
        let lapTime = e.detail.data.lapTime;
        if(!Number.isInteger(lapTime)) {
            lapTime = 0;
        }
        if(lapTime < 0) {
            lapTime = 0;
        }
        dom.interval.textContent = secondsToHms(lapTime, true);
    });
    xf.sub('db:targetPwr', e => {
        dom.targetPwr.textContent = e.detail.data.targetPwr;
    });
}

function GraphPower(args) {
    let dom = args.dom;
    let ftp = 100;
    let size = dom.cont.getBoundingClientRect().width;
    let count = 0;
    let scale = 400;

    xf.sub('db:ftp', e => {
        ftp = e.detail.data.ftp;
    });
    xf.sub('db:pwr', e => {
        let pwr = e.detail.data.pwr;
        let h = valueToHeight(scale, pwr);
        count += 1;
        if(count >= size) {
            dom.graph.removeChild(dom.graph.childNodes[0]);
        }
        dom.graph.insertAdjacentHTML('beforeend', `<div class="graph-bar ${(powerToColor(pwr, ftp)).name}-zone" style="height: ${h}%"></div>`);
    });
}

function GraphHr(args) {
    let dom = args.dom;
    let count = 0;
    let scale = 200;
    let size = dom.cont.getBoundingClientRect().width;
    xf.sub('db:hr', e => {
        let hr = e.detail.data.hr;
        let h = valueToHeight(scale, hr);
        count += 1;
        if(count >= size) {
            // dom.graph.style.left = `-${count}px`; // shift and keep
            dom.graph.removeChild(dom.graph.childNodes[0]); // shift and replace
        }
        dom.graph.insertAdjacentHTML('beforeend', `<div class="graph-bar ${hrToColor(hr)}-zone" style="height: ${h}%"></div>`);
    });
}

function GraphWorkout(args) {
    let dom = args.dom;
    let index = 0;
    let setProgress = index => {
        let rect = dom.intervals[index].getBoundingClientRect();
        dom.active.style.left    = `${rect.left}px`;
        dom.active.style.width   = `${rect.width}px`;
        // dom.progress.style.width = `${rect.left}px`;
    };

    xf.reg('db:workout', e => {
        let workout = e.detail.data.workout;
        dom.name.textContent = workout.name;

        dom.graph.innerHTML = ``;
        dom.graph.insertAdjacentHTML('beforeend',
                                     `<div id="progress" class="progress"></div>
                                      <div id="progress-active"></div>
                                      ${workout.graph}`);

        dom.progress  = document.querySelector('#progress');
        dom.active    = document.querySelector('#progress-active');
        dom.intervals = document.querySelectorAll('#current-workout-graph .graph-bar');
    });

    xf.reg('watch:nextWorkoutInterval', e => {
        index = e.detail.data;
        setProgress(index);
    });

    xf.reg('screen:change', e => {
        setProgress(index);
    });
}

function ControlView(args) {
    let dom       = args.dom;
    let targetPwr = 100;
    let workPwr   = 235;
    let restPwr   = 100;

    xf.sub('change', e => { targetPwr = e.target.value; }, dom.targetPower);
    xf.sub('change', e => { workPwr = e.target.value; },   dom.workPower);
    xf.sub('change', e => { restPwr = e.target.value; },   dom.restPower);

    xf.sub('pointerup', e => { xf.dispatch('ui:target-pwr', targetPwr); }, dom.setTargetPower);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:target-pwr', workPwr);
        xf.dispatch('ui:watchLap');

        let res2 = window.navigator.vibrate([200, 800, 200, 800, 200, 800, 1000]);
    }, dom.startWorkInterval);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:target-pwr', restPwr);
        xf.dispatch('ui:watchLap');
    }, dom.startRestInterval);

    xf.sub('pointerup', e => xf.dispatch('ui:darkMode'),    dom.darkMode);
    xf.sub('pointerup', e => xf.dispatch('ui:watchStart'),  dom.watch.start);
    xf.sub('pointerup', e => xf.dispatch('ui:watchLap'),    dom.watch.lap);
    xf.sub('pointerup', e => xf.dispatch('ui:watchStop'),   dom.watch.stop);
    xf.sub('pointerup', e => xf.dispatch('ui:workoutStart'), dom.startWorkout);

    xf.sub('db:darkMode', e => {
        let mode = e.detail.data.darkMode;
        console.log(mode);
        if(mode) {
            dom.theme.classList.remove('light');
            dom.theme.classList.add('dark');
        } else {
            dom.theme.classList.remove('dark');
            dom.theme.classList.add('light');
        }
    });

    xf.sub('watch:started', e => {
        dom.watch.start.textContent = 'Pause';
    });
    xf.sub('watch:paused', e => {
        dom.watch.start.textContent = 'Resume';
    });
    xf.sub('watch:stopped', e => {
        dom.watch.start.textContent = 'Start';
    });
}


function WorkoutsView(args) {
    let dom = args.dom;

    xf.reg('workout:add', e => {
        let w = e.detail.data;

        let item = `
            <div class='workout list-item cf' id="li${w.id}">
                <div class="first-row">
                    <div class="name t4">${w.name}</div>
                    <div class="type t4">${w.type}</div>
                    <div class="time t4">${w.duration} min</div>
                    <div class="select" id="btn${w.id}"><button class="btn">Select</button></div>
                </div>
                <div class="second-row">
                    <div class="desc">
                        <div class="workout-graph">${w.graph}</div>
                        <div class="content t4">${w.description}</div>
                    </div>
                </div>
            </div>`;

        dom.list.insertAdjacentHTML('beforeend', item);

        dom.items.push(document.querySelector(`.list #li${w.id} .first-row`));
        dom.select.push(document.querySelector(`.list #btn${w.id}`));
        dom.descriptions.push(document.querySelector(`.list #li${w.id} .desc`));

        xf.sub('pointerup', e => {
            let display = window.getComputedStyle(dom.descriptions[w.id])
                .getPropertyValue('display');

            if(display === 'none') {
                dom.descriptions[w.id].style.display = 'block';
            } else {
                dom.descriptions[w.id].style.display = 'none';
            }
        }, dom.items[w.id]);

        xf.sub('pointerup', e => {
            e.stopPropagation();
            xf.dispatch('ui:workout:set', w.id);
        }, dom.select[w.id]);

    });
}


function LoadWorkoutView(args) {
    let dom = args.dom;
    xf.sub('change', e => {
        let file = e.target.files[0];
        console.log(file);
        xf.dispatch('ui:workoutFile', file);
    }, dom.loadBtn);
}

function ActivityView(args) {
    let dom = args.dom;
    xf.sub('pointerup', e => {
        xf.dispatch('ui:activity:save');
    }, dom.saveBtn);
}

export {
    ControllableConnectionView,
    HrbConnectionView,
    DataScreen,
    GraphHr,
    GraphPower,
    GraphWorkout,
    ControlView,
    LoadWorkoutView,
    WorkoutsView,
    ActivityView,
};

