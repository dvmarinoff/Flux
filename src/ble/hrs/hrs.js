import { uuids } from '../uuids.js';
import { heartRateMeasurement } from './heartRateMeasurement.js';

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
        const service = await self.ble.getService(self.server, self.uuid);
        const characteristic = await self.ble.getCharacteristic(service, uuids.heartRateMeasurement);

        self.ble.sub(characteristic, eventToValue(heartRateMeasurement.decode, self.onHeartRate));
    }
}

export { HeartRateService };
