import { xf, first, empty, exists, equals, capitalize } from '../functions.js';
import { Channel, keys } from './channel.js';
import { HrmChannel } from './hrm-channel.js';
import { message } from './message.js';
import { Device } from './device.js';
import { ant } from './ant.js';
import { types } from './types.js';
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
        if(('heartRate' in data) && !isNaN(data.heartRate) && models.sources.isSource('heartRate', self.id)) {
            xf.dispatch('heartRate', data.heartRate);
        }
        // Data Page 2 received
        if('manufacturerId' in data) {
            const info = {
                manufacturer: idToManufacturer(types.manufacturer, data.manufacturerId)
            };

            console.log(info);
            xf.dispatch('ant:hrm:info', info);
        }
        // Data Page 3 received
        if('modelNumber' in data) {
            const info = {
                modelNumber: data.modelNumber,
                softwareVersion: data.softwareVersion,
                hardwareVersion: data.hardwareVersion,
            };
            xf.dispatch('ant:hrm:info', info);
        }
        // Data Page 7 received
        if('batteryLevel' in data) {
            const battery = {
                level: data.batteryLevel,
                voltage: data.batteryVoltage,
                descriptive: data.descriptive
            };

            console.log(battery);
            xf.dispatch('ant:hrm:battery', battery);
        }
    }
}

function idToManufacturer(manufacturers, id) {
    const defaultManufecturer = 'Unknown';
    for(let name in manufacturers) {
        if(equals(id, manufacturers[name])) {
            return capitalize(name);
        }
    }
    return defaultManufecturer;
};

export { Hrm };
