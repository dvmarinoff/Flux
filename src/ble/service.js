import { equals, exists, existance, first, dataviewToArray } from '../functions.js';

const data = {
    decode: function(dataview) {
        return dataviewToArray(dataview);
    },
};

function eventToValue(decoder, callback) {
    return function (e) {
        return callback(decoder(e.target.value));
    };
}

function findCharacteristic(list, uuid) {
    return first(list.filter(x => equals(x.uuid, uuid)));
}

class BLEService {
    constructor(args = {}) {
        this.ble     = existance(args.ble);
        this.service = existance(args.service);
        this.onData  = existance(args.onData, ((x) => x));
        this.options = existance(args.options, {});
        this.postInit(args);
    }
    postInit(args = {}) {
        this.uuid = existance(args.uuid);

        this.characteristics = {
            data: {
                uuid: '',
                supported: false,
                characteristic: undefined,
            },
        };
    }
    async start() {
        const self = this;
        await self.getCharacteristics(self.service);
        await self.postStart();
    }
    async config() {
        const self = this;
        if(self.supported('data')) {
            await self.sub('data', data.decode, self.onData);
        }
    }
    characteristic(key) {
        const self = this;
        if(exists(self.characteristics[key])) {
            return self.characteristics[key].characteristic;
        }
        return undefined;
    }
    supported(key) {
        const self = this;
        if(exists(self.characteristics[key])) {
            return self.characteristics[key].supported;
        }
        return false;
    }
    async getCharacteristics(service) {
        const self = this;
        const list = await self.ble.getCharacteristics(service);

        Object.keys(self.characteristics).forEach((key) => {
            const characteristic = findCharacteristic(list, self.characteristics[key].uuid);

            if(exists(characteristic)) {
                self.characteristics[key].characteristic = characteristic;
                self.characteristics[key].supported = true;
            }

            return;
        });

        console.log(':rx :characteristics ', self.characteristics);

        return;
    }
    async sub(prop, decoder, callback) {
        const self = this;
        const characteristic = self.characteristic(prop);

        if(exists(characteristic)) {
            await self.ble.sub(characteristic, eventToValue(decoder, callback));
            return true;
        } else {
            return false;
        }
    }
    async unsub(prop, decoder, callback) {
        const self = this;
        const characteristic = self.characteristic(prop);

        if(exists(characteristic)) {
            await self.ble.unsub(characteristic, eventToValue(decoder, callback));
            return true;
        } else {
            return false;
        }
    }
    async write(prop, buffer) {
        const self = this;
        const characteristic = self.characteristic(prop);

        if(exists(characteristic)) {
            const res = await self.ble.writeCharacteristic(characteristic, buffer);
            return res;
        } else {
            return false;
        }
    }
    async read(prop, decoder = ((x) => x)) {
        const self = this;
        const characteristic = self.characteristic(prop);

        if(exists(characteristic)) {
            const res = await self.ble.readCharacteristic(characteristic);
            return decoder(res);
        } else {
            return false;
        }
    }
}

export {
    BLEService
};

