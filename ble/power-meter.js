import {hexToString,
         dataViewToString,
         getBitField,
         toBool, }  from '../functions.js';

import { xf }       from '../xf.js';
import { Device }   from './device.js';
import { cps }      from './cps.js';
import { services } from './services.js';

class PowerMeter {
    constructor(args) {
        this.device = new Device({filter: services.cyclingPower.uuid,
                                  optionalServices: [services.deviceInformation.uuid],
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
        console.log(data);
        xf.dispatch('pm:power', data.power);
    }
}

export { PowerMeter };
