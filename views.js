import { xf } from './xf.js';
import { q } from './q.js';
import { avgOfArray,
         hrToColor,
         powerToZone,
         valueToHeight,
         secondsToHms,
         metersToDistance,
         parseNumber,
         fixInRange } from './functions.js';
import { parseZwo, intervalsToGraph } from './parser.js';

function ControllableConnectionView(dom) {
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

function HrbConnectionView(dom) {
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

function ConnectionControlsView() {
    let dom = {
        controllableHome: {
            switchBtn: q.get('#controllable-connection-btn'),
            indicator: q.get('#controllable-connection-btn .indicator'),
        },
        hrbHome: {
            switchBtn: q.get('#hrb-connection-btn'),
            indicator: q.get('#hrb-connection-btn .indicator'),
        },
        controllableSettings: {
            switchBtn: q.get('#controllable-settings-btn'),
            indicator: q.get('#controllable-settings-btn .indicator'),
        },
        hrbSettings: {
            switchBtn: q.get('#hrb-settings-btn'),
            indicator: q.get('#hrb-settings-btn .indicator'),
        }
    };

    ControllableConnectionView(dom.controllableHome);
    HrbConnectionView(dom.hrbHome);

    ControllableConnectionView(dom.controllableSettings);
    HrbConnectionView(dom.hrbSettings);
}

function ControllableSettingsView(args) {
    let name = args.name || 'controllable';
    let dom  = {
        switchBtn:     q.get('#controllable-settings-btn'),
        indicator:     q.get('#controllable-settings-btn .indicator'),
        name:          q.get('#controllable-settings-name'),
        manufacturer:  q.get('#controllable-settings-manufacturer'),
        model:         q.get('#controllable-settings-model'),
        firmware:      q.get('#controllable-settings-firmware'),
        power:         q.get('#controllable-settings-power'),
        cadence:       q.get('#controllable-settings-cadence'),
        speed:         q.get('#controllable-settings-speed'),
    };

    xf.sub('db:pwr', pwr => {
        dom.power.textContent = `${pwr}`;
    });
    xf.sub('db:cad', cad => {
        dom.cadence.textContent = `${cad}`;
    });
    xf.sub('db:spd', spd => {
        dom.speed.textContent = `${spd}`;
    });

    xf.sub(`${name}:info`, data => {
        console.log(data);
        dom.name.textContent         = `${data.name}`;
        dom.model.textContent        = `${data.modelNumberString}`;
        dom.manufacturer.textContent = `${data.manufacturerNameString}`;
        dom.firmware.textContent     = `${data.firmwareRevisionString}`;
    });
}

function HrbSettingsView(args) {
    let name = args.name || 'hrb';
    let dom  = {
        switchBtn:    q.get('#hrb-settings-btn'),
        indicator:    q.get('#hrb-settings-btn .indicator'),
        name:         q.get('#hrb-settings-name'),
        manufacturer: q.get('#hrb-settings-manufacturer'),
        model:        q.get('#hrb-settings-model'),
        firmware:     q.get('#hrb-settings-firmware'),
        value:        q.get('#hrb-settings-value'),
        battery:      q.get('#hrb-settings-battery'),
    };

    xf.sub('db:hr', hr => {
        dom.value.textContent = `${hr} bpm`;
    });

    xf.sub(`${name}:info`, data => {
        console.log(data);
        dom.name.textContent         = `${data.name}`;
        dom.model.textContent        = `${data.modelNumberString}`;
        dom.manufacturer.textContent = `${data.manufacturerNameString}`;
        dom.firmware.textContent     = `${data.firmwareRevisionString}`;
    });
}

function DataScreen(args) {
    let dom = {
        time:        q.get('#time'),
        interval:    q.get('#interval-time'),
        powerTarget: q.get('#power-target'),
        power:       q.get('#power'),
        cadence:     q.get('#cadence'),
        speed:       q.get('#speed'),
        distance:    q.get('#distance'),
        heartRate:   q.get('#heart-rate')
    };

    xf.sub('db:hr', hr => {
        dom.heartRate.textContent = `${hr}`;
    });
    xf.sub('db:pwr', pwr => {
        dom.power.textContent = `${pwr}`;
    });
    xf.sub('db:distance', distance => {
        dom.distance.textContent = `${metersToDistance(distance)}`;
    });
    xf.sub('db:vspd', vspd => {
        dom.speed.textContent = `${vspd.toFixed(1)}`;
    });
    xf.sub('db:spd', spd => {
        dom.speed.textContent = `${spd.toFixed(1)}`;
    });
    xf.sub('db:cad', cad => {
        dom.cadence.textContent = `${cad}`;
    });
    xf.sub('db:elapsed', elapsed => {
        dom.time.textContent = secondsToHms(elapsed);
    });
    xf.sub('db:lapTime', lapTime => {
        if(!Number.isInteger(lapTime)) {
            lapTime = 0;
        }
        if(lapTime < 0) {
            lapTime = 0;
        }
        dom.interval.textContent = secondsToHms(lapTime, true);
    });
    xf.sub('db:powerTarget', power => {
        dom.powerTarget.textContent = power;
    });
}

function GraphPower(args) {
    let dom = {
        cont:  q.get('#graph-power'),
        graph: q.get('#graph-power .graph'),
        // ftp:   q.get('#ftp-line-value')
    };
    let ftp = 100;
    let size = dom.cont.getBoundingClientRect().width;
    let count = 0;
    let scale = 400;
    let workout = {};
    let intervalIndex = 0;
    let width = 1;

    function matchInterval() {
        xf.reg('db:elapsed', db => {
            let pwr = db.pwr;
            let h = valueToHeight(scale, pwr);
            dom.graph.insertAdjacentHTML('beforeend',
        `<div class="graph-bar zone-${(powerToZone(pwr, ftp)).name}" style="height: ${h}%; width: ${width}px;"></div>`);
        });
    }

    function freeRide() {
        xf.sub('db:pwr', pwr => {
            let h = valueToHeight(scale, pwr);
            count += 1;
            if(count >= size) {
                dom.graph.removeChild(dom.graph.childNodes[0]);
            }
            dom.graph.insertAdjacentHTML('beforeend',
        `<div class="graph-bar zone-${(powerToZone(pwr, ftp)).name}" style="height: ${h}%; width: ${width};"></div>`);
        });
    }

    matchInterval();

    xf.sub('db:ftp', x => {
        // dom.ftp.textContent = `FTP ${x}`;
        ftp = x;
    });

    xf.sub('db:intervalIndex', index => {
        dom.graph.innerHTML = '';
        intervalIndex = index;
        width = size / workout.intervals[intervalIndex].duration;
    });

    xf.sub('db:workout', x => {
        workout = x;
    });
}

function GraphWorkout() {
    let dom = {
        name:      q.get('#current-workout-name'),
        graph:     q.get('#current-workout-graph'),
        intervals: [],
        steps:     [],
    };

    let interval = 0;
    let step     = 0;
    let index    = 0;
    let setProgress = (index) => {
        let rect = dom.intervals[index].getBoundingClientRect();
        dom.active.style.left    = `${rect.left}px`;
        dom.active.style.width   = `${rect.width}px`;
    };

    xf.reg('db:workout', e => {
        let workout = e.workout;

        dom.graph.innerHTML = ``;
        dom.graph.insertAdjacentHTML('beforeend',
                                     `<div id="progress" class="progress"></div>
                                      <div id="progress-active"></div>
                                      ${workout.graph}`);

        dom.progress  = document.querySelector('#progress');
        dom.active    = document.querySelector('#progress-active');
        dom.intervals = document.querySelectorAll('#current-workout-graph .graph-interval');
        dom.steps     = document.querySelectorAll('#current-workout-graph .graph-bar');

        setProgress(interval);
    });

    xf.sub('db:intervalIndex', i => {
        interval = i;
        setProgress(interval);
    });
    xf.sub('db:stepIndex', i => {
        step = i;
    });
    xf.reg('screen:change', e => {
        setProgress(interval);
    });
}

function NavigationWidget() {
    let dom = {
        menu:         q.get('.menu-cont'),
        tabBtns:      q.getAll('.menu .tab-btn'),
        pages:        q.getAll('.page'),
        homeBtn:      q.get('#home-tab-btn'),
        settingsBtn:  q.get('#settings-tab-btn'),
        workoutsBtn:  q.get('#workouts-tab-btn'),
        homePage:     q.get('#home-page'),
        settingsPage: q.get('#settings-page'),
        workoutsPage: q.get('#workouts-page'),
        controls:     q.get('.control-screen'),
    };

    function uiSettingsPage(dom) {
        dom.settingsPage.style.display = 'block';
        dom.homePage.style.display     = 'none';
        dom.workoutsPage.style.display = 'none';
        dom.controls.style.display     = 'none';

        dom.settingsBtn.classList.add('active');
        dom.homeBtn.classList.remove('active');
        dom.workoutsBtn.classList.remove('active');

        dom.menu.classList.add('active');
    }
    function uiHomePage(dom) {
        dom.homePage.style.display     = 'block';
        dom.settingsPage.style.display = 'none';
        dom.workoutsPage.style.display = 'none';
        dom.controls.style.display     = 'block';

        dom.settingsBtn.classList.remove('active');
        dom.homeBtn.classList.add('active');
        dom.workoutsBtn.classList.remove('active');

        dom.menu.classList.remove('active');
    }
    function uiWorkoutsPage(dom) {
        dom.workoutsPage.style.display = 'block';
        dom.homePage.style.display     = 'none';
        dom.settingsPage.style.display = 'none';
        dom.controls.style.display     = 'block';

        dom.settingsBtn.classList.remove('active');
        dom.homeBtn.classList.remove('active');
        dom.workoutsBtn.classList.add('active');

        dom.menu.classList.remove('active');
    }

    xf.sub('pointerup', e => {
        e.stopPropagation();
        e.preventDefault();
        uiHomePage(dom);
    }, dom.homeBtn);

    xf.sub('pointerup', e => {
        e.stopPropagation();
        e.preventDefault();
        uiSettingsPage(dom);
    }, dom.settingsBtn);

    xf.sub('pointerup', e => {
        e.stopPropagation();
        e.preventDefault();
        uiWorkoutsPage(dom);
    }, dom.workoutsBtn);

}

function SettingsView(args) {
    let dom = {
        ftp:       q.get('#ftp-value'),
        ftpBtn:    q.get('#ftp-btn'),
        weight:    q.get('#weight-value'),
        weightBtn: q.get('#weight-btn'),
    };

    let ftp = 100;
    let weight = 75;

    xf.sub('db:ftp', ftp => {
        dom.ftp.value = ftp;
    });

    xf.sub('db:weight', weight => {
        dom.weight.value = weight;
    });

    xf.sub('change', e => {
        ftp = parseInt(e.target.value);
    }, dom.ftp);

    xf.sub('change', e => {
        weight = parseInt(e.target.value);
    }, dom.weight);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:ftp', ftp);
    }, dom.ftpBtn);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:weight', weight);
    }, dom.weightBtn);
}




function NumberInput(args) {
    let dom     = args.dom;
    let evt     = args.evt  || 'number-input';
    let prop    = args.prop || 'numberInput';
    let minProp = args.minProp;
    let maxProp = args.maxProp;
    let incProp = args.incProp;
    let type    = args.type || 'Int';
    let value   = 0;
    let min     = args.min || 0;
    let max     = args.max || 0;
    let inc     = args.inc || 1;

    xf.sub(`db:${prop}`, x => {
        console.log(`UPDATE: ${evt}, ${x}`);
        value = x;
        dom.input.value = value;
    });

    xf.sub(minProp, x => { min = x; });
    xf.sub(maxProp, x => { max = x; });
    xf.sub(incProp, x => { inc = x; });

    const validate = (input, min, max) => {
        return fixInRange(parseNumber(input, type), min, max);
    };

    xf.sub('change', e => {
        let target = validate(e.target.value, min, max);
        xf.dispatch(`ui:${evt}`, target);
    }, dom.input);

    xf.sub('pointerup', e => {
        let target = value + inc;
        target = validate(target, min, max);
        xf.dispatch(`ui:${evt}`, target);
        console.log(`ui:${evt}, value: ${target}, min: ${min}, max: ${max}, inc: ${inc}, ${prop}`);
    }, dom.incBtn);

    xf.sub('pointerup', e => {
        let target = value - inc;
        target = validate(target, min, max, value);
        xf.dispatch(`ui:${evt}`, target);
        console.log(`ui:${evt}, value: ${target}, min: ${min}, max: ${max}, inc: ${inc}, ${prop}`);
    }, dom.decBtn);
}

function ERG() {
    let dom = {
        powerValue: q.get('#power-target-value'),
        powerInc:   q.get('#power-inc'),
        powerDec:   q.get('#power-dec'),
        ergParams:  q.get('#erg-mode-params'),
    };

    // will ignore max value (most likely)
    let powerTarget = 0;
    let powerMin    = 0;
    let powerMax    = 400;
    let powerInc    = 10;

    dom.ergParams.textContent = `${powerMin} to ${powerMax}`;

    NumberInput({dom: {input:  dom.powerValue,
                       incBtn: dom.powerInc,
                       decBtn: dom.powerDec},
                 evt:     'power-target',
                 prop:    'powerTarget',
                 type:    'Int',
                 min:      powerMin,
                 max:      powerMax,
                 inc:      powerInc,
                 minProp: 'powerMin',
                 maxProp: 'powerMax',
                 incProp: 'powerInc'});
}

function Resistance() {
    let dom = {
        resistanceValue:  q.get('#resistance-value'),
        resistanceInc:    q.get('#resistance-inc'),
        resistanceDec:    q.get('#resistance-dec'),
        resistanceParams: q.get('#resistance-mode-params'),
    };

    // will overflow max value
    let resistanceMin = 0;
    let resistanceMax = 100;
    let resistanceInc = 10;

    xf.sub('db:resistanceMin', min => resistanceMin = min);
    xf.sub('db:resistanceMax', max => resistanceMax = max);
    xf.sub('db:resistanceInx', inc => resistanceInc = inc);

    dom.resistanceParams.textContent = `${resistanceMin} to ${resistanceMax}`;

    NumberInput({dom: {input:  dom.resistanceValue,
                        incBtn: dom.resistanceInc,
                        decBtn: dom.resistanceDec},
                  evt:     'resistance-target',
                  type:    'Int',
                  min:      resistanceMin,
                  max:      resistanceMax,
                  inc:      resistanceInc,
                  prop:    'resistanceTarget',
                  minProp: 'resistanceMin',
                  maxProp: 'resistanceMax',
                  incProp: 'resistanceInc'});
}

function Slope() {
    let dom = {
        slopeValue:  q.get('#slope-value'),
        slopeInc:    q.get('#slope-inc'),
        slopeDec:    q.get('#slope-dec'),
        slopeParams: q.get('#slope-mode-params'),
    };

    // speed based, will ignore max value
    let slopeMin = 0;
    let slopeMax = 30.0; // maybe ... it is speed dependant

    xf.sub('db:slopeMin', min => slopeMin = min);
    xf.sub('db:slopeMax', max => slopeMax = max);

    dom.slopeParams.textContent = `${slopeMin} to ${slopeMax}`;

    NumberInput({dom: {input:  dom.slopeValue,
                       incBtn: dom.slopeInc,
                       decBtn: dom.slopeDec},
                  evt:     'slope-target',
                  prop:    'slopeTarget',
                  type:    'Float',
                  min:      slopeMin,
                  max:      slopeMax,
                  inc:      0.5,
                  minProp: 'slopeMin',
                  maxProp: 'slopeMax',
                  incProp: 'slopeInc'});
}

function ControlView(args) {
    let dom = {
        ergModeBtn:         q.get('#erg-mode-btn'),
        resistanceModeBtn:  q.get('#resistance-mode-btn'),
        slopeModeBtn:       q.get('#slope-mode-btn'),
        ergControls:        q.get('#erg-mode-controls'),
        resistanceControls: q.get('#resistance-mode-controls'),
        slopeControls:      q.get('#slope-mode-controls'),
    };

    let mode = 'erg';
    xf.sub('db:mode', m => {
        mode = m;
        if(m === 'erg')        uiErgMode(dom);
        if(m === 'resistance') uiResistanceMode(dom);
        if(m === 'slope')      uiSlopeMode(dom);
    });

    function uiErgMode(dom) {
        dom.ergModeBtn.classList.add('active');
        dom.resistanceModeBtn.classList.remove('active');
        dom.slopeModeBtn.classList.remove('active');
        dom.ergControls.style.display        = 'block';
        dom.resistanceControls.style.display = 'none';
        dom.slopeControls.style.display      = 'none';
    }
    function uiResistanceMode(dom) {
        dom.ergModeBtn.classList.remove('active');
        dom.resistanceModeBtn.classList.add('active');
        dom.slopeModeBtn.classList.remove('active');
        dom.ergControls.style.display        = 'none';
        dom.resistanceControls.style.display = 'block';
        dom.slopeControls.style.display      = 'none';
    }
    function uiSlopeMode(dom) {
        dom.ergModeBtn.classList.remove('active');
        dom.resistanceModeBtn.classList.remove('active');
        dom.slopeModeBtn.classList.add('active');
        dom.ergControls.style.display        = 'none';
        dom.resistanceControls.style.display = 'none';
        dom.slopeControls.style.display      = 'block';
    }

    xf.sub('pointerup', e => {
        xf.dispatch('ui:erg-mode');
    }, dom.ergModeBtn);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:resistance-mode');
    }, dom.resistanceModeBtn);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:slope-mode');
    }, dom.slopeModeBtn);

    xf.sub('key:e', e => {
        xf.dispatch('ui:erg-mode');
    });
    xf.sub('key:r', e => {
        xf.dispatch('ui:resistance-mode');
    });
    xf.sub('key:s', e => {
        xf.dispatch('ui:slope-mode');
    });

    Resistance();
    Slope();
    ERG();
}

function WatchView(args) {
    let dom =  {
        start:   q.get('#watch-start'),
        pause:   q.get('#watch-pause'),
        lap:     q.get('#watch-lap'),
        stop:    q.get('#watch-stop'),
        save:    q.get('#activity-save'),
        workout: q.get('#start-workout'),
        cont:    q.get('#watch'),
        name:    q.get('#workout-name'),
    };
    let watchState = 'stopped';

    xf.reg('db:workout', db => {
        dom.name.textContent = db.workout.name;
    });

    xf.reg('db:watchState', db => {
        console.log(`db.watchState: ${db.watchState}`);
        watchState = db.watchState;
    });

    xf.sub('pointerup', e => xf.dispatch('ui:watchStart'),   dom.start);
    xf.sub('pointerup', e => xf.dispatch('ui:watchPause'),   dom.pause);
    xf.sub('pointerup', e => xf.dispatch('ui:watchLap'),     dom.lap);
    xf.sub('pointerup', e => xf.dispatch('ui:watchStop'),    dom.stop);
    xf.sub('pointerup', e => xf.dispatch('ui:workoutStart'), dom.workout);
    xf.sub('key:space', e => {
        console.log(watchState);
        if(watchState === 'paused' || watchState === 'stopped') {
            xf.dispatch('ui:watchStart');
        } else {
            xf.dispatch('ui:watchPause');
        }
    });

    const init = dom => {
        dom.pause.style.display = 'none';
        dom.stop.style.display  = 'none';
        dom.save.style.display  = 'none';
        dom.lap.style.display   = 'none';
    };
    const started = dom => {
        dom.start.style.display = 'none';
        dom.save.style.display  = 'none';
        dom.pause.style.display = 'inline-block';
        dom.lap.style.display   = 'inline-block';
        dom.stop.style.display  = 'none';
        // dom.stop.style.display  = 'inline-block';
    };
    const paused = dom => {
        dom.pause.style.display = 'none';
        dom.start.style.display = 'inline-block';
        dom.stop.style.display  = 'inline-block';
    };
    const stopped = dom => {
        dom.pause.style.display   = 'none';
        dom.lap.style.display     = 'none';
        dom.stop.style.display    = 'none';
        dom.save.style.display    = 'inline-block';
        dom.workout.style.display = 'inline-block';
        dom.start.style.display   = 'inline-block';
    };
    const workoutStarted = dom => {
        dom.workout.style.display = 'none';
    };

    init(dom);

    xf.sub('db:watchState', state => {
        if(state === 'started') { started(dom); }
        if(state === 'paused')  { paused(dom);  }
        if(state === 'stopped') { stopped(dom); }
    });
    xf.sub('db:workoutState', state => {
        if(state === 'started') { workoutStarted(dom); }
        if(state === 'done') {
            console.log(`Workout done!`);
        }
    });
}


function WorkoutsView() {
    let dom = {
        workouts:     q.get('#workouts'),
        list:         q.get('#workouts .list'),
        items:        [],
        select:       [],
        descriptions: [],
    };
    let id  = 0;

    let off = `
        <svg class="radio radio-off" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path class="path" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12
                    2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
        </svg>`;

    let on = `
        <svg class="radio radio-on" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path class="path" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0
                    18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
            <circle class="circle" cx="12" cy="12" r="5"/>
        </svg>`;
    xf.reg('workouts:init', e => {
        dom.list.innerHTML = '';
    });

    xf.reg('workout:add', e => {
        let w = e;

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

function UploadWorkoutView(args) {
    let dom = {
        fileBtn: q.get('#workout-file'),
    };

    xf.sub('change', e => {
        let file = e.target.files[0];
        console.log(file);
        xf.dispatch('ui:workoutFile', file);
    }, dom.fileBtn);
}

function ActivityView(args) {
    let dom = {
        saveBtn: q.get('#activity-save'),
    };

    xf.sub('pointerup', e => {
        xf.dispatch('ui:activity:save');
    }, dom.saveBtn);
}

function ScreenChange() {
    window.addEventListener('orientationchange', e => {
        xf.dispatch('screen:change', e.target);
    });
    window.addEventListener('resize', e => {
        xf.dispatch('screen:change', e.target);
    });
}

function Views() {
    ScreenChange();

    ConnectionControlsView();
    ControllableSettingsView({name: 'controllable'});
    HrbSettingsView({name: 'hrb'});

    DataScreen();
    GraphPower();
    GraphWorkout();

    ControlView();
    WatchView();

    NavigationWidget();
    ActivityView();
    SettingsView();
    WorkoutsView();

    UploadWorkoutView();
}

export {
    Views,
};

