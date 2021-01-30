import { xf } from './xf.js';
import { exists } from './functions.js';
import { Device }   from './device.js';
import { services } from './services.js';

class FobControllable {
    constructor(args) {
        this.device = new Device({filter: services.fecOverBle.uuid,
                                  optionalServices: [services.deviceInformation.uuid],
                                  name: args.name});
    }
    async connect() {
        await self.device.connectAndNotify(services.fecOverBle.uuid,
                                           services.fecOverBle.fec3.uuid,
                                           self.onFECdata);
    }
    onFECdata(e) {
        let dataview = e.target.value;
        console.log(`onFECData: ${dataview}`);
    }
    setTargetPower() {}
    setTargetResistance() {}
    setTargetSlope() {}
}

export { FobControllable };
