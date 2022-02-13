import { uuids } from '../uuids.js';
import { BLEService } from '../service.js';
import { indoorBikeData } from './indoor-bike-data.js';
import { control } from './control-point.js';
import { status } from './fitness-machine-status.js';
import { feature } from './fitness-machine-feature.js';
import { supported } from './supported-ranges.js';
import { existance } from '../../functions.js';

class FitnessMachineService extends BLEService {
    uuid = uuids.fitnessMachine;

    postInit(args = {}) {
        this.protocol  = 'ftms';
        this.wait      = 500;
        this.onData    = existance(args.onData,    this.defaultOnData);
        this.onStatus  = existance(args.onStatus,  this.defaultOnStatus);
        this.onControl = existance(args.onControl, this.defaultOnControlPoint);

        this.characteristics = {
            fitnessMachineFeature: {
                uuid: uuids.fitnessMachineFeature,
                supported: false,
                characteristic: undefined
            },
            supportedPowerRange: {
                uuid: uuids.supportedPowerRange,
                supported: false,
                characteristic: undefined,
            },
            supportedResistanceLevelRange: {
                uuid: uuids.supportedResistanceLevelRange,
                supported: false,
                characteristic: undefined,
            },
            fitnessMachineStatus: {
                uuid: uuids.fitnessMachineStatus,
                supported: false,
                characteristic: undefined,
            },
            fitnessMachineControlPoint: {
                uuid: uuids.fitnessMachineControlPoint,
                supported: false,
                characteristic: undefined,
            },
            indoorBikeData: {
                uuid: uuids.indoorBikeData,
                supported: false,
                characteristic: undefined,
            },
        };
    }
    async postStart() {
        const self = this;

        self.features = await self.getFeatures();

        if(self.supported('fitnessMachineStatus')) {
            await self.sub('fitnessMachineStatus', status.decode, self.onStatus);
        }

        if(self.supported('indoorBikeData')) {
            await self.sub('indoorBikeData', indoorBikeData.decode, self.onData);
        }

        if(self.supported('fitnessMachineControlPoint')) {
            await self.sub('fitnessMachineControlPoint', control.response.decode, self.onControl);

            await self.requestControl();
        }

        return;
    }
    async getFeatures(service) {
        const self = this;
        const features = self.read('fitnessMachineFeature', feature.decode);

        console.log(':rx :fitnessMachineFeature ', JSON.stringify(features));

        return features;
    }
    async requestControl() {
        const self = this;
        const buffer = control.requestControl.encode();

        return await self.write('fitnessMachineControlPoint', buffer);
    }
    async reset() {
        const self = this;
        const buffer = control.reset.encode();

        return await self.write('fitnessMachineControlPoint', buffer);
    }
    async setTargetPower(value) {
        const self = this;
        const buffer = control.powerTarget.encode({power: value});

        return await self.write('fitnessMachineControlPoint', buffer);
    }
    async setTargetResistance(value) {
        const self = this;
        const buffer = control.resistanceTarget.encode({resistance: value});

        return await self.write('fitnessMachineControlPoint', buffer);
    }
    async setTargetSlope(value) {
        const self = this;
        const buffer = control.simulationParameters.encode({grade: value});;

        return await self.write('fitnessMachineControlPoint', buffer);
    }
    async setWheelCircumference(value) {
        const self = this;
        const buffer = control.wheelCircumference.encode({circumference: value});;

        return await self.write('fitnessMachineControlPoint', buffer);
    }
    defaultOnData(decoded) {
        console.log(':rx :ftms :indoorBikeData ', JSON.stringify(decoded));
    }
    defaultOnControlPoint(decoded) {
        control.response.toString(decoded);
    }
    defaultOnStatus(decoded) {
        status.toString(decoded);
    }
}

export { FitnessMachineService };

