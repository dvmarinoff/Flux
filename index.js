import 'regenerator-runtime/runtime';
import { Device, Hrb, Flux } from './ble/device.js';
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
    targetPwr: 140,
    elapsed: 0,
    interval: 0
});

xf.reg('device:hr',  e => db.hr  = e.detail.data);
xf.reg('device:pwr', e => db.pwr = e.detail.data);
xf.reg('device:spd', e => db.spd = e.detail.data);
xf.reg('device:cad', e => db.cad = e.detail.data);
xf.reg('ui:target-pwr',   e => {
    console.log('ui:target-pwr');
    console.log(e.detail.data);
    db.targetPwr = e.detail.data;
});
xf.reg('workout:elapsed',  e => db.elapsed   = e.detail.data);
xf.reg('workout:interval', e => db.interval  = e.detail.data);


let dom = {
    hrbConnectionScreen: {
        connectBtn:    document.querySelector('#hrb-connection-screen .connect-btn'),
        disconnectBtn: document.querySelector('#hrb-connection-screen .disconnect-btn'),
        startBtn:      document.querySelector('#hrb-connection-screen .start-notifications-btn'),
        stopBtn:       document.querySelector('#hrb-connection-screen .stop-notifications-btn')
    },
    fluxConnectionScreen: {
        connectBtn:    document.querySelector('#flux-connection-screen .connect-btn'),
        disconnectBtn: document.querySelector('#flux-connection-screen .disconnect-btn'),
        startBtn:      document.querySelector('#flux-connection-screen .start-notifications-btn'),
        stopBtn:       document.querySelector('#flux-connection-screen .stop-notifications-btn')
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
            start:  document.querySelector('#watch-start-btn'),
            pause:  document.querySelector('#watch-pause-btn'),
            resume: document.querySelector('#watch-resume-btn'),
            lap:    document.querySelector('#watch-lap-btn'),
            stop:   document.querySelector('#watch-stop-btn'),
        },
        input:  document.querySelector('#power-target-value'),
        setBtn: document.querySelector('#set-power-btn'),
        workPower: document.querySelector('#work-power-value'),
        restPower: document.querySelector('#rest-power-value'),
        startWorkInterval: document.querySelector('#start-work-interval-btn'),
        startRestInterval: document.querySelector('#start-rest-interval-btn'),
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
    let hrb = new Hrb();
    let flux = new Flux();
    let watch = new StopWatch();

    ConnectionScreen({device: hrb, dom: dom.hrbConnectionScreen});
    ConnectionScreen({device: flux, dom: dom.fluxConnectionScreen});
    DataScreen({dom: dom.datascreen});
    // GraphHr({dom: dom.graphHr});
    GraphPower({dom: dom.graphPower});

    ControlScreen({device: flux,
                   dom: dom.controlscreen,
                   watch: watch});

    // DataMock({hr: true, pwr: true});
};

start();
