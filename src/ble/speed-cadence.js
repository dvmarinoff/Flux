import { xf, equals, exists } from '../functions.js';
import { ble } from './web-ble.js';
import { uuids } from './uuids.js';
import { Device } from './device.js';
import { SpeedCadenceService } from './cscs/cscs.js';
import { models } from '../models/models.js';

class SpeedCadence extends Device {
    defaultId() {
        return `ble:speed-and-cadence`;
    }
    defaultFilter() {
        return ble.requestFilters.speedCadence;
    }
    async start() {
        const self = this;

        const service = await self.getService(uuids.speedCadence);

        const maxRateCount = (/magene|gemini/.test(self.name.toLowerCase())) ? 10 : 3;

        self.speedCadence = new SpeedCadenceService({
            onData: onData.bind(self),
            options: {maxRateCount},
            service,
            ble,
        });

        await self.speedCadence.start();
    }
}

function onData(data) {
    const self = this;

    if(exists(data.cadence) && models.sources.isSource('cadence', self.id)) {
        xf.dispatch('cadence', data.cadence);
    };
    if(exists(data.speed) && models.sources.isSource('speed', self.id)) {
        xf.dispatch(`speed`, data.speed);
    };
}

export { SpeedCadence };

