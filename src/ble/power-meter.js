import { xf, isObject, equals, exists, empty, first, filterIn, prn } from '../functions.js';
import { ble } from './web-ble.js';
import { Device } from './device.js';
import { DeviceInformationService } from './dis/dis.js';
import { CyclingPowerService } from './cps/cps.js';

class PowerMeter extends Device {
    defaultId() { return 'powerMeter'; }
    defaultFilter() { return ble.requestFilters.power; }
    postInit() {
        const self = this;

        let mode = 'erg';
        xf.sub(`db:mode`, value => mode = value);
    }
    async initServices(device) {
        const self = this;
        const dis = new DeviceInformationService({ble: ble, onInfo: onCyclingPowerInfo,  ...device});
        await dis.init();

        const cps = new CyclingPowerService({ble: ble,
                                             onData: onPowerData,
                                             onControl: onCyclingPowerControlPoint,
                                             ...device});
        await cps.init();
        self.cps = cps;
        self.dis = dis;

        console.log(self.cps.feature);

        return { dis, cps };
    }
}

function onPowerData(data) {
    if(exists(data.power)) xf.dispatch('power', data.power);
    if(exists(data.cadence)) xf.dispatch('cadence', data.cadence);
    // if(exists(data.speed)) xf.dispatch('speed', data.speed);
    if(exists(data.offsetIndicator)) xf.dispatch('offsetIndicator', data.offsetIndicator);
    // console.log(data);
}
function onCyclingPowerInfo() {
}
function onCyclingPowerControlPoint() {
}

export { PowerMeter };
