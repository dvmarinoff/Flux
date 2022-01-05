import { uuids } from '../uuids.js';
import { BLEService } from '../service.js';
import { Measurement } from '../cps/cycling-power-measurement.js';
import { existance, delay } from '../../functions.js';
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
            await self.setParameters();
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

        const buffer = control.loadIntensity.encode({intensity: (value / 100)});
        return await self.write('wahooTrainer', buffer);
    }
    async setTargetSlope(value) {
        const self = this;

        const buffer = control.slopeTarget.encode({grade: value});;
        return await self.write('wahooTrainer', buffer);
    }
    async setParameters(args) {
        const self = this;

        const params = {
            circumference: 2105,
            windSpeed: 0,
            weight: 75,
            crr: 0.004,
            windResistance: 0.51,
        };

        await delay(1000);
        await self.setWheelCircumference(params);
        await delay(1000);
        await self.setSIM(params);
        await delay(1000);
        await self.setWindSpeed(params);
    }
    async setSIM(args) {
        const self = this;

        const buffer = control.sim.encode(args);
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
    defaultOnData(decoded) {
        console.log(':rx :wcps :measurement ', JSON.stringify(decoded));
    }
    defaultOnControlPoint(decoded) {
        control.response.toString(decoded);
    }
}

export { WahooCyclingPower };
