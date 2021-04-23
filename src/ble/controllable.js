import { xf, exists, empty, first, filterIn, prn } from '../functions.js';
import { ble } from './web-ble.js';
import { Device } from './device.js';
import { DeviceInformationService } from './dis/dis.js';
import { FitnessMachineService }    from './ftms/ftms.js';

function onIndoorBikeData(value) {
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

class Controllable extends Device {
    defaultId() { return `controllable`; }
    defaultFilter() { return ble.requestFilters.controllable; }
    postInit() {
        const self = this;

        let mode = 'erg';
        xf.sub(`db:mode`, value => mode = mode);

        xf.sub('db:powerTarget', power => {
            // if(mode === 'erg') {
            // if(self.device.connected)
            // }
            self.ftms.setTargetPower(power);
        });

        xf.sub('db:resistanceTarget', resistance => {
            if(self.device.connected) self.ftms.setResistanceTarget(resistance);
        });

        xf.sub('db:slopeTarget', slope => {
            if(self.device.connected) self.ftms.setSlopeTarget(slope);
        });
    }
    async initServices(device) {
        const self = this;
        const dis = new DeviceInformationService({ble: ble, onInfo: onControllableInfo,  ...device});
        await dis.init();

        const ftms = new FitnessMachineService({ble: ble,
                                                onStatus: onFitnessMachineStatus,
                                                onData: onIndoorBikeData,
                                                onControl: onFitnessMachineControlPoint,
                                                ...device});
        await ftms.init();
        self.ftms = ftms;
        self.dis = dis;
        console.log(self.ftms);
        return { dis, ftms };
    }
}

export { Controllable };
