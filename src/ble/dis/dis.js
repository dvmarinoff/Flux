import { uuids } from '../uuids.js';
import { BLEService } from '../service.js';
import { existance, dataviewToString } from '../../functions.js';

function StringCharacteristic() {
    function encode() {}
    function decode(dataview) {
        return dataviewToString(dataview);
    }

    return Object.freeze({
        encode,
        decode,
    });
}

const stringCharacteristic = StringCharacteristic();

class DeviceInformationService extends BLEService {
    uuid = uuids.deviceInformation;

    postInit(args) {
        this.onInfo = existance(args.onInfo, ((x) => x));
        this.value  = this.defaultValue();

        this.characteristics = {
            manufacturerNameString: {
                uuid: uuids.f,
                supported: false,
                characteristic: undefined,
            },
            modelNumberString: {
                uuid: uuids.f,
                supported: false,
                characteristic: undefined,
            },
            serialNumberString: {
                uuid: uuids.f,
                supported: false,
                characteristic: undefined,
            },
            hardwareRevisionString: {
                uuid: uuids.f,
                supported: false,
                characteristic: undefined,
            },
            firmwareRevisionString: {
                uuid: uuids.f,
                supported: false,
                characteristic: undefined,
            },
            softwareRevisionString: {
                uuid: uuids.f,
                supported: false,
                characteristic: undefined,
            },
            systemID: {
                uuid: uuids.f,
                supported: false,
                characteristic: undefined,
            },
            regulatoryCertification: {
                uuid: uuids.f,
                supported: false,
                characteristic: undefined,
            },
            PnPID: {
                uuid: uuids.f,
                supported: false,
                characteristic: undefined,
            }
        };
    }
    defaultValue() {
        return {
            manufacturer: 'Unknown',
            model:        '',
            firmware:     '',
        };
    }
    async start() {
        const self = this;

        self.service = await self.ble.getService(self.server, self.uuid);

        await self.getCharacteristics(self.service);

        const info = self.readInfo();
        self.onInfo(info);
    }
    async readInfo() {
        const self = this;

        const info = self.defaultValue();

        if(self.supported('manufacturerNameString')) {
            info['manufacturer'] = await self.read('manufacturerNameString', stringCharacteristic.decode);
        }

        if(self.supported('modelNumberString')) {
            info['model'] = await self.read('modelNumberString', stringCharacteristic.decode);
        }

        if(self.supported('firmwareRevisionString')) {
            info['firmware'] = await self.read('firmwareRevisionString', stringCharacteristic.decode);
        }

        return info;
    }
};

export { DeviceInformationService };
