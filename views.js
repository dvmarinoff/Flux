import { xf } from './xf.js';
import { q } from './q.js';
import { avgOfArray,
         hrToColor,
         powerToZone,
         valueToHeight,
         secondsToHms,
         metersToDistance } from './functions.js';
import { parseZwo, intervalsToGraph } from './parser.js';

function ControllableConnectionView(args) {
    let dom = {
        switchBtn: q.get('#controllable-connection-btn'),
        indicator: q.get('#controllable-connection-btn .indicator'),
    };

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
    let dom = {
        switchBtn: q.get('#hrb-connection-btn'),
        indicator: q.get('#hrb-connection-btn .indicator'),
    };

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
    let dom = {
        time:      q.get('#time'),
        interval:  q.get('#interval-time'),
        targetPwr: q.get('#target-power'),
        power:     q.get('#power'),
        cadence:   q.get('#cadence'),
        speed:     q.get('#speed'),
        distance:  q.get('#distance'),
        heartRate: q.get('#heart-rate')
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
    xf.sub('db:targetPwr', targetPwr => {
        dom.targetPwr.textContent = targetPwr;
    });
}

function DataBar(args) {
    let dom = {
        time:      q.get('#data-bar-time'),
        interval:  q.get('#data-bar-interval-time'),
        targetPwr: q.get('#data-bar-target-power'),
        power:     q.get('#data-bar-power'),
        cadence:   q.get('#data-bar-cadence'),
        heartRate: q.get('#data-bar-heart-rate'),
        progress:  q.get('#data-bar-progress-cont'),
    };
    let ftp = 250;

    xf.sub('db:hr', hr => {
        dom.heartRate.textContent = `${hr}`;
    });
    xf.sub('db:pwr', pwr => {
        dom.power.textContent = `${pwr}`;
        dom.progress.insertAdjacentHTML('beforeend',
        `<div class="graph-bar zone-${(powerToZone(pwr, ftp)).name}" style="height: ${100}%"></div>`);
    });
    xf.sub('db:vspd', vspd => {
        dom.speed.textContent = `${vspd.toFixed(1)}`;
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
    xf.sub('db:targetPwr', targetPwr => {
        dom.targetPwr.textContent = targetPwr;
    });
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

function GraphHr(args) {
    let dom = args.dom;
    let count = 0;
    let scale = 200;
    let size = dom.cont.getBoundingClientRect().width;
    xf.sub('db:hr', hr => {
        // let hr = e.detail.data.hr;
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
        let workout = e.workout;
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

function NavigationWidget(args) {
    let dom = args.dom;
    let i   = 1;

    xf.sub('pointerup', e => {
        e.stopPropagation();
        e.preventDefault();
        e.stopImmediatePropagation();

        i = dom.homeBtn.getAttribute('data-index');
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

        i = dom.settingsBtn.getAttribute('data-index');
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

        i = dom.workoutsBtn.getAttribute('data-index');
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

    xf.sub('db:ftp', ftp => {
        // ftp = e.detail.data.ftp;
        dom.ftp.value = ftp;
    });
    xf.sub('db:weight', weight => {
        // weight = e.detail.data.weight;
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

function NumberInput(args) {
    let dom               = args.dom;
    let name              = args.name || `number-input`;
    let value             = args.init || 0;
    let type              = args.type || 'Int';
    let minValueSupported = args.min  || 0;
    let maxValueSupported = args.max  || 0;
    let incStep           = args.inc  || 1;
    let set               = args.set  || function(x) { return x; };

    const inRange = (target, minValueSupported, maxValueSupported, init = 0) => {
        let value = init;
        if(target >= maxValueSupported) {
            value = maxValueSupported;
        } else if(target < minValueSupported) {
            value = minValueSupported;
        } else {
            value = target;
        }
        return value;
    };

    xf.sub('change', e => {
        let x = 0;
        if(type === 'Int') {
            x = parseInt(e.target.value || 0);
        } else {
            x = parseFloat(e.target.value || 0);
        }
        if(x > minValueSupported && x < maxValueSupported) {
            value = x;
        }
        if(x >= maxValueSupported) {
            value = maxValueSupported;
        }
        if(x <= minValueSupported) {
            value = minValueSupported;
        }
        dom.input.value = value;
        set(value);
        xf.dispatch(`ui:${name}-target`, value);
    }, dom.input);

    xf.sub('pointerup', e => {
        let target = value + incStep;
        value = inRange(target, minValueSupported, maxValueSupported, value);
        dom.input.value = value;
        set(value);
        xf.dispatch(`ui:${name}-target`, value);
    }, dom.incBtn);

    xf.sub('pointerup', e => {
        let target = value - incStep;
        value = inRange(target, minValueSupported, maxValueSupported, value);
        dom.input.value = value;
        set(value);
        xf.dispatch(`ui:${name}-target`, value);
    }, dom.decBtn);
}

function ControlView(args) {
    let dom = {
        resistanceModeBtn:  q.get('#resistance-mode-btn'),
        slopeModeBtn:       q.get('#slope-mode-btn'),
        ergModeBtn:         q.get('#erg-mode-btn'),

        resistanceControls: q.get('#resistance-mode-controls'),
        slopeControls:      q.get('#slope-mode-controls'),
        ergControls:        q.get('#erg-mode-controls'),

        resistanceParams:   q.get('#resistance-mode-params'),
        slopeParams:        q.get('#slope-mode-params'),
        ergParams:          q.get('#erg-mode-params'),

        resistanceValue:    q.get('#resistance-value'),
        resistanceInc:      q.get('#resistance-inc'),
        resistanceDec:      q.get('#resistance-dec'),

        slopeValue:         q.get('#slope-value'),
        slopeInc:           q.get('#slope-inc'),
        slopeDec:           q.get('#slope-dec'),

        targetPower:        q.get('#target-power-value'),
        workPower:          q.get('#work-power-value'),
        restPower:          q.get('#rest-power-value'),
        setTargetPower:     q.get('#set-target-power'),
        startWorkInterval:  q.get('#start-work-interval'),
        startRestInterval:  q.get('#start-rest-interval'),
    };

    xf.sub('pointerup', e => {
        xf.dispatch('ui:erg-mode');
        dom.ergModeBtn.classList.add('active');
        dom.resistanceModeBtn.classList.remove('active');
        dom.slopeModeBtn.classList.remove('active');
        dom.ergControls.style.display        = 'block';
        dom.resistanceControls.style.display = 'none';
        dom.slopeControls.style.display      = 'none';
    }, dom.ergModeBtn);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:resistance-mode');
        dom.ergModeBtn.classList.remove('active');
        dom.resistanceModeBtn.classList.add('active');
        dom.slopeModeBtn.classList.remove('active');
        dom.ergControls.style.display        = 'none';
        dom.resistanceControls.style.display = 'block';
        dom.slopeControls.style.display      = 'none';
    }, dom.resistanceModeBtn);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:slope-mode');
        dom.ergModeBtn.classList.remove('active');
        dom.resistanceModeBtn.classList.remove('active');
        dom.slopeModeBtn.classList.add('active');
        dom.ergControls.style.display        = 'none';
        dom.resistanceControls.style.display = 'none';
        dom.slopeControls.style.display      = 'block';
    }, dom.slopeModeBtn);


    // ERG({power: {params: {min: 0, max: 800, inc: 1}}});
    // Slope({slope: {params: {min: 0, max: 30, inc: 0.5}}});
    // Resistance({resistance: {params: {min: 0, max: 100, inc: 1}}});

    xf.sub('db:controllableFeatures', controllableFeatures => {
        let features = controllableFeatures;
        Resistance(features); // will overflow max value
        Slope(features);      // speed based, will ignore max value
        ERG(features);        // will ignore max value (most likely)
    });

    function Resistance(features) {
        // Resistance mode
        let resistance             = 0;
        let minResistanceSupported = features.resistance.params.min;
        let maxResistanceSupported = features.resistance.params.max;
        let resistanceInc          = features.resistance.params.inc * 100;

        dom.resistanceParams.textContent = `${minResistanceSupported} to ${maxResistanceSupported}`;

        NumberInput({dom: {input: dom.resistanceValue,
                           incBtn: dom.resistanceInc,
                           decBtn: dom.resistanceDec},
                     name: 'resistance',
                     init: resistance,
                     type: 'Int',
                     min: minResistanceSupported,
                     max: maxResistanceSupported,
                     inc: resistanceInc});
    }


    function Slope(features) {
        // Slope mode
        let slope             = 0;
        let minSlopeSupported = 0;
        let maxSlopeSupported = 30.0; // maybe ... it is speed dependant
        let slopeInc          = 0.5;

        dom.slopeParams.textContent = `${minSlopeSupported} to ${maxSlopeSupported}`;

        xf.sub('ui:slope-mode', e => {
            xf.dispatch('ui:slope-target', slope);
        });

        NumberInput({dom: {input:  dom.slopeValue,
                           incBtn: dom.slopeInc,
                           decBtn: dom.slopeDec},
                     name: 'slope',
                     init: slope,
                     type: 'Float',
                     min: minSlopeSupported,
                     max: maxSlopeSupported,
                     inc: slopeInc,
                     set: value => slope = value});
    }

    // ERG mode
    function ERG(features) {
        let targetPwr = dom.targetPower.value || 100;
        let workPwr   = dom.workPower.value || 235;
        let restPwr   = dom.restPower || 100;

        let minPowerSupported = features.power.params.min || 0;
        let maxPowerSupported = features.power.params.max || 0;
        let powerInc          = features.power.params.inc || 0;

        dom.ergParams.textContent = `${minPowerSupported} to ${maxPowerSupported}`;

        xf.sub('change', e => {
            alert(`change targetPwr`);
            targetPwr = parseInt(e.target.value); }, dom.targetPower);
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

    xf.sub('pointerup', e => xf.dispatch('ui:watchStart'),   dom.start);
    xf.sub('pointerup', e => xf.dispatch('ui:watchPause'),   dom.pause);
    xf.sub('pointerup', e => xf.dispatch('ui:watchLap'),     dom.lap);
    xf.sub('pointerup', e => xf.dispatch('ui:watchStop'),    dom.stop);
    xf.sub('pointerup', e => xf.dispatch('ui:workoutStart'), dom.workout);

    xf.reg('db:workout', db => {
        dom.name.textContent = db.workout.name;
    });

    const init = _ => {
        dom.pause.style.display = 'none';
        dom.stop.style.display  = 'none';
        dom.save.style.display  = 'none';
        dom.lap.style.display   = 'none';
    };
    const started = _ => {
        dom.start.style.display = 'none';
        dom.save.style.display  = 'none';
        dom.pause.style.display = 'inline-block';
        dom.lap.style.display   = 'inline-block';
        dom.stop.style.display  = 'none';
        // dom.stop.style.display  = 'inline-block';
    };
    const paused = _ => {
        dom.pause.style.display = 'none';
        dom.start.style.display = 'inline-block';
        dom.stop.style.display  = 'inline-block';
    };
    const stopped = _ => {
        dom.pause.style.display   = 'none';
        dom.lap.style.display     = 'none';
        dom.stop.style.display    = 'none';
        dom.save.style.display    = 'inline-block';
        dom.workout.style.display = 'inline-block';
        dom.start.style.display   = 'inline-block';
    };
    const workoutStarted = _ => {
        dom.workout.style.display = 'none';
    };

    init();

    xf.sub('db:watchState', state => {
        if(state === 'started') { started(); }
        if(state === 'paused')  { paused();  }
        if(state === 'stopped') { stopped(); }
    });
    xf.sub('db:workoutState', state => {
        if(state === 'started') { workoutStarted(); }
        if(state === 'done') {
            console.log(`Workout done!`);
        }
    });
}


function WorkoutsView(args) {
    let dom = args.dom;
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
    });
}

export {
    ControllableConnectionView,
    HrbConnectionView,
    ControllableSettingsView,
    HrbSettingsView,
    DataScreen,
    DataBar,
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

