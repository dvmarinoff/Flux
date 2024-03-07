//
// Cycling Power Service
//

import { expect, f } from '../../functions.js';
import { uuids, } from '../web-ble.js';
import { Service } from '../service.js';
import { Characteristic } from '../characteristic.js';
import { cyclingPowerMeasurement as cyclingPowerMeasurementParser } from './cycling-power-measurement.js';

function CPS(args = {}) {
    // config
    // BluetoothRemoteGATTService{
    //     device: BluetoothDevice,
    //     uuid: String,
    //     isPrimary: Bool,
    // }
    const gattService = expect(
        args.service, 'CPS needs BluetoothRemoteGATTService!'
    );

    // {} -> Void
    const onData = args.onData;
    // end config

    // Service
    const spec = {
        measurement: {
            uuid: uuids.cyclingPowerMeasurement,
            notify: {callback: onData, parser: cyclingPowerMeasurementParser},
        },
    };
    const service = Service({service: gattService, spec,});

    return Object.freeze({
        ...service, // CPS will have all the public methods and properties of Service
    });
}

export default CPS;
