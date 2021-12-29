import { uuids } from '../uuids.js';
import { BLEService } from '../service.js';
import { measurement } from '../cps/cycling-power-measurement.js';
import { existance } from '../../functions.js';
import { control } from './control.js';

class WahooCyclingPower extends BLEService {
    uuid = uuids.cyclingPower;

    postInit(args = {}) {
        this.onData    = existance(args.onData,    this.defaultOnData);
        this.onControl = existance(args.onControl, this.defaultOnControlPoint);

        this.characteristics = {
            wahooTrainer: {
                uuid: uuids.wahooTrainer,
                supported: false,
                characteristic: undefined
            },
            cyclingPowerMeasurement: {
                uuid: uuids.cyclingPowerMeasurement,
                supported: false,
                characteristic: undefined,
            },
        };
    }
    async config() {
        const self = this;

        if(self.supported('cyclingPowerMeasurement')) {
            await self.sub('cyclingPowerMeasurement',
                           measurement.decode,
                           self.onData.bind(self));
        }

        if(self.supported('wahooTrainer')) {
            await self.sub('wahooTrainer',
                           control.response.decode,
                           self.onControl.bind(self));

            await self.requestControl();
        }
    }
    async requestControl() {
        const self = this;
        const buffer = control.requestControl.encode();

        return await self.write('wahooTrainer', buffer);
    }
    async setTargetPower(value) {
        const self = this;
        const buffer = control.powerTarget.encode({power: value});

        return await self.write('wahooTrainer', buffer);
    }
    async setTargetResistance(value) {
        const self = this;

        // const buffer = control.resistanceTarget.encode({resistance: value});
        // return await self.write('wahooTrainer', buffer);

        return;
    }
    async setTargetSlope(value) {
        const self = this;

        // const buffer = control.slopeTarget.encode({grade: value});;
        // return await self.write('wahooTrainer', buffer);

        return;
    }
    defaultOnData(decoded) {
        console.log(':rx :wcps :measurement ', JSON.stringify(decoded));
    }
    defaultOnControlPoint(decoded) {
        control.response.toString(decoded);
    }
}

export { WahooCyclingPower };
