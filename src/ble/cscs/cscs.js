//
// Cycling Speec and Cadence Service
//

import { expect, f } from '../../functions.js';
import { uuids, } from '../web-ble.js';
import { Service } from '../service.js';
import { Characteristic } from '../characteristic.js';
import { cscMeasurement as cscMeasurementParser } from './cycling-speed-cadence-measurement.js';

function CSCS(args = {}) {

    // config

    // BluetoothRemoteGATTService{
    //     device: BluetoothDevice,
    //     uuid: String,
    //     isPrimary: Bool,
    // }
    const gattService = expect(
        args.service, 'HRS needs BluetoothRemoteGATTService!'
    );

    const onData = args.onData;
    // end config

    // Service
    const spec = {
        measurement: {
            uuid: uuids.speedCadenceMeasurement,
            notify: {callback: onData, parser: cscMeasurementParser},
        },
    };
    const service = Service({service: gattService, spec,});

    return Object.freeze({
        ...service,
    });
}

export default CSCS;
