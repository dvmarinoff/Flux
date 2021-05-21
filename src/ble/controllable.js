import { xf, isObject, equals, exists, empty, first, filterIn, prn } from '../functions.js';
import { ble } from './web-ble.js';
import { Device } from './device.js';
import { uuids }    from './uuids.js';
import { DeviceInformationService } from './dis/dis.js';
import { FitnessMachineService }    from './ftms/ftms.js';
import { models } from '../models/models.js';

function onIndoorBikeData(value) {
    const self = this;
    if(exists(value.power)   && models.sources.isSource('power', self.id))   xf.dispatch(`power`, value.power);
    if(exists(value.cadence) && models.sources.isSource('cadence', self.id)) xf.dispatch(`cadence`, value.cadence);
    if(exists(value.speed)   && models.sources.isSource('speed', self.id))   xf.dispatch(`speed`, value.speed);
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
    defaultId() { return `ble:controllable`; }
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

        let dis = {};
        if(ble.hasService(device, uuids.deviceInformation)) {
            dis = new DeviceInformationService({ble: ble, onInfo: onControllableInfo,  ...device});
            await dis.init();
            self.dis = dis;
        }

        const ftms = new FitnessMachineService({ble: ble,
                                                onStatus: onFitnessMachineStatus,
                                                onData: onIndoorBikeData.bind(self),
                                                onControl: onFitnessMachineControlPoint,
                                                ...device});
        await ftms.init();
        self.ftms = ftms;
        return { dis, ftms };
    }
}

export { Controllable };
