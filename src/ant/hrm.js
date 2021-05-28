import { xf, first, empty, exists } from '../functions.js';
import { Channel, keys } from './channel.js';
import { HrmChannel } from './hrm-channel.js';
import { message } from './message.js';
import { Device } from './device.js';
import { ant } from './ant.js';
import { models } from '../models/models.js';

class Hrm extends Device {
    async postInit() {
        const self = this;
    }
    defaultName() { return 'ANT+ HRM'; }
    defaultId() { return 'ant:hrm'; }
    defaultChannelClass() { return HrmChannel; }
    defaultDeviceId() {
        return { deviceNumber: 0, deviceType: 120, transType: 0 };
    }
    defaultFilters() {
        return {
            deviceType: 120,
            period: (32280 / 4),
            frequency: 57,
            key: keys.antPlus,
        };
    }
    onData(data) {
        const self = this;
        if(('hr' in data) && !isNaN(data.hr) && models.sources.isSource('heartRate', self.id)) {
            xf.dispatch('heartRate', data.hr);
        }
        if('model' in data) {
            console.log(`:hrm :model ${data.model}`, data);
        }
        if('level' in data) {
            console.log(`:hrm :level ${data.level}`);
        }
    }
}

export { Hrm };
