import { uuids } from '../uuids.js';
import { dataviewToString } from '../../functions.js';

class DeviceInformationService {
    uuid = uuids.deviceInformation;
    characteristics = {};
    constructor(args) {
        this.ble = args.ble;
        this.device = args.device;
        this.server = args.server;
        this.deviceServices = args.services;
        this.onInfo = args.onInfo || ((x) => x);
        this._info = this.defaultInfo();
    }
    get info() { return this._info; }
    set info(x) { return this._info = x; }
    defaultManufecturerNameString() { return 'Unknown'; }
    defaultModelNumberString() { return ''; }
    defaultFirmwareRevisionString() { return ''; }
    defaultInfo() {
        const self = this;
        return { manufacturer: self.defaultManufecturerNameString(),
                 model:        self.defaultModelNumberString(),
                 firmware:     self.defaultFirmwareRevisionString() };
    }
    async init() {
        const self = this;
        self.service         = await self.ble.getService(self.server, self.uuid);
        self.characteristics = await self.getCharacteristics(self.service);
        self.info            = await self.readInfo(self.characteristics);
    }
    async getCharacteristics(service) {
        const self = this;
        const manufacturerNameString = await self.ble.getCharacteristic(service, uuids.manufacturerNameString);
        const modelNumberString      = await self.ble.getCharacteristic(service, uuids.modelNumberString);
        const firmwareRevisionString = await self.ble.getCharacteristic(service, uuids.firmwareRevisionString);
        return { manufacturerNameString, modelNumberString, firmwareRevisionString };
    }
    async readInfo(characteristics) {
        const self = this;
        const manufacturerDataview = (await self.ble.readCharacteristic(characteristics.manufacturerNameString)).value;
        const modelDataview        = (await self.ble.readCharacteristic(characteristics.modelNumberString)).value;
        const firmwareDataview     = (await self.ble.readCharacteristic(characteristics.firmwareRevisionString)).value;

        const manufacturer = dataviewToString(manufacturerDataview) || self.defaultManufecturerNameString();
        const model        = dataviewToString(modelDataview)        || self.defaultModelNumberString();
        const firmware     = dataviewToString(firmwareDataview)     || self.defaultFirmwareRevisionString();

        const info = { manufacturer, model, firmware };

        self.onInfo(info);
        return info;
    }
};

export { DeviceInformationService };
