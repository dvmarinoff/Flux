import { xf } from '../functions.js';
import { ble } from './web-ble.js';
import { uuids } from './uuids.js';
import { Device } from './device.js';
import { HeartRateService } from './hrs/hrs.js';
import { DeviceInformationService } from './dis/dis.js';
import { models } from '../models/models.js';

function onHeartRate(data) {
    const self = this;
    if(('heartRate' in data) && models.sources.isSource('heartRate', self.id)) {
        xf.dispatch(`heartRate`, data.heartRate);
    }
}

class Hrm extends Device {
    defaultId()     { return `ble:hrm`; }
    defaultFilter() { return ble.requestFilters.hrm; }
    async start() {
        const self = this;

        const service = await self.getService(uuids.heartRate);

        self.hrs = new HeartRateService({
            onData: onHeartRate.bind(self),
            service,
            ble,
        });

        await self.hrs.start();
    }
}

export { Hrm }

