//
// Race Controller Service
//

import { expect, f } from '../../functions.js';
import { uuids, } from '../web-ble.js';
import { Service } from '../service.js';
import { Characteristic } from '../characteristic.js';
import { RaceControllerMeasurement } from './race-controller-measurement.js';
// import { Crypto } from './crypto.js';

function Crypto() {
    function createPublicKey() {
    }
    function createSharedKey() {
    }
    function decodePublicKey() {
    }

    return {
        createPublicKey,
        createSharedKey,
        decodePublicKey,
    };
}

function RCS(args = {}) {

    // config
    const onData = args.onData;

    // BluetoothRemoteGATTService{
    //     device: BluetoothDevice,
    //     uuid: String,
    //     isPrimary: Bool,
    // }
    const gattService = expect(
        args.service, 'RCS needs BluetoothRemoteGATTService!'
    );
    // end config

    // service
    const crypto = Crypto();
    const raceControllerMeasurementParser = RaceControllerMeasurement({crypto,});

    async function protocol() {
        const control = service.characteristics.control;

        // Step 1: create key pair
        crypto.createPublicKey();

        // Step 2: send handshake
        await control.write(crypto.handshake());
    }

    function onResponse(msg) {
        console.log(`ble: rcs: on-response: `, msg);
        // Step 3: create shared key
        crypto.createSharedKey(msg);
    }

    function onControl(msg) {
        console.log(`ble: rcs: on-control: `, msg);
    }

    const spec = {
        measurement: {
            uuid: uuids.raceControllerMeasurement,
            notify: {callback: onData, parser: raceControllerMeasurementParser},
        },
        control: {
            uuid: uuids.raceControllerControlPoint,
        },
        response: {
            uuid: uuids.raceControllerResponse,
            notify: {
                callback: onResponse,
                parser: {
                    decode: (dataview) => crypto.decodePublicKey(dataview),
                },
            },
        },
    };

    const service = Service({spec, service: gattService,});
    // end service

    return Object.freeze({
        ...service, // RCS will have all the public methods and properties of Service
        protocol,
    });
}

export default RCS;
