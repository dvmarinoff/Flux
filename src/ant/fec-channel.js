import { xf, first, empty, exists } from '../functions.js';
import { Channel, keys } from './channel.js';
import { message } from './message.js';
import { page } from './page.js';

class FecChannel extends Channel {
    postInit(args) {
        this.dispatchBroadcast = args.dispatchBroadcast;
    }
    defaultNumber()     { return 2; }
    defaultType()       { return 0; }
    defaultDeviceType() { return 17; }
    defaultPeriod()     { return (32768 / 4); } // 8192
    defaultFrequency()  { return 57; }
    defaultKey()        { return keys.antPlus; }
    onBroadcast(msg) {
        const self = this;
        const data = page.FECPage(msg);
        self.dispatchBroadcast(data);
    }
    connect() {
        const self = this;
        console.log(self.toMessageConfig());
        self.open();
        xf.dispatch('ant:fec:connected');
    }
    disconnect() {
        const self = this;
        self.close();
        xf.dispatch('ant:fec:disconnected');
    }

}

export { FecChannel };
