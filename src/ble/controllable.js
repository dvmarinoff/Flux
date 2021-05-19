import { xf, isObject, equals, exists, empty, first, filterIn, prn } from '../functions.js';
import { ble } from './web-ble.js';
import { Device } from './device.js';
import { DeviceInformationService } from './dis/dis.js';
import { FitnessMachineService }    from './ftms/ftms.js';

function onIndoorBikeData(value) {
    if(exists(value.power))   xf.dispatch(`power`, value.power);
    if(exists(value.cadence)) xf.dispatch(`cadence`, value.cadence);
    if(exists(value.speed))   xf.dispatch(`speed`, value.speed);
}
function onControllableInfo(value) {
    console.log(`Fitness Machine Information: `, value);
}
function onFitnessMachineStatus(res) {
    let value = '';
    if(res.value) value = ` :value ${isObject(res.value)? JSON.stringify(res.value) : res.value}`;
    console.log(`:status '${res.msg}'${value}`);
}
function onFitnessMachineControlPoint(value) {
    console.log(`:operation '${value.operation}' :result :${value.result}`);
}

class Controllable extends Device {
    defaultId() { return `controllable`; }
    defaultFilter() { return ble.requestFilters.controllable; }
    postInit() {
        const self = this;

        let mode = 'erg';
        xf.sub(`db:mode`, value => mode = value);

        xf.sub('db:powerTarget', power => {
            if(self.isConnected(self.device) && (equals(mode, 'erg'))) {
                self.ftms.setTargetPower(power);
            }
        });
        xf.sub('db:resistanceTarget', resistance => {
            if(self.isConnected(self.device)) self.ftms.setTargetResistance(resistance);
        });

        xf.sub('db:slopeTarget', slope => {
            if(self.isConnected(self.device)) self.ftms.setTargetSlope(slope);
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
        return { dis, ftms };
    }
}

export { Controllable };
