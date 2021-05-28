import { xf, first, empty, exists, equals } from '../functions.js';
import { Channel, keys } from './channel.js';
import { FecChannel } from './fec-channel.js';
import { message } from './message.js';
import { Device } from './device.js';
import { ant } from './ant.js';
import { models } from '../models/models.js';

class Controllable extends Device {
    async postInit() {
        const self = this;
        let mode = 'erg';
        xf.sub(`db:mode`, value => mode = value);

        xf.sub('db:powerTarget', power => {
            if(self.connected && (equals(mode, 'erg'))) {
                self.setTargetPower(power);
            }
        });
        xf.sub('db:resistanceTarget', resistance => {
            if(self.connected) self.setTargetResistance(resistance);
        });

        xf.sub('db:slopeTarget', slope => {
            if(self.connected) self.setTargetSlope(slope);
        });
    }
    defaultName() { return 'ANT+ F-EC'; }
    defaultId() { return 'ant:controllable'; }
    defaultChannelClass() { return FecChannel; }
    defaultDeviceId() {
        return { deviceNumber: 0, deviceType: 17, transType: 0 };
    }
    defaultFilters() {
        return {
            deviceType: 17,
            period: (32768 / 4),
            frequency: 57,
            key: keys.antPlus,
        };
    }
    async setTargetPower(power) {
        const self   = this;
        const buffer = message.targetPower(power, self.channel.number).buffer;
        self.channel.write(buffer);
    }
    async setTargetResistance(level) {
        const self = this;
        const buffer = message.targetResistance(level, self.channel.number).buffer;
        self.channel.write(buffer);
    }
    async setTargetSlope(args) {
        const self = this;
        const buffer = message.targetSlope(args.grade, self.channel.number).buffer;
        self.channel.write(buffer);
    }
    onData(data) {
        const self = this;
        // check if current selected source for each value
        // models.sources.isSource('power', self.id)
        if(('power' in data) && !isNaN(data.power) && models.sources.isSource('power', self.id)) {
            xf.dispatch('power', data.power);
        };
        if(('cadence' in data) && !isNaN(data.cadence) && models.sources.isSource('cadence', self.id)) {
            xf.dispatch('cadence', data.cadence);
        };
        if(('speed' in data) && !isNaN(data.speed) && models.sources.isSource('speed', self.id)) {
            xf.dispatch('speed', data.speed);
        };
    }
}

export { Controllable };
