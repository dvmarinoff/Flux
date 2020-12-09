import { xf } from './xf.js';
import { avgOfArray,
         hrToColor,
         powerToZone,
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
    xf.sub('db:distance', e => {
        let dis = e.detail.data.distance;
        dom.distance.textContent = `${metersToDistance(dis)}`;
    });
    xf.sub('db:vspd', e => {
        let vspd = e.detail.data.vspd;
        dom.speed.textContent = `${vspd.toFixed(1)}`;
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

function ControllableSettingsView(args) {
    let dom  = args.dom;
    let name = args.name || 'controllable';

    xf.sub('db:pwr', e => {
        let power = e.detail.data.pwr;
        dom.power.textContent = `${power}`;
    });
    xf.sub('db:cad', e => {
        let cadence = e.detail.data.cad;
        dom.cadence.textContent = `${cadence}`;
    });
    xf.sub('db:spd', e => {
        let speed = e.detail.data.spd;
        dom.speed.textContent = `${speed}`;
    });

    xf.sub(`${name}:info`, e => {
        console.log(e.detail.data);
        dom.name.textContent         = `${e.detail.data.name}`;
        dom.model.textContent        = `${e.detail.data.modelNumberString}`;
        dom.manufacturer.textContent = `${e.detail.data.manufacturerNameString}`;
        dom.firmware.textContent     = `${e.detail.data.firmwareRevisionString}`;
    });
}

function HrbSettingsView(args) {
    let dom  = args.dom;
    let name = args.name || 'hrb';

    xf.sub('db:hr', e => {
        let hr = e.detail.data.hr;
        dom.value.textContent = `${hr} bpm`;
    });

    xf.sub(`${name}:info`, e => {
        console.log(e.detail.data);
        dom.name.textContent         = `${e.detail.data.name}`;
        dom.model.textContent        = `${e.detail.data.modelNumberString}`;
        dom.manufacturer.textContent = `${e.detail.data.manufacturerNameString}`;
        dom.firmware.textContent     = `${e.detail.data.firmwareRevisionString}`;
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
        dom.ftp.textContent = `FTP ${ftp}`;
    });
    xf.sub('db:pwr', e => {
        let pwr = e.detail.data.pwr;
        let h = valueToHeight(scale, pwr);
        count += 1;
        if(count >= size) {
            dom.graph.removeChild(dom.graph.childNodes[0]);
        }
        dom.graph.insertAdjacentHTML('beforeend', `<div class="graph-bar zone-${(powerToZone(pwr, ftp)).name}" style="height: ${h}%"></div>`);
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
        dom.graph.insertAdjacentHTML('beforeend', `<div class="graph-bar ${hrToColor(hr).name}-zone" style="height: ${h}%"></div>`);
    });
}

function GraphWorkout(args) {
    let dom      = args.dom;
    let interval = 0;
    let step     = 0;
    let index    = 0;
    let setProgress = (index) => {
        let rect = dom.intervals[index].getBoundingClientRect();
        dom.active.style.left    = `${rect.left}px`;
        dom.active.style.width   = `${rect.width}px`;
    };

    xf.reg('db:workout', e => {
        let workout = e.detail.data.workout;
        // dom.name.textContent = workout.name;

        dom.graph.innerHTML = ``;
        dom.graph.insertAdjacentHTML('beforeend',
                                     `<div id="progress" class="progress"></div>
                                      <div id="progress-active"></div>
                                      ${workout.graph}`);

        dom.progress  = document.querySelector('#progress');
        dom.active    = document.querySelector('#progress-active');
        dom.intervals = document.querySelectorAll('#current-workout-graph .graph-interval');
        dom.steps     = document.querySelectorAll('#current-workout-graph .graph-bar');
    });

    xf.reg('watch:nextWorkoutInterval', e => {
        interval = e.detail.data;
        setProgress(interval);
    });
    xf.reg('watch:nextWorkoutStep', e => {
        step = e.detail.data;
    });

    xf.reg('screen:change', e => {
        setProgress(interval);
    });
}

function NavigationWidget(args) {
    let dom = args.dom;
    let i   = 1;

    xf.sub('pointerup', e => {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();

        i = dom.homeBtn.getAttribute('date-index');
        dom.homePage.style.display     = 'block';
        dom.settingsPage.style.display = 'none';
        dom.workoutsPage.style.display = 'none';
        dom.controls.style.display     = 'block';

        dom.settingsBtn.classList.remove('active');
        dom.homeBtn.classList.add('active');
        dom.workoutsBtn.classList.remove('active');

        dom.menu.classList.remove('active');

        xf.dispatch('ui:tab', i);
    }, dom.homeBtn);

    xf.sub('pointerup', e => {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();

        i = dom.settingsBtn.getAttribute('date-index');
        dom.settingsPage.style.display = 'block';
        dom.homePage.style.display     = 'none';
        dom.workoutsPage.style.display = 'none';
        dom.controls.style.display     = 'none';

        dom.settingsBtn.classList.add('active');
        dom.homeBtn.classList.remove('active');
        dom.workoutsBtn.classList.remove('active');

        dom.menu.classList.add('active');

        xf.dispatch('ui:tab', i);
    }, dom.settingsBtn);

    xf.sub('pointerup', e => {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();

        i = dom.workoutsBtn.getAttribute('date-index');
        dom.workoutsPage.style.display = 'block';
        dom.homePage.style.display     = 'none';
        dom.settingsPage.style.display = 'none';
        dom.controls.style.display     = 'block';

        dom.settingsBtn.classList.remove('active');
        dom.homeBtn.classList.remove('active');
        dom.workoutsBtn.classList.add('active');

        dom.menu.classList.remove('active');

        xf.dispatch('ui:tab', i);
    }, dom.workoutsBtn);

}

function SettingsView(args) {
    let dom = args.dom;
    let ftp = 100;
    let weight = 75;

    xf.sub('db:ftp', e => {
        ftp = e.detail.data.ftp;
        dom.ftp.value = ftp;
    });
    xf.sub('db:weight', e => {
        weight = e.detail.data.weight;
        dom.weight.value = weight;
    });

    xf.sub('change', e => { ftp    = parseInt(e.target.value); }, dom.ftp);
    xf.sub('change', e => { weight = parseInt(e.target.value); }, dom.weight);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:ftp', ftp);
    }, dom.ftpBtn);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:weight', weight);
    }, dom.weightBtn);
}

function ControlView(args) {
    let dom = args.dom;

    // Resistance mode
    let resistance             = 0;
    let minResistanceSupported = 0;
    let maxResistanceSupported = 1000;
    let resistanceInc          = 100;

    xf.sub('change', e => {
        let value = parseInt(e.target.value || 0);
        if(value <= minResistanceSupported) {
            resistance = minResistanceSupported;
            dom.resistanceValue.value = resistance;
        }
        if(value >= maxResistanceSupported) {
            resistance = maxResistanceSupported;
            dom.resistanceValue.value = resistance;
        }
        if(value >= minResistanceSupported && value < maxResistanceSupported) {
            resistance = value;
        }
        xf.dispatch('ui:resistance-target', resistance);
    }, dom.resistanceValue);

    xf.sub('pointerup', e => {
        let target = resistance + resistanceInc;
        if(target >= maxResistanceSupported) {
            resistance = maxResistanceSupported;
        } else if(target < minResistanceSupported) {
            resistance = minResistanceSupported;
        } else {
            resistance = target;
        }
        dom.resistanceValue.value = resistance;
        xf.dispatch('ui:resistance-target', resistance);
    }, dom.resistanceInc);

    xf.sub('pointerup', e => {
        let target = resistance - resistanceInc;
        if(target >= maxResistanceSupported) {
            resistance = maxResistanceSupported;
        } else if(target < 0) {
            resistance = minResistanceSupported;
        } else {
            resistance = target;
        }
        dom.resistanceValue.value = resistance;
        xf.dispatch('ui:resistance-target', resistance);
    }, dom.resistanceDec);

    // xf.sub('pointerup', e => {
    //     xf.dispatch('ui:resistance-target', resistance);
    // }, dom.resistanceSet);

    // Slope mode
    let slope             = 0;
    let minSlopeSupported = -10.0;
    let maxSlopeSupported = 10.0;
    let slopeInc          = 0.5;

    xf.sub('change', e => {
        let value = parseFloat(e.target.value || 0);
        if(value > minSlopeSupported && value < maxSlopeSupported) {
            slope = value;
        }
        if(value >= maxSlopeSupported) {
            slope = maxSlopeSupported - 0;
            dom.slopeValue.value = slope;
        }
        if(value <= minSlopeSupported) {
            slope = minSlopeSupported + 0;
            dom.slopeValue.value = slope;
        }
        xf.dispatch('ui:slope-target', slope);
    }, dom.slopeValue);

    xf.sub('pointerup', e => {
        let target = slope + slopeInc;
        if(target >= maxSlopeSupported) {
            slope = maxSlopeSupported;
        } else if(target < minSlopeSupported) {
            slope = minSlopeSupported;
        } else {
            slope = target;
        }
        dom.slopeValue.value = slope;
        xf.dispatch('ui:slope-target', slope);
    }, dom.slopeInc);

    xf.sub('pointerup', e => {
        let target = slope - slopeInc;
        if(target >= maxSlopeSupported) {
            slope = maxSlopeSupported;
        } else if(target < 0) {
            slope = 0;
        } else {
            slope = target;
        }
        dom.slopeValue.value = slope;
        xf.dispatch('ui:slope-target', slope);
    }, dom.slopeDec);

    // xf.sub('pointerup', e => {
    //     xf.dispatch('ui:slope-target', slope);
    // }, dom.slopeSet);

    // ERG mode
    let targetPwr = 100;
    let workPwr   = 235;
    let restPwr   = 100;
    xf.sub('change', e => { targetPwr = parseInt(e.target.value); }, dom.targetPower);
    xf.sub('change', e => { workPwr   = parseInt(e.target.value); }, dom.workPower);
    xf.sub('change', e => { restPwr   = parseInt(e.target.value); }, dom.restPower);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:target-pwr', targetPwr);
    }, dom.setTargetPower);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:target-pwr', workPwr);
        xf.dispatch('ui:watchLap');
    }, dom.startWorkInterval);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:target-pwr', restPwr);
        xf.dispatch('ui:watchLap');
    }, dom.startRestInterval);

}

function WatchView(args) {
    let dom = args.dom;

    xf.sub('pointerup', e => xf.dispatch('ui:watchStart'),   dom.start);
    xf.sub('pointerup', e => xf.dispatch('ui:watchPause'),   dom.pause);
    xf.sub('pointerup', e => xf.dispatch('ui:watchLap'),     dom.lap);
    xf.sub('pointerup', e => xf.dispatch('ui:watchStop'),    dom.stop);
    xf.sub('pointerup', e => xf.dispatch('ui:workoutStart'), dom.workout);

    xf.reg('db:workout', e => {
        let workout = e.detail.data.workout;
        dom.name.textContent = workout.name;
    });

    dom.pause.style.display = 'none';
    dom.stop.style.display  = 'none';
    dom.save.style.display  = 'none';
    dom.lap.style.display   = 'none';

    xf.sub('watch:started', e => {
        // dom.start.textContent = 'Pause';
        dom.start.style.display = 'none';
        dom.save.style.display  = 'none';
        dom.pause.style.display = 'inline-block';
        dom.lap.style.display   = 'inline-block';
        // dom.stop.style.display  = 'none';
        dom.stop.style.display  = 'inline-block';
    });
    xf.sub('watch:paused', e => {
        // dom.start.textContent = 'Resume';
        dom.pause.style.display = 'none';
        dom.start.style.display = 'inline-block';
        // dom.stop.style.display  = 'inline-block';
    });
    xf.sub('watch:stopped', e => {
        // dom.start.textContent = 'Start';
        dom.pause.style.display   = 'none';
        dom.lap.style.display     = 'none';
        dom.stop.style.display    = 'none';
        dom.save.style.display    = 'inline-block';
        dom.workout.style.display = 'inline-block';
        dom.start.style.display    = 'inline-block';
    });
    xf.sub('watch:workoutStarted', e => {
        dom.workout.style.display = 'none';
    });
}


function WorkoutsView(args) {
    let dom = args.dom;
    let id  = 0;

    let off = `
        <svg class="radio radio-off" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path fill="#fff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12
                    2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
        </svg>`;

    let on = `
        <svg class="radio radio-on" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path fill="#fff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0
                    18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
            <circle fill="#fff" cx="12" cy="12" r="5"/>
        </svg>`;
    xf.reg('workouts:init', e => {
        dom.list.innerHTML = '';
    });

    xf.reg('workout:add', e => {
        let w = e.detail.data;

        let item = `
            <div class='workout list-item cf' id="li${w.id}">
                <div class="first-row">
                    <div class="name t6">${w.name}</div>
                    <div class="type t6">${w.type}</div>
                    <div class="time t6">${w.duration} min</div>
                    <div class="select" id="btn${w.id}">${w.id === 0 ? on : off}</div>
                </div>
                <div class="second-row">
                    <div class="desc">
                        <div class="workout-graph">${w.graph}</div>
                        <div class="content t5">${w.description}</div>
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
            dom.select[id].innerHTML   = off;
            dom.select[w.id].innerHTML = on;
            xf.dispatch('ui:workout:set', w.id);
            id = w.id;
        }, dom.select[w.id]);

    });
}

function LoadWorkoutView(args) {
    let dom = args.dom;
    xf.sub('change', e => {
        let file = e.target.files[0];
        console.log(file);
        xf.dispatch('ui:workoutFile', file);
    }, dom.fileBtn);
}

function ActivityView(args) {
    let dom = args.dom;
    xf.sub('pointerup', e => {
        xf.dispatch('ui:activity:save');
    }, dom.saveBtn);
}


function RampTest() {
    let startFTP = 0;
    let progressFTP = 0;

    xf.sub('db:ftp', e => {
        startFTP = e.detail.data.ftp;
    });

    xf.sub('ftptest:progress', e => {
    });
}

function ReconView(args) {
    let dom = args.dom;
    let points = [];

    xf.sub('db:points', e => {
        points = e.detail.data.points;

        console.log(points);

        // dom.graph.innerHTML = ``;

        // points.forEach((point, i) => {
        //     let elevation = point.elevation;
        //     dom.graph.insertAdjacentHTML('beforeend',
        //                                  `<div class="elevation-bar" style="height: ${elevation/10}px; background-color: var(--zone-blue);"></div>`);
        // });
    });
}

export {
    ControllableConnectionView,
    HrbConnectionView,
    ControllableSettingsView,
    HrbSettingsView,
    DataScreen,
    GraphHr,
    GraphPower,
    GraphWorkout,
    ControlView,
    WatchView,
    LoadWorkoutView,
    WorkoutsView,
    ActivityView,
    NavigationWidget,
    SettingsView,
    ReconView,
};

