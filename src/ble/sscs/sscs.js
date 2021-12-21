import { uuids } from '../uuids.js';

import { equals, exists, existance, first } from '../../functions.js';

class SpeedCadenceService {
    uuid = uuids.speedCadence;

    constructor(args = {}) {
        this.ble       = existance(args.ble);
        this.device    = existance(args.device);
        this.server    = existance(args.server);
        this.onData    = existance(args.onData,    ((x) => x));
        this.onStatus  = existance(args.onStatus,  this.defaultOnStatus);
        this.onControl = existance(args.onControl, this.defaultOnControlPoint);

        this.characteristics = {
            measurement: {
                uuid: uuids.speedCadenceMeasurement,
                supported: false,
                characteristic: undefined,
            },
            feature: {
                uuid: uuids.speedCadenceFeature,
                supported: false,
                characteristic: undefined,
            },
            sensorLocation: {
                uuid: uuids.sensorLocation,
                supported: false,
                characteristic: undefined,
            },
            speedCadenceControlPoint: {
                uuid: uuids.speedCadenceControlPoint,
                supported: false,
                characteristic: undefined,
            },
        };
    }
}
