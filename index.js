import 'regenerator-runtime/runtime';
import { Device, Hrb, Controllable } from './ble/device.js';
import { StopWatch } from './workout.js';
import { ConnectionScreen, DataScreen, GraphHr, GraphPower, ControlScreen } from './views.js';
import { DataMock } from './test/mock.js';
import { xf, DB } from './xf.js';


'use strict';

let db = DB({
    hr: [],
    pwr: [],
    spd: [],
    cad: [],
    targetPwr: 100,
    elapsed: 0,
    interval: 0,
    darkMode: false,
});

xf.reg('device:hr',  e => db.hr  = e.detail.data);
xf.reg('device:pwr', e => db.pwr = e.detail.data);
xf.reg('device:spd', e => db.spd = e.detail.data);
xf.reg('device:cad', e => db.cad = e.detail.data);
xf.reg('ui:target-pwr', e => db.targetPwr = e.detail.data);
xf.reg('ui:darkMode',   e => db.darkMode ? db.darkMode = false : db.darkMode = true);
xf.reg('workout:elapsed',  e => db.elapsed   = e.detail.data);
xf.reg('workout:interval', e => db.interval  = e.detail.data);


let dom = {
    hrbConnectionScreen: {
        connectBtn:    document.querySelector('#hrb-connection-screen .connect'),
        connectSwitch: document.querySelector('#hrb-connection-screen .connect .switch'),
        disconnectBtn: document.querySelector('#hrb-connection-screen .disconnect'),
        startBtn:      document.querySelector('#hrb-connection-screen .start-notifications'),
        stopBtn:       document.querySelector('#hrb-connection-screen .stop-notifications'),
        switch:        document.querySelector('#hrb-connection-screen .switch'),
    },
    fluxConnectionScreen: {
        connectBtn:    document.querySelector('#flux-connection-screen .connect'),
        disconnectBtn: document.querySelector('#flux-connection-screen .disconnect'),
        startBtn:      document.querySelector('#flux-connection-screen .start-notifications'),
        stopBtn:       document.querySelector('#flux-connection-screen .stop-notifications'),
        switch:        document.querySelector('#flux-connection-screen .switch'),
    },
    datascreen: {
        time:      document.querySelector('#time'),
        interval:   document.querySelector('#interval-time'),
        targetPwr: document.querySelector('#target-power'),
        power:     document.querySelector('#power'),
        cadence:   document.querySelector('#cadence'),
        speed:     document.querySelector('#speed'),
        heartRate: document.querySelector('#heart-rate')
    },
    controlscreen: {
        watch: {
            start:  document.querySelector('#watch-start'),
            pause:  document.querySelector('#watch-pause'),
            resume: document.querySelector('#watch-resume'),
            lap:    document.querySelector('#watch-lap'),
            stop:   document.querySelector('#watch-stop'),
        },
        darkMode:    document.querySelector('#dark-mode'),
        theme:       document.querySelector('#theme'),
        targetPower: document.querySelector('#target-power-value'),
        workPower:   document.querySelector('#work-power-value'),
        restPower:   document.querySelector('#rest-power-value'),
        setTargetPower:    document.querySelector('#set-target-power'),
        startWorkInterval: document.querySelector('#start-work-interval'),
        startRestInterval: document.querySelector('#start-rest-interval'),
        laps: document.querySelector('#laps'),
    },
    graphHr: {
        cont:  document.querySelector('#graph-hr'),
        graph: document.querySelector('#graph-hr .graph')
    },
    graphPower: {
        cont:  document.querySelector('#graph-power'),
        graph: document.querySelector('#graph-power .graph')
    }
};

function start() {
    let hrb   = new Hrb({name: 'hrb'});
    let flux  = new Controllable({name: 'controllable'});
    let watch = new StopWatch();

    ConnectionScreen({device: hrb, name: 'hrb',dom: dom.hrbConnectionScreen});
    ConnectionScreen({device: flux, name: 'controllable', dom: dom.fluxConnectionScreen});
    DataScreen({dom: dom.datascreen});
    // GraphHr({dom: dom.graphHr});
    GraphPower({dom: dom.graphPower});

    ControlScreen({device: flux,
                   dom: dom.controlscreen,
                   watch: watch});

    // DataMock({hr: true, pwr: true});
    // parseZwo(ws);

};

start();
