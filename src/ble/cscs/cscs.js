import { uuids } from '../uuids.js';
import { BLEService } from '../service.js';
import { Measurement } from './measurement.js';
import { feature } from './feature.js';
import { equals, exists, existance, first } from '../../functions.js';

class SpeedCadenceService extends BLEService {
    uuid = uuids.speedCadence;

    postInit(args = {}) {
        this.characteristics = {
            measurement: {
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
    async postStart() {
        const self = this;

        const measurement = Measurement();

        measurement.cadence.setMaxRateCount(
            existance(self.options.maxRateCount)
        );

        if(self.supported('measurement')) {
            await self.sub('measurement', measurement.decode, self.onData);
        }
    }
}

export { SpeedCadenceService };

