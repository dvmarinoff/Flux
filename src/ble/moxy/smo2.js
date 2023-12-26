import { uuids } from '../uuids.js';
import { BLEService } from '../service.js';
import { sensorData } from './moxy.js';
import { existance } from '../../functions.js';

class SmO2Service extends BLEService {
    uuid = uuids.moxySmO2

    postInit(args = {}) {
        this.onData = args.onData ?? this.defaultOnData;

        this.characteristics = {
            moxySmO2SensorData: {
                uuid: uuids.moxySmO2SensorData,
                supported: false,
                characteristic: undefined,
            },
            SmO2DeviceControl: {
                uuid: uuids.moxySmO2DeviceControl,
                supported: false,
                characteristic: undefined,
            },
        };
    }
    async postStart() {
        const self = this;

        if(self.supported('moxySmO2SensorData')) {
            await self.sub('moxySmO2SensorData', sensorData.decode, self.onData.bind(self));
        }
    }
    defaultOnData(decoded) {
        console.log(':rx :smo2 :sensorData ', JSON.stringify(decoded));
    }
}

export {
    SmO2Service,
}
