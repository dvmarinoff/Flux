import { xf } from './xf.js';

function ConnectionScreen(args) {
    let device = args.device;
    let dom = args.dom;
    xf.sub('pointerup', e => device.connect(), dom.connectBtn);
    xf.sub('pointerup', e => device.disconnect(), dom.disconnectBtn);
    xf.sub('pointerup', e => device.startNotifications(), dom.startBtn);
    xf.sub('pointerup', e => device.stopNotifications(), dom.stopBtn);
}

function DataScreen(args) {
    let dom = args.dom;
    xf.sub('db:hr', e => {
        let hr = e.detail.data.hr;
        dom.heartRate.textContent = `${hr} bpm`;
    });
    xf.sub('db:pwr', e => {
        let pwr = e.detail.data.pwr;
        dom.power.textContent = `${pwr} W`;
    });
    xf.sub('db:spd', e => {
        let spd = e.detail.data.spd;
        dom.speed.textContent = `${spd} km/h`;
    });
    xf.sub('db:cad', e => {
        let cad = e.detail.data.cad;
        dom.cadence.textContent = `${cad} rpm`;
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

function ControlScreen(args) {
    let device = args.device;
    let dom = args.dom;
    let db = args.db;
    let pwr = 100;
        xf.sub('change', e => {
            xf.dispatch('ui:target-pwr', e.target.value);
            pwr = e.target.value;
        }, dom.input);
    // xf.sub('db:targetPwr', e => console.log(e.detail.data.targetPwr));

    xf.sub('pointerup', e => device.setTargetPower(pwr), dom.setBtn);
}

export {
    ConnectionScreen,
    DataScreen,
    GraphHr,
    GraphPower,
    ControlScreen
};

