import { xf } from '../functions.js';
import { Channel, keys } from './channel.js';
import { message } from './message.js';
import { page } from './page.js';

class HrmChannel extends Channel {
    postInit(args) {
        this.dispatchBroadcast = args.dispatchBroadcast;
    }
    defaultNumber()     { return 1; }
    defaultType()       { return 0; }
    defaultDeviceType() { return 120; }
    defaultPeriod()     { return (32280 / 4); }
    defaultFrequency()  { return 57; }
    defaultKey()        { return keys.antPlus; }
    onBroadcast(msg) {
        const self = this;
        const data = page.HRPage(msg);
        self.dispatchBroadcast(data);
    }
    async connect() {
        const self = this;
        console.log(self.toMessageConfig());
        await self.open();
        xf.dispatch('ant:hrm:connected');
    }
    disconnect() {
        const self = this;
        self.close();
        xf.dispatch('ant:hrm:disconnected');
    }
    isConnected() {
        const self = this;
        return self.isOpen;
    }
}

export { HrmChannel };
