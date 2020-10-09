import { xf } from './xf.js';

function ConnectionScreen(args) {
    let device = args.device;
    let dom = args.dom;
    xf.sub('pointerup', e => device.connect(), dom.connectBtn);
    xf.sub('device:connection', e => {
        let connected = device.device.connected;
        console.log(device.device.connected);
        if(connected) {
            console.log('connected screen');
            dom.switch.classList.remove('off');
            dom.switch.classList.add('on');
        } else {
            console.log('disconnected screen');
            dom.switch.classList.remove('on');
            dom.switch.classList.add('off');
        }
    });
    // xf.sub('pointerup', e => device.disconnect(), dom.disconnectBtn);
    // xf.sub('pointerup', e => device.startNotifications(), dom.startBtn);
    // xf.sub('pointerup', e => device.stopNotifications(), dom.stopBtn);
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

function ControlScreen(args) {
    let device = args.device;
    let dom = args.dom;
    let watch = args.watch;
    let targetPwr = 100;
    let workPwr = 235;
    let restPwr = 100;

    xf.sub('change', e => {
        targetPwr = e.target.value;
    }, dom.targetPower);

    xf.sub('change', e => {
        workPwr = e.target.value;
    }, dom.workPower);

    xf.sub('change', e => {
        restPwr = e.target.value;
    }, dom.restPower);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:target-pwr', targetPwr);
        device.setTargetPower(targetPwr);
    }, dom.setTargetPower);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:target-pwr', workPwr);
        device.setTargetPower(workPwr);
    }, dom.startWorkInterval);

    xf.sub('pointerup', e => {
        xf.dispatch('ui:target-pwr', restPwr);
        device.setTargetPower(restPwr);
    }, dom.startRestInterval);

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

    xf.sub('pointerup', e => xf.dispatch('ui:darkMode'), dom.darkMode);
    xf.sub('pointerup', e => watch.start(),  dom.watch.start);
    xf.sub('pointerup', e => watch.pause(),  dom.watch.pause);
    xf.sub('pointerup', e => watch.resume(), dom.watch.resume);
    xf.sub('pointerup', e => watch.lap(),    dom.watch.lap);
    xf.sub('pointerup', e => watch.stop(),   dom.watch.stop);
}

export {
    ConnectionScreen,
    DataScreen,
    GraphHr,
    GraphPower,
    ControlScreen
};

