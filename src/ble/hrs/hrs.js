import { uuids } from '../uuids.js';
import { BLEService } from '../service.js';
import { heartRateMeasurement } from './heartRateMeasurement.js';
import { existance } from '../../functions.js';

class HeartRateService extends BLEService {
    uuid = uuids.heartRate;

    postInit(args) {
        this.onData = existance(args.onData, ((x) => x));

        this.characteristics = {
            heartRateMeasurement: {
                uuid: uuids.heartRateMeasurement,
                supported: false,
                characteristic: undefined,
            },
        };
    }
    async postStart() {
        const self = this;
        if(self.supported('heartRateMeasurement')) {
            await self.sub('heartRateMeasurement',
                           heartRateMeasurement.decode,
                           self.onData.bind(self));
        }
    }
}

export {
    HeartRateService
};

