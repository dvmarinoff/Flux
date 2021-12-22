import { xf, equals, exists } from '../functions.js';
import { ble } from './web-ble.js';
import { uuids } from './uuids.js';
import { Device } from './device.js';
import { SpeedCadenceService } from './cscs/cscs.js';
import { models } from '../models/models.js';

class SpeedCadence extends Device {
    defaultId()     { return `ble:speed-and-cadence`; }
    defaultFilter() { return ble.requestFilters.speedCadence; }
    async start() {
        const self = this;

        self.speedCadence = new SpeedCadenceService({
            onData:   onData.bind(self),
            services: self.services,
            server:   self.server,
            ble,
        });

        await self.speedCadence.start();
    }
}

function onData(value) {
    const self = this;
    if(exists(value.cadence) && models.sources.isSource('cadence', self.id)) {
        xf.dispatch(`cadence`, value.cadence);
    };
    if(exists(value.speed) && models.sources.isSource('speed', self.id)) {
        xf.dispatch(`speed`, value.speed);
    };
}

export {
    SpeedCadence
};

