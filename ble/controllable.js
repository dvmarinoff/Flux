import { xf }       from '../xf.js';
import { services } from './services.js';
import { Device }   from './device.js';
import { FTMS   }   from './ftms/ftms.js';
import { FECBLE }   from './fec-over-ble.js';

class Controllable {
    constructor(args) {
        this.device = new Device({filters: [{services: [services.fitnessMachine.uuid]},
                                            {services: [services.fecOverBle.uuid]}],
                                  optionalServices: [services.deviceInformation.uuid],
                                  name: args.name});
        this.protocol = {};
    }
    isConnected() {
        let self = this;
        if(self.device.connected === undefined) return false;
        return self.device.connected;
    }
    async connect() {
        let self = this;

        await self.device.connect();

        if(self.device.hasService(services.fitnessMachine.uuid)) {
            self.protocol = new FTMS({device:    self.device,
                                      onPower:   self.onPower,
                                      onCadence: self.onCadence,
                                      onSpeed:   self.onSpeed,
                                      onConfig:  self.onConfig });
            await self.protocol.connect();

        } else if(self.device.hasService(services.fecOverBle.uuid)) {
            console.log('Controllable: falling back to FE-C over BLE.');
            self.protocol = new FECBLE({device: self.device,
                                        onPower:   self.onPower,
                                        onCadence: self.onCadence,
                                        onSpeed:   self.onSpeed,
                                        onConfig:  self.onConfig });
            self.protocol.connect();
        } else {
            console.error('Controllable: no FTMS or BLE over FE-C.');
        }
    }
    async disconnect() {
        let self = this;
        this.device.disconnect();
    }
    async setPowerTarget(power) {
        const self = this;
        if(self.isConnected()) {
            self.protocol.setPowerTarget(power);
            console.log(`set power target: ${power}`);
        }
    }
    async setResistanceTarget(level) {
        const self = this;
        if(self.isConnected()) {
            self.protocol.setResistanceTarget(level);
        }
    }
    async setSlopeTarget(args) {
        const self = this;
        if(self.isConnected()) {
            self.protocol.setSlopeTarget(args);
        }
    }
    onConfig(args) {
        xf.reg('device:features', args.features);
    }
    onData(e) {
        const self     = this;
        const dataview = e.target.value;
    }
    onPower(power)     { xf.dispatch('device:pwr', power);   }
    onSpeed(speed)     { xf.dispatch('device:spd', speed);   }
    onCadence(cadence) { xf.dispatch('device:cad', cadence); }
}



export { Controllable };
