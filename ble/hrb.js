import { xf }       from '../xf.js';
import { services } from './services.js';
import { Device }   from './device.js';
import { hrs }      from './hrs/hrs.js';

class Hrb {
    constructor(args) {
        this.device = new Device({filters: [{services: [services.heartRate.uuid]}],
                                  optionalServices:    [services.deviceInformation.uuid,
                                                        services.batteryService.uuid],
                                  name: args.name});

        this.name = args.name;
    }
    async connect() {
        const self = this;
        await self.device.connectAndNotify(services.heartRate.uuid,
                                           services.heartRate.heartRateMeasurement.uuid,
                                           self.onHeartRateMeasurement.bind(self));
        await self.device.deviceInformation();
        await self.device.batteryService();
    }
    async disconnect() {
        const self = this;
        self.device.disconnect();
    }
    async startNotifications() {
        const self = this;
        self.device.notify(services.heartRate.uuid,
                           services.heartRate.heartRateMeasurement.uuid,
                           self.onHeartRateMeasurement);
    }
    stopNotifications() {
        const self = this;
        self.device.stopNotifications(services.heartRate.heartRateMeasurement.uuid);
    }
    onHeartRateMeasurement (e) {
        const self     = this;
        const dataview = e.target.value;
        const data     = hrs.dataviewToHeartRateMeasurement(dataview);
        xf.dispatch('device:hr', data.hr);
    }
}

export { Hrb };
