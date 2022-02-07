import { uuids } from '../uuids.js';
import { BLEService } from '../service.js';
import { feature } from './cycling-power-feature.js';
import { Measurement } from './cycling-power-measurement.js';
import { control } from './control-point.js';
import { equals, exists, existance, first } from '../../functions.js';

class CyclingPowerService extends BLEService {
    uuid = uuids.cyclingPower;

    postInit(args) {
        this.onData    = existance(args.onData,    this.defaultOnData);
        this.onControl = existance(args.onControl, this.defaultOnControlPoint);

        this.characteristics = {
            cyclingPowerFeature: {
                uuid: uuids.cyclingPowerFeature,
                supported: false,
                characteristic: undefined,
            },
            cyclingPowerMeasurement: {
                uuid: uuids.cyclingPowerMeasurement,
                supported: false,
                characteristic: undefined,
            },
            cyclingPowerControlPoint: {
                uuid: uuids.cyclingPowerControlPoint,
                supported: false,
                characteristic: undefined,
            },
        };
    }
    async postStart() {
        const self = this;
        self.features = await self.getFeatures();

        const measurement = Measurement();

        if(self.supported('cyclingPowerMeasurement')) {
            await self.sub('cyclingPowerMeasurement',
                           measurement.decode,
                           self.onData.bind(self));
        }

        if(self.supported('cyclingPowerControlPoint')) {
            await self.sub('cyclingPowerControlPoint',
                           control.response.decode,
                           self.onControl.bind(self));

            await self.requestControl();
        }
    }
    async getFeatures(service) {
        const self = this;
        const features = self.read('cyclingPowerFeature', feature.decode);

        console.log(':rx :cyclingPowerFeature ', JSON.stringify(features));

        return features;
    }
    async requestControl() {
        const self = this;
        const buffer = control.requestControl.encode();

        return await self.write('cyclingPowerControlPoint', buffer);
    }
    defaultOnData(decoded) {
        console.log(':rx :cps :measurement ', JSON.stringify(decoded));
    }
    defaultOnControlPoint(decoded) {
        control.response.toString(decoded);
    }
}

export { CyclingPowerService };

