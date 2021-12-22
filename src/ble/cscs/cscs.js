import { uuids } from '../uuids.js';
import { BLEService } from '../service.js';
import { measurement as data } from './measurement.js';
import { feature } from './feature.js';
import { equals, exists, existance, first } from '../../functions.js';

class SpeedCadenceService extends BLEService {
    uuid = uuids.speedCadence;

    postInit(args = {}) {
        this.characteristics = {
            data: {
                uuid: uuids.speedCadenceMeasurement,
                supported: false,
                characteristic: undefined,
            },
            feature: {
                uuid: uuids.speedCadenceFeature,
                supported: false,
                characteristic: undefined,
            },
            sensorLocation: {
                uuid: uuids.sensorLocation,
                supported: false,
                characteristic: undefined,
            },
            controlPoint: {
                uuid: uuids.speedCadenceControlPoint,
                supported: false,
                characteristic: undefined,
            },
        };
    }
    // async start() {
    //     const self = this;
    //     self.service = await self.ble.getService(self.server, self.uuid);

    //     await self.getCharacteristics(self.service);
    //     self.features = await self.getFeatures();

    //     if(self.supported('measurement')) {
    //         await self.sub('measurement', measurement.decode, self.onData);
    //     }
    // }
}

export { SpeedCadenceService };
