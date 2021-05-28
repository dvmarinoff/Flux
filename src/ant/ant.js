import { xf, first, empty, exists } from '../functions.js';
import { Serial } from './web-serial.js';
import { USB } from './web-usb.js';
import { Channel } from './channel.js';
import { SearchChannel } from './search-channel.js';
import { message } from './message.js';

class Ant {
    constructor(args) {
        this.driver   = {};
        this.channels = {};
        this.ready    = false;
        this.init();
    }
    async init() {
        const self = this;

        self.driver = new Serial({onData: self.onData.bind(self)});
        await self.driver.init();

        self.search = new SearchChannel({write: self.write.bind(self)});
        self.addChannel(0, self.search);

        self.deviceId = 0;
        xf.sub(`db:antDeviceId`, deviceId => {
            self.deviceId = deviceId;
        });

        xf.sub(`ui:ant:request:pair`,   e => {
            self.onPair(self.deviceId);
            self.search.stop();
        });
        xf.sub(`ui:ant:request:cancel`, e => {
            self.search.stop();
            self.onCancel();
        });

        // USB
        xf.sub('ant:disconnected', _ => {
            self.search.disconnect();
            this.ready = false;
        });

        xf.sub('serial:ready', _ => {
            self.ready = true;
            // restore state on page re-load
            Object.values(self.channels).forEach(channel => channel.disconnect());
        });
    }
    isAvailable() {
        const self = this;
        return self.driver.isAvailable();
    }
    addChannel(number, channel) {
        const self = this;
        self.channels[number] = channel;
    }
    onData(data) {
        const self = this;
        if(message.isValid(data)) {
            let number = message.readChannel(data);
            if(self.channels[number] !== undefined) {
                self.channels[number].onData(data);
            }
        }
    }
    write(buffer) {
        const self = this;
        self.driver.write(buffer);
    }
    async requestDevice(args) {
        const self = this;
        const filters = args.filters;
        await self.search.start(filters);
        xf.dispatch(`ant:device:request`);

        return new Promise((resolve, reject) => {
            self.onPair   = resolve;
            self.onCancel = reject;
        });
    }
}


const ant = new Ant();

export { ant };
