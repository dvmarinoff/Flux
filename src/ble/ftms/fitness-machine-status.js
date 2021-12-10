//
// 4.17 Fitness Machine Status (characteristic)
//

import { equals, exists, existance } from '../../functions.js';
import { hex } from '../../utils.js';

import { control } from './control-point.js';



const logs = true;

function log(msg) {
    if(logs) {
        console.log(msg);
    }
}

const fitnessMachineStatusOpCodes = {
    '0x00': {param: false, name: 'Reserved for Future Use'},
    '0x01': {param: false, name: 'Reset'},
    '0x02': {param: false, name: 'Fitness Machine Stopped or Paused by the User'},
    '0x03': {param: false, name: 'Fitness Machine Stopped by Safety Key'},
    '0x04': {param: false, name: 'Fitness Machine Started or Resumed by the User'},
    '0x05': {param: true,  name: 'Target Speed Changed'},
    '0x06': {param: true,  name: 'Target Incline Changed'},
    '0x07': {param: true,
             decoder: control.resistanceTarget.decode,
             name: 'Target Resistance Level Changed'},
    '0x08': {param: true,
             decoder: control.powerTarget.decode,
             name: 'Target Power Changed'},
    '0x09': {param: true,  name: 'Target Heart Rate Changed'},
    '0x0A': {param: false, name: 'Targeted Expended Energy Changed'},
    '0x0B': {param: false, name: 'Targeted Number of Steps Changed'},
    '0x0C': {param: false, name: 'Targeted Number of Strides Changed'},
    '0x0D': {param: true,  name: 'Target Distance Changed'},
    '0x0E': {param: false, name: 'Targeted Training Time Changed'},
    '0x0F': {param: false, name: 'Targeted Time in Two Heart Rate Zones Changed'},
    '0x0F': {param: false, name: 'Targeted Time in Three Heart Rate Zones Changed'},
    '0x0F': {param: false, name: 'Targeted Time in Five Heart Rate Zones Changed'},
    '0x12': {param: true,
             decoder: control.simulationParameters.decode,
             name: 'Indoor Bike Simulation Parameters Changed'},
    '0x13': {param: true,
             decoder: control.wheelCircumference.decode,
             name: 'Wheel Circumference Changed'},
    '0x14': {param: true,  name: 'Spin Down Status'},
    '0x15': {param: true,  name: 'Targeted Cadence Changed'},
    '0xFF': {param: false, name: 'Control Permission Lost'},
};

const spinDownStatusValue = {
    '0x00': 'Reserved for Future Use',
    '0x01': 'Spin Down Requested',
    '0x02': 'Success',
    '0x03': 'Error',
    '0x04': 'Stop Pedaling'
};

function FitnessMachineStatus() {

    const unknownOperation = {
        param: false,
        decoder: undefined,
        name: 'Unknown',
    };

    function encode() {}

    function decodeParam(operation, dataview) {
        if(exists(operation.decoder)) {
            return operation.decoder(dataview);
        }
        return '';
    }

    function decode(dataview) {
        const opCode = dataview.getUint8(0, dataview, true);

        const operation = existance(fitnessMachineStatusOpCodes[hex(opCode)],
                                    unknownOperation);

        let value;
        if(operation.param) {
            value = decodeParam(operation, dataview);
        }

        log(`:rx :ftms :status '${operation.name}' ${JSON.stringify(value)}`);

        return {
            operation: operation.name,
            value
        };
    }

    function toString(decoded) {
        const str = `:operation '${decoded.operation}' :value ${existance(decoded.value, ':na')}`;

        return str;
    }

    return Object.freeze({
        encode,
        decode,
    });
}

const status = FitnessMachineStatus();

export { status };
