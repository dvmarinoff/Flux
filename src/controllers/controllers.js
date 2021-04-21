import { xf, exists, empty, first, filterIn, prn } from '../functions.js';
// import { Device } from '../device.js';

import { uuids } from '../ble/uuids.js';
import { ble } from '../ble/web-ble.js';

// handlers
import { HeartRateService }         from '../ble/hrs/hrs.js';
import { DeviceInformationService } from '../ble/dis/dis.js';
import { FitnessMachineService }    from '../ble/ftms/ftms.js';

function onHeartRate(value) {
    if(value.hr) xf.dispatch(`heartRate`, value.hr);
}
function onHrmInfo(value) {
    console.log(`Heart Rate Monitor Information: `, value);
}
function onIndoorBikeData(value) {
    console.log(`indoor bike data`, value);
    if(value.power)   xf.dispatch(`power`, value.power);
    if(value.cadence) xf.dispatch(`cadence`, value.cadence);
    if(value.speed)   xf.dispatch(`speed`, value.speed);
}
function onControllableInfo(value) {
    console.log(`Fitness Machine Information: `, value);
}
function onFitnessMachineStatus(value) {
    console.log(`Fitness Machine Status: `, value);
}
function onFitnessMachineControlPoint(value) {
    console.log(`Fitness Machine Control Point Response: `, value);
}

class Device {
    constructor(args) {
        if(!exists(args)) args = {};
        this.id = args.id || this.defaultId();
        this.filter = args.filter || this.defaultFilter();
        this.init();
    }
    defaultFilter() { return ble.requestFilters.all; }
    defaultId() { return 'ble-device'; }
    init() {
        const self = this;

        xf.sub(`ui:${self.id}:switch`, async () => {
            if(self.isConnected()) {
                self.disconnect();
            } else {
                self.connect();
            }
        });
    }
    postInit() {}
    isConnected() {
        const self = this;
        if(exists(self.device)) return ble.isConnected(self.device);
        return false;
    }
    async connect() {
        const self = this;
        xf.dispatch(`${self.id}:connecting`);
        try {
            self.device = await ble.connect(self.filter);
            await self.initServices(self.device);
            self.postInit();
            xf.dispatch(`${self.id}:connected`);
        } catch(err) {
            xf.dispatch(`${self.id}:disconnected`);
            console.error(`Could not request ${self.id}: `, err);
        }
    }
    disconnect() {
        const self = this;
        xf.dispatch(`${self.id}:disconnected`);
        return ble.disconnect(self.device.device);
    }
    async initServices(device) { return {}; }
}

class Controllable extends Device {
    defaultId() { return `controllable`; }
    defaultFilter() { return ble.requestFilters.controllable; }
    postInit() {
        const self = this;

        let mode = 'erg';
        xf.sub(`db:mode`, value => mode = mode);

        xf.sub('db:powerTarget', power => {
            if(mode === 'erg') {
                if(self.device.connected) self.services.ftms.setPowerTarget(power);
            }
        });

        xf.sub('db:resistanceTarget', resistance => {
            if(self.device.connected) self.services.ftms.setResistanceTarget(resistance);
        });

        xf.sub('db:slopeTarget', slope => {
            if(self.device.connected) self.services.ftms.setSlopeTarget(slope);
        });
    }
    async initServices(device) {
        const dis = new DeviceInformationService({ble: ble, onInfo: onControllableInfo,  ...device});
        await dis.init();

        const ftms = new FitnessMachineService({ble: ble,
                                                onStatus: onFitnessMachineStatus,
                                                onData: onIndoorBikeData,
                                                onControl: onFitnessMachineControlPoint,
                                                ...device});
        await ftms.init();
        return { dis, ftms };
    }
}

class Hrm extends Device {
    defaultId() { return `hrm`; }
    defaultFilter() { return ble.requestFilters.hrm; }
    postInit() {
        const self = this;
    }
    async initServices(device) {
        const hrs = new HeartRateService({ble: ble, onHeartRate: onHeartRate, ...device});
        await hrs.init();

        const dis = new DeviceInformationService({ble: ble, onInfo: onHrmInfo, ...device});
        await dis.init();

        return { hrs, dis };
    }
}



function start() {
    console.log(`start controllers`);

    const controllable = new Controllable();
    const hrm = new Hrm();
}

start();
