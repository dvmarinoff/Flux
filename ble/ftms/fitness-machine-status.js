import { hex } from '../../functions.js';

const fitnessMachineStatusCodes = {
    '0x00': {param: false, msg: 'Reserved for Future Use'},
    '0x01': {param: false, msg: 'Reset'},
    '0x02': {param: false, msg: 'Fitness Machine Stopped or Paused by the User'},
    '0x03': {param: false, msg: 'Fitness Machine Stopped by Safety Key'},
    '0x04': {param: false, msg: 'Fitness Machine Started or Resumed by the User'},
    '0x07': {param: {resistance: 'Uint8'},
             msg: 'Target Resistance Level Changed'},
    '0x08': {param: {power: 'Int16'},
             msg: 'Target Power Changed'},
    '0x12': {param: {wind: 'Int16', grade: 'Int16', crr: 'Uint8', cw: 'Uint8'},
             msg: 'Indoor Bike Simulation Parameters Changed'},
    '0x14': {param: '', msg: 'Spin Down Status'},
    '0xFF': {param: '', msg: 'Control Permission Lost'},
};

function dataviewToFitnessMachineStatus(dataview) {
    let status = dataview.getUint8(0, dataview, true);
    let msg    = fitnessMachineStatusCodes[hex(status)].msg;

    return {status, msg};
}

export { dataviewToFitnessMachineStatus };
