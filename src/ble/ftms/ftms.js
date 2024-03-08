//
// Fitness Machine Service
//

import { exists, expect, } from '../../functions.js';
import { uuids, } from '../web-ble.js';
import { ControlMode, } from '../enums.js';
import { Service } from '../service.js';
import { Characteristic } from '../characteristic.js';
import { indoorBikeData as indoorBikeDataParser } from './indoor-bike-data.js';
import { control as controlParser } from './control-point.js';

function FTMS(args = {}) {

    // config
    const onData = args.onData;

    // BluetoothRemoteGATTService{
    //     device: BluetoothDevice,
    //     uuid: String,
    //     isPrimary: Bool,
    // }
    const gattService = expect(
        args.service, 'FTMS needs BluetoothRemoteGATTService!'
    );
    // end config

    // Service
    function onControlResponse(msg) {
        const control = service.characteristics.control;
        // it's important to release the control characteristic for writes
        // but that can happen only when a response has been received from
        // the control point characteristic
        control.release();
    }

    async function protocol() {
        const control = service.characteristics.control;

        const res = await control.write(
            controlParser.requestControl.encode()
        );

        return res;
    }

    const spec = {
        measurement: {
            uuid: uuids.indoorBikeData,
            notify: {callback: onData, parser: indoorBikeDataParser},
        },
        control: {
            uuid: uuids.fitnessMachineControlPoint,
            notify: {callback: onControlResponse, parser: controlParser.response},
        },
    };

    const service = Service({service: gattService, spec, protocol, });
    // end sevice

    // methods
    // this service has special write methods

    // {WindSpeed: Float, Grade: Float, Crr: Float, WindResistance: Float} -> Bool
    async function setSimulation(args = {}) {
        const control = service.characteristics.control;

        if(!exists(control) || !control.isReady()) return false;

        control.block();

        const res = await control.write(
            controlParser.simulationParameters.encode(args)
        );

        return res;
    }

    // {power: Int} -> Bool
    async function setPowerTarget(args = {}) {
        const control = service.characteristics.control;

        if(!exists(control)) return false;

        const res = await control.writeWithRetry(
            controlParser.powerTarget.encode(args),
            4, 500,
        );
        return res;
    }

    // {power: Int} -> Bool
    async function setResistanceTarget(args = {}) {
        const control = service.characteristics.control;

        if(!exists(control)) return false;

        const res = await control.writeWithRetry(
            controlParser.resistanceTarget.encode(args),
            4, 500,
        );
        return res;
    }
    // end methods

    // expose public methods and properties
    return Object.freeze({
        ...service, // FTMS will have all the public methods and properties of Service
        protocol,
        setSimulation,
        setPowerTarget,
        setResistanceTarget,
    });
}

export default FTMS;
