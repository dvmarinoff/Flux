import { xf, exists, empty, first, filterIn, prn } from '../functions.js';
import { ble } from './web-ble.js';

class Device {
    constructor(args) {
        this.init(args);
        if(!exists(args)) args = {};
        this.id       = args.id     || this.defaultId();
        this.name     = args.name   || this.defaultName();
        this.filter   = args.filter || this.defaultFilter();
        this.device   = {};
        this.server   = {};
        this.services = {};
        this.postInit(args);
        this.start();
    }
    defaultFilter() { return  ble.requestFilters.all; }
    defaultId()     { return 'ble-device'; }
    defaultName()   { return 'Unknown'; }
    start() {
        const self = this;

        xf.sub(`ui:${self.id}:switch`, async () => {
            if(self.isConnected()) {
                self.disconnect();
            } else {
                self.connect();
            }
        });
    }
    init(args) { return; }
    postInit(args) { return; }
    isConnected() {
        const self = this;
        return ble.isConnected(self.device);
    }
    async connect() {
        const self = this;
        xf.dispatch(`${self.id}:connecting`);
        try {
            const res = await ble.connect(self.filter);

            self.device   = res.device;
            self.server   = res.server;
            self.services = res.services;
            self.name     = self.device.name;

            await self.initServices(res);

            xf.dispatch(`${self.id}:connected`);
        } catch(err) {
            xf.dispatch(`${self.id}:disconnected`);
            console.error(`Could not request ${self.id}: `, err);
        } finally {
            if(self.isConnected()) {
                self.device.addEventListener('gattserverdisconnected', self.onDisconnect.bind(self));
            }
        }
    }
    disconnect() {
        const self = this;
        ble.disconnect(self.device);
    }
    onDisconnect() {
        const self = this;
        xf.dispatch(`${self.id}:disconnected`);
        console.log(`Disconnected ${self.id}, ${self.name}.`);
        self.device.removeEventListener('gattserverdisconnected', self.onDisconnect.bind(self));
    }
    async initServices(device) { return {}; }
}

export { Device };
