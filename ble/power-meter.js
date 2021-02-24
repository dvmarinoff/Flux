import { xf }       from '../xf.js';
import { services } from './services.js';
import { Device }   from './device.js';
import { cps }      from './cps/cps.js';

class PowerMeter {
    constructor(args) {
        this.device = new Device({filters: [{services: [services.cyclingPower.uuid]}],
                                  optionalServices:    [services.deviceInformation.uuid,
                                                        services.batteryService.uuid],
                                  name: args.name});
        this.cyclingPowerFeature = {};
    }
    isConnected() {
        let self = this;
        return self.device.connected;
    }
    async connect() {
        let self = this;
        await self.device.connectAndNotify(services.cyclingPower.uuid,
                                           services.cyclingPower.cyclingPowerMeasurement.uuid,
                                           self.onCyclingPowerMeasurementData);

        await self.device.deviceInformation();
    }
    async getCyclingPowerFeature() {
        let self = this;
    }
    onCyclingPowerMeasurementData(e) {
        let dataview = e.target.value;
        let data = cps.dataviewToCyclingPowerMeasurement(dataview);
        xf.dispatch('pm:power', data.power);
    }
}

export { PowerMeter };
