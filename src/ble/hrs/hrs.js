import { uuids } from '../uuids.js';
import { heartRateMeasurementDecoder } from './heartRateMeasurement.js';

function eventToValue(decoder, cb) {
    return function (e) {
        return cb(decoder(e.target.value));
    };
}

class HeartRateService {
    uuid = uuids.heartRate;
    constructor(args) {
        this.ble = args.ble;
        this.device = args.device;
        this.server = args.server;
        this.deviceServices = args.services;
        this.onHeartRate = args.onHeartRate || ((x) => x);
    }
    async init() {
        const self = this;
        const heartRate = await self.ble.getService(self.server, self.uuid);
        const heartRateMeasurement = await self.ble.getCharacteristic(heartRate, uuids.heartRateMeasurement);

        self.ble.sub(heartRateMeasurement,
                     eventToValue(heartRateMeasurementDecoder, self.onHeartRate));
    }
}

export { HeartRateService };
