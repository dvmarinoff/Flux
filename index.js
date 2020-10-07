import 'regenerator-runtime/runtime';
import { Device, Hrb, Flux } from './ble/device.js';
import { ConnectionScreen, DataScreen, GraphHr, GraphPower, ControlScreen } from './views.js';
import { DataMock } from './test/mock.js';
import { xf, DB } from './xf.js';


'use strict';

let db = DB({
    hr: [],
    pwr: [],
    spd: [],
    cad: [],
    targetPwr: 140
});

xf.reg('device:hr',  e => db.hr  = e.detail.data);
xf.reg('device:pwr', e => db.pwr = e.detail.data);
xf.reg('device:spd', e => db.spd = e.detail.data);
xf.reg('device:cad', e => db.cad = e.detail.data);
xf.reg('ui:target-pwr',  e => db.targetPwr = e.detail.data);

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
        power:     document.querySelector('#power'),
        cadence:   document.querySelector('#cadence'),
        speed:     document.querySelector('#speed'),
        heartRate: document.querySelector('#heart-rate')
    },
    controlscreen: {
        input:  document.querySelector('#power-target-value'),
        setBtn: document.querySelector('#set-power-btn')
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

    ConnectionScreen({device: hrb, dom: dom.hrbConnectionScreen});
    ConnectionScreen({device: flux, dom: dom.fluxConnectionScreen});
    DataScreen({dom: dom.datascreen});
    GraphHr({dom: dom.graphHr});
    GraphPower({dom: dom.graphPower});

    ControlScreen({device: flux, dom: dom.controlscreen, db: db});

    // DataMock({hr: true, pwr: false});
};

start();
