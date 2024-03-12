//
// Core Temp Service
//

import { expect, } from '../../functions.js';
import { uuids, } from '../web-ble.js';
import { Service } from '../service.js';
import { Characteristic } from '../characteristic.js';
import { coreBodyTemperature as coreBodyTemperatureParser } from './core-body-temperature.js';

function CoreTemp(args = {}) {

    // config
    const onData = args.onData;

    // BluetoothRemoteGATTService{
    //     device: BluetoothDevice,
    //     uuid: String,
    //     isPrimary: Bool,
    // }
    const gattService = expect(
        args.service, 'CoreTemp needs BluetoothRemoteGATTService!'
    );
    // end config

    // service
    const spec = {
        measurement: {
            uuid: uuids.coreBodyTemp,
            notify: {callback: onData, parser: coreBodyTemperatureParser},
        },
    };

    const service = Service({spec, service: gattService,});
    // end service

    return Object.freeze({
        ...service, // CoreTemp will have all the public methods and properties of Service
    });
}

export default CoreTemp;

