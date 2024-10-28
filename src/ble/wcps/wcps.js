//
// Wahoo Cycling Power Service
//

import { exists, expect, wait, } from '../../functions.js';
import { Characteristic } from '../characteristic.js';
import { Service } from '../service.js';
import {
    cyclingPowerMeasurement as cyclingPowerMeasurementParser
} from '../cps/cycling-power-measurement.js';
import { control as controlParser} from './control-point.js';
import { uuids,} from '../web-ble.js';
import { ControlMode, } from '../enums.js';
import { userData } from '../userData.js';

function WCPS(args = {}) {

    // config
    const onData = args.onData;
    const txRate = 1000;

    // BluetoothRemoteGATTService{
    //     device: BluetoothDevice,
    //     uuid: String,
    //     isPrimary: Bool,
    // }
    const gattService = expect(
        args.service, 'WCPS needs BluetoothRemoteGATTService!'
    );
    // end config

    // private state
    let controlMode = ControlMode.sim;
    let q = [];
    let msgSeqLock = false;
    // end private state

    // service
    function onControlResponse(msg) {
        let control = service.characteristics.control;

        if(msgSeqLock) {
            if(msg.request === 'setSimMode') {
                if(msg.status === 'success') {
                    msgSeqLock = false;
                    setSimulation(q.pop()?.params ?? {grade: 0});
                    return;
                } else {
                    msgSeqLock = true;
                    setSimMode();
                    return;
                }
            }
        }

        control.release();
    }

    // Void -> Bool
    async function protocol() {
        const control = service.characteristics.control;

        // TODO: return false if any of those fails or
        // returns false and dicsonnect the device
        await requestControl();
        await wait(txRate);
        await setUser();
        await wait(txRate);
        await setWindResistance();
        await wait(txRate);
        await setWheelCircumference();

        return true;
    }

    const spec = {
        measurement: {
            uuid: uuids.cyclingPowerMeasurement,
            notify: {callback: onData, parser: cyclingPowerMeasurementParser},
        },
        control: {
            uuid: uuids.wahooTrainer,
            notify: {callback: onControlResponse, parser: controlParser.response},
        },
    };

    const service = Service({spec, protocol, service: gattService,});
    // end service

    // methods

    // {WindSpeed: Float, Grade: Float, Crr: Float, WindResistance: Float} -> Void
    function setSimulation(parameters = {}) {
        const control = service.characteristics.control;
        if(!exists(control) || !control.isReady() || msgSeqLock) return false;

        const gradeParams = {grade: parameters.grade};

        // if in erg mode -> init sim mode -> send grade
        // else send grade
        if(controlMode === ControlMode.sim) {
            control.write(controlParser.grade.encode(gradeParams));
            control.block();
        } else {
            msgSeqLock = true;
            q.push({command: "setSimulation", params: gradeParams});
            setSimMode();
        }
    }

    // {resistance: Int} -> Void
    function setResistanceTarget(args = {}) {
        const control = service.characteristics.control;
        control.write(controlParser.loadIntensity.encode({
            intensity: (args.resistance / 100),
        }));
        controlMode = ControlMode.resistance;
        // control.block();
    }

    // {power: Int} -> Void
    function setPowerTarget(args = {}) {
        const control = service.characteristics.control;
        control.write(controlParser.setERG.encode(args));
        controlMode = ControlMode.erg;
        // control.block();
    }

    // {weigth: Float, crr: Float, windResistance: Float} -> Void
    function setSimMode(args = {}) {
        const control = service.characteristics.control;
        const weight = userData.userWeight() + userData.bikeWeight();
        control.write(controlParser.sim.encode({
            weight,
            crr: args.crr,
            windResistance: args.windResistance
        }));
        controlMode = ControlMode.sim;
    }

    function setUser() {
        setSimMode();
    }

    async function requestControl() {
        const control = service.characteristics.control;

        const res = await control.write(controlParser.requestControl.encode());

        return res;
    }

    async function setWindResistance() {
        const control = service.characteristics.control;

        const res = await control.write(controlParser.windSpeed.encode({windSpeed: 0}));

        return res;
    }

    async function setWheelCircumference() {
        const control = service.characteristics.control;

        const res = await control.write(
            controlParser.wheelCircumference.encode({
                circumference: controlParser.wheelCircumference.definitions.circumference.default,
            })
        );

        return res;
    }
    // end methods

    return Object.freeze({
        ...service, // WCPS will have all the public methods and properties of Service
        setSimulation,
        setResistanceTarget,
        setPowerTarget,
        setUser,
        setWindResistance,
        setWheelCircumference,
        requestControl,
    });
}

export default WCPS;
