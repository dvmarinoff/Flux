import { uuids } from '../uuids.js';
import { cpsFeatureDecoder } from './cycling-power-feature.js';
import { cyclingPowerMeasurementDecoder } from './cycling-power-measurement.js';
import { requestControl } from './control-point.js';



function eventToValue(decoder, callback) {
    return function (e) {
        return callback(decoder(e.target.value));
    };
}

class CyclingPowerService {
    uuid = uuids.cyclingPower;
    characteristics = {};
    constructor(args) {
        this.ble = args.ble;
        this.device = args.device;
        this.server = args.server;
        this.deviceServices = args.services;
        this.onStatus = args.onStatus || ((x) => x);
        this.onControl = args.onControl || ((x) => x);
        this.onData = args.onData || ((x) => x);
    }
    async init() {
        const self = this;
        self.service = await self.ble.getService(self.server, self.uuid);
        self.characteristics = await self.getCharacteristics(self.service);

        const flags = await self.ble.readCharacteristic(self.characteristics.cyclingPowerFeature);
        self.feature = cpsFeatureDecoder(flags.value);

        self.ble.sub(self.characteristics.cyclingPowerMeasurement,
                     eventToValue(cyclingPowerMeasurementDecoder, self.onData));
    }
    async getCharacteristics(service, feature) {
        const self = this;
        const cyclingPowerFeature      = await self.ble.getCharacteristic(service, uuids.cyclingPowerFeature);
        const cyclingPowerMeasurement  = await self.ble.getCharacteristic(service, uuids.cyclingPowerMeasurement);
        const sensorLocation           = await self.ble.getCharacteristic(service, uuids.sensorLocation);

        return {
            cyclingPowerFeature,
            cyclingPowerMeasurement,
            sensorLocation,
        };
    }
    async getOptionalCharacteristics(service, feature) {
        const self = this;
        const cyclingPowerVector       = await self.ble.getCharacteristic(service, uuids.fitnessMachineStatus);
        const cyclingPowerControlPoint = await self.ble.getCharacteristic(service, uuids.fitnessMachineControlPoint);

        let characteristics = {};
        characteristics['cyclingPowerControlPoint'] = cyclingPowerControlPoint;
        characteristics['cyclingPowerVector'] = cyclingPowerVector;

        return characteristics;
    }
    async requestControl() {
        const self = this;
        return await self.ble.writeCharacteristic(self.characteristics.cyclingPowerControlPoint, requestControl().buffer);
    }
}


export { CyclingPowerService };
