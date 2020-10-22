import { xf } from './xf.js';

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

function secondsToHms(elapsed, compact = false) {
    let hour = Math.floor(elapsed / 3600);
    let min  = Math.floor(elapsed % 3600 / 60);
    let sec  = elapsed % 60;
    let sD = (sec < 10)  ? `0${sec}`  : `${sec}`;
    let mD = (min < 10)  ? `0${min}`  : `${min}`;
    let hD = (hour < 10) ? `0${hour}` : `${hour}`;
    return compact ? `${mD}:${sD}` : `${hD}:${mD}:${sD}`;
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
    xf.sub('db:spd', e => {
        let spd = e.detail.data.spd;
        dom.speed.textContent = `${spd}`;
    });
    xf.sub('db:cad', e => {
        let cad = e.detail.data.cad;
        dom.cadence.textContent = `${cad}`;
    });
    xf.sub('db:elapsed', e => {
        let elapsed = e.detail.data.elapsed;
        dom.time.textContent = secondsToHms(elapsed);
    });
    xf.sub('db:interval', e => {
        let interval = e.detail.data.interval;
        dom.interval.textContent = secondsToHms(interval, true);
    });
    xf.sub('db:targetPwr', e => {
        dom.targetPwr.textContent = e.detail.data.targetPwr;
    });
}

function hrToColor(value) {
    let color = 'gray';
    if(value < 100) {
        color = 'gray';
    } else if(value < 120) {
        color = 'blue';
    } else if(value < 160) {
        color = 'green';
    } else if(value < 175) {
        color = 'yellow';
    } else if(value < 190) {
        color = 'orange';
    } else {
        color = 'red';
    }
    return color;
}

function pwrToColor(value) {
    let color = 'gray';
    let ftp = 256;
    if(value < (ftp * 0.55)) {
        color = 'gray';
    } else if(value < (ftp * 0.76)) {
        color = 'blue';
    } else if(value < (ftp * 0.88)) {
        color = 'green';
    } else if(value < (ftp * 0.95)) {
        color = 'yellow';
    } else if(value < (ftp * 1.06)) {
        color = 'yellow';
    } else if (value < (ftp * 1.20)) {
        color = 'orange';
    } else {
        color = 'red';
    }
    return color;
}

function valueToHeight(max, value) {
    return 100 * (value/max);
}

function GraphPower(args) {
    let dom = args.dom;
    let size = dom.cont.getBoundingClientRect().width;
    let count = 0;
    let scale = 400;
    xf.sub('db:pwr', e => {
        let pwr = e.detail.data.pwr;
        let h = valueToHeight(scale, pwr);
        count += 1;
        if(count >= size) {
            dom.graph.removeChild(dom.graph.childNodes[0]);
        }
        dom.graph.insertAdjacentHTML('beforeend', `<div class="graph-bar ${pwrToColor(pwr)}-zone" style="height: ${h}%"></div>`);
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

    // xf.sub('watch:lap', e => {
    //     let lap = e.detail.data;
    //     console.log(lap);
    //     let time = lap.lapTime;
    //     let start = lap.start;
    //     let end = lap.end;
    //     // dom.laps.insertAdjacentHTML('beforeend',
    //     //                             `<div class="lap"><div>${time}</div><div>${start}</div><div>${end}</div>></div>`);
    // });
}


function WorkoutsView(args) {
    let dom = args.dom;
    let workouts = args.workouts;

    workouts.forEach( (w, i) => {
        let item = `
            <div class='workout list-item cf' id="li${i}">
                <div class="first-row">
                    <div class="name t4">${w.name}</div>
                    <div class="type t4">${w.type}</div>
                    <div class="time t4">${w.duration} min</div>
                    <div class="select" id="btn${i}"><button class="btn">Select</button></div>
                </div>
                <div class="second-row">
                    <div class="desc"><div class="content t4">${w.description}</div></div>
                </div>
            </div>
`;

        dom.list.insertAdjacentHTML('beforeend', item);

        dom.items.push(document.querySelector(`.list #li${i} .first-row`));
        dom.select.push(document.querySelector(`.list #btn${i}`));
        dom.descriptions.push(document.querySelector(`.list #li${i} .desc`));

        xf.sub('pointerup', e => {
            let display = window.getComputedStyle(dom.descriptions[i])
                                .getPropertyValue('display');

            if(display === "none") {
                dom.descriptions[i].style.display = 'block';
            } else {
                dom.descriptions[i].style.display = 'none';
            }
        }, dom.items[i]);

        xf.sub('pointerup', e => {
            e.stopPropagation();
            xf.dispatch('ui:workouts:select', i);
            xf.dispatch('file:workout', workouts[i].xml);
        }, dom.select[i]);
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

export {
    ControllableConnectionView,
    HrbConnectionView,
    DataScreen,
    GraphHr,
    GraphPower,
    ControlView,
    LoadWorkoutView,
    WorkoutsView,
};

