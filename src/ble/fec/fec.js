//
// FEC over BLE
//
import { exists, expect, compose2, wait } from '../../functions.js';
import { uuids, } from '../web-ble.js';
import { ControlMode, } from '../enums.js';
import { Service } from '../service.js';
import { Characteristic } from '../characteristic.js';
import { message as fecParser } from './message.js';
import messages from './messages.js';
import { userData } from '../userData.js';

function FEC(args = {}) {

    // config
    const onData = args.onData;
    const txRate = 1000;

    // BluetoothRemoteGATTService{
    //     device: BluetoothDevice,
    //     uuid: String,
    //     isPrimary: Bool,
    // }
    const gattService = expect(
        args.service, 'FEC needs BluetoothRemoteGATTService!'
    );
    // end config

    //
    // service
    //

    // takes decoded msg from onData and returns it,
    // while releasing the block on write if the received message is a response message
    // that's needed because all messages are being received on the same characteristic
    //
    // ANTMessageData{} -> ANTMessageData{}
    function onFEC2(msg) {
        if(msg.dataPage === messages.dataPage71.number) {
            let control = service.characteristics.control;
            control.release();
        }
        return msg;
    }

    function onControlResponse(msg) {
        console.log(`ble: fec: on-control-response: `, msg);
        let control = service.characteristics.control;
        control.release();
    }

    async function protocol() {
        let control = service.characteristics.control;

        await wait(txRate);
        console.log(`${userData.userWeight()} ${userData.bikeWeight()}`);
        let resUserData = await setUserData({
            userWeight: userData.userWeight(),
            bikeWeight: userData.bikeWeight()
        });
        await wait(txRate);
        let resWind = await setWindResistance();

        return resUserData && resWind;
    }

    const spec = {
        measurement: {
            uuid: uuids.fec2,
            notify: {callback: compose2(onData, onFEC2), parser: fecParser},
        },
        control: {
            uuid: uuids.fec3,
        },
    };

    const service = Service({spec, protocol, service: gattService,});
    // end service

    //
    // methods
    //

    // {power: Int} -> Bool
    async function setPowerTarget(args = {}) {
        let control = service.characteristics.control;

        if(!exists(control)) return false;

        const res = await control.writeWithRetry(
            fecParser.encode({dataPage: 49, payload: args}),
            4, 500,
        );
        return res;
    }

    // {resistance: Int} -> Bool
    async function setResistanceTarget(args = {}) {
        let control = service.characteristics.control;
        if(!exists(control)) return false;

        let res = await control.write(
            fecParser.encode({dataPage: 48, payload: args}),
        );

        return res;
    }

    // {WindSpeed: Float, Grade: Float, Crr: Float, WindResistance: Float} -> Bool
    async function setSimulation(args = {}) {
        let control = service.characteristics.control;

        if(!exists(control) || !control.isReady()) return false;

        control.block();

        let res = await control.write(
            fecParser.encode({dataPage: 51, payload: args}),
        );

        return res;
    }


    // {userWeight: Int, bikeWeight: Int}
    async function setUserData(args = {}) {
        const control = service.characteristics.control;
        // TODO: validate the input
        const data = {
            userWeight: args.userWeight ?? userData.userWeight(),
            bikeWeight: args.bikeWeight ?? userData.bikeWeight()
        };
        const res = await control.write(
            fecParser.encode({dataPage: 55, payload: data})
        );
        return res;
    }

    // {userWeight: Int, bikeWeight: Int}
    async function setWindResistance(args = {}) {
        const control = service.characteristics.control;
        const res = await control.write(fecParser.encode({dataPage: 50, payload: args}));
        return res;
    }

    // {userWeight: Int, bikeWeight: Int}
    async function setRoadFeel(args = {}) {
        const control = service.characteristics.control;
        const res = await control.write(fecParser.encode({dataPage: 252, payload: args}));
        return res;
    }

    return Object.freeze({
        ...service, // FEC will have all the public methods and properties of Service
        protocol,
        setPowerTarget,
        setResistanceTarget,
        setSimulation,
        setUserData,
        setWindResistance,
        setRoadFeel,
    });
}

export default FEC;

