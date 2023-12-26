import { xf } from '../functions.js';
import { ble } from './web-ble.js';
import { uuids } from './uuids.js';
import { Device } from './device.js';
import { SmO2Service } from './moxy/smo2.js';
import { models } from '../models/models.js';

function onSensorData(data) {
    const self = this;
    if(('currentSaturatedHemoglobin' in data)) {
        xf.dispatch(`smo2`, data.currentSaturatedHemoglobin);
    }
    if(('previousSaturatedHemoglobin' in data)) {
        // xf.dispatch(`previousSaturatedHemoglobin`, data.previousSaturatedHemoglobin);
    }
    if(('totalHemoglobinSaturation' in data)) {
        xf.dispatch(`thb`, data.totalHemoglobinSaturation);
    }
}

class MoxyMonitor extends Device {
    defaultId()     {
        return `ble:moxy`;
    }
    defaultFilter() {
        return ble.requestFilters.moxy;
    }
    async start() {
        const self = this;

        const service = await self.getService(uuids.moxySmO2);

        self.smo2 = new SmO2Service({
            onData: onSensorData.bind(self),
            service,
            ble,
        });

        await self.smo2.start();
    }
}

export { MoxyMonitor }
