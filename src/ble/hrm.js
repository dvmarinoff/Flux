import { xf } from '../functions.js';
import { ble } from './web-ble.js';
import { uuids } from './uuids.js';
import { Device } from './device.js';
import { HeartRateService } from './hrs/hrs.js';
import { DeviceInformationService } from './dis/dis.js';
import { models } from '../models/models.js';

function onHeartRate(value) {
    const self = this;
    if(('hr' in value) && models.sources.isSource('heartRate', self.id)) xf.dispatch(`heartRate`, value.hr);
}
function onHrmInfo(value) {
    console.log(`Heart Rate Monitor Information: `, value);
}

class Hrm extends Device {
    defaultId() { return `ble:hrm`; }
    defaultFilter() { return ble.requestFilters.hrm; }
    postInit() {
        const self = this;
    }
    async initServices(device) {
        const self = this;
        const hrs = new HeartRateService({ble: ble, onHeartRate: onHeartRate.bind(self), ...device});
        await hrs.init();

        const dis = new DeviceInformationService({ble: ble, onInfo: onHrmInfo, ...device});

        if(ble.hasService(device, uuids.deviceInformation)) {
            await dis.init();
        }

        return { hrs, dis };
    }
}

export { Hrm }
