import { uuids } from '../uuids.js';
import { BLEService } from '../service.js';
import { Measurement } from '../cps/cycling-power-measurement.js';
import { equals, existance, delay } from '../../functions.js';
import { control } from './control.js';

class WahooCyclingPower extends BLEService {
    uuid = uuids.cyclingPower;

    postInit(args = {}) {
        this.protocol   = 'wcps';
        this.delay      = 1000;
        this.onData     = existance(args.onData,    this.defaultOnData);
        this.onControl  = existance(args.onControl, this.defaultOnControlPoint);

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
    async postStart() {
        const self = this;

        const measurement = Measurement();

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
    async config(args) {
        await self.setParameters();
    }
    async requestControl() {
        const self = this;
        const buffer = control.requestControl.encode();

        return await self.write('wahooTrainer', buffer);
    }
    async setTargetPower(value) {
        const self = this;
        const buffer = control.powerTarget.encode({power: value});

        console.log(self.controllable.mode);

        return await self.write('wahooTrainer', buffer);
    }
    async setTargetResistance(value) {
        const self = this;

        const buffer = control.loadIntensity.encode({intensity: (value / 100)});
        return await self.write('wahooTrainer', buffer);
    }
    async setTargetSlope(value) {
        const self = this;

        console.log(self.controllable.mode);


        if(!equals(self.controllable.mode, 'erg')) {
            await self.setSIM({weight: self.weight});
            await delay(1000); // test if this is really needed
        }

        const buffer = control.slopeTarget.encode({grade: value});;
        return await self.write('wahooTrainer', buffer);
    }
    async setParameters(args) {
        const self = this;

        const params = {
            circumference: 2105,
            windSpeed: 0,
            weight: self.controllable.userWeight,
        };

        await delay(1000);
        await self.setWheelCircumference(params.circumference);
        // await delay(1000);
        // await self.setSIM(params);
        await delay(1000);
        await self.setWindSpeed(params.windSpeed);
    }
    async setSIM(args) {
        const self = this;

        const params = {
            weight: args.weight,
            crr: 0.004,
            windResistance: 0.51,
        };

        const buffer = control.sim.encode(params);
        return await self.write('wahooTrainer', buffer);
    }
    async setWindSpeed(value) {
        const self = this;

        const buffer = control.windSpeed.encode({windSpeed: value});
        return await self.write('wahooTrainer', buffer);
    }
    async setWheelCircumference(value) {
        const self = this;

        const buffer = control.wheelCircumference.encode({circumference: value});
        return await self.write('wahooTrainer', buffer);
    }
    async setUserWeight(kg = 75) {
        const self = this;
        self.userWeight = kg;
        await self.setSIM({weight: kg});
    }
    defaultOnData(decoded) {
        console.log(':rx :wcps :measurement ', JSON.stringify(decoded));
    }
    defaultOnControlPoint(decoded) {
        control.response.toString(decoded);
    }
}

export { WahooCyclingPower };
