import { stringToHex,
         hexToString,
         hex,
         dataViewToString,
         getBitField,
         toBool, }  from '../functions.js';

import { xf }       from '../xf.js';
import { Device }   from './device.js';
import { services } from './services.js';
import { hrs }      from './hrs.js';

class Hrb {
    constructor(args) {
        this.device = new Device({filter: services.heartRate.uuid,
                                  optionalServices: [services.deviceInformation.uuid,
                                                     services.batteryService.uuid],
                                  name: args.name});
        this.name = args.name;
    }
    async connect() {
        let self = this;
        await self.device.connectAndNotify(services.heartRate.uuid,
                                     services.heartRate.heartRateMeasurement.uuid,
                                     self.onHeartRateMeasurement);
        await self.device.deviceInformation();
        await self.device.batteryService();
    }
    async disconnect() {
        this.device.disconnect();
    }
    async startNotifications() {
        let self = this;
        self.device.notify(services.heartRate.uuid,
                           services.heartRate.heartRateMeasurement.uuid,
                           self.onHeartRateMeasurement);
    }
    stopNotifications() {
        let self = this;
        self.device.stopNotifications(services.heartRate.heartRateMeasurement.uuid);
    }
    onHeartRateMeasurement (e) {
        let dataview = e.target.value;
        let data     = hrs.dataviewToHeartRateMeasurement(dataview);
        xf.dispatch('device:hr', data.hr);
    }
}

export { Hrb };
