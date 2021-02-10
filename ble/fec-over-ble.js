import { services } from './services.js';
import { nthBitToBool, xor } from '../functions.js';

function decodePower(powerMSB, powerLSB) {
    return ((powerMSB & 0b00001111) << 8) + (powerLSB);
}

function decoupleStatus(powerMSB) {
    return powerMSB >> 4;
}

function decodeStatus(bits) {
    return {
        powerCalibration:      nthBitToBool(bits, 0),
        resistanceCalibration: nthBitToBool(bits, 1),
        userConfiguration:     nthBitToBool(bits, 2)
    };
}

function dataPage25(dataview) {
    // Specific Tr data, 0x19
    const updateEventCount = dataview.getUint8(5);
    const cadence          = dataview.getUint8(6);  // rpm
    const powerLSB         = dataview.getUint8(9);  // 8bit Power Lsb
    const powerMSB         = dataview.getUint8(10); // 4bit Power Msb + 4bit Status
    const flags            = dataview.getUint8(11);

    const power  = decodePower(powerMSB, powerLSB);
    const status = decoupleStatus(powerMSB);

    return { power, cadence, status, page: 25 };
}

function dataPage16(dataview) {
    // General FE data, 0x10
    const resolution    = 0.001;
    const equipmentType = dataview.getUint8(5);
    let   speed         = dataview.getUint16(8, true);
    const flags         = dataview.getUint8(11);
    // const distance      = dataview.getUint8(7); // 255 rollover
    // const hr            = dataview.getUint8(10); // optional
    speed = (speed * resolution * 3.6);
    return { speed, page: 16 };
}

function dataMsg(dataview) {
    let sync     = dataview.getUint8(0);
    let length   = dataview.getUint8(1);
    let type     = dataview.getUint8(2);
    let channel  = dataview.getUint8(3);
    let dataPage = dataview.getUint8(4);

    if(dataPage === 25) {
        return dataPage25(dataview);
    }
    if(dataPage === 16) {
        return dataPage16(dataview);
    }
    return { page: 0 };
}

function dataPage48(resistance) {
    // Data Page 48 (0x30) – Basic Resistance
    const dataPage = 48;
    const unit     = 0.5;
    let buffer     = new ArrayBuffer(8);
    let view       = new DataView(buffer);

    view.setUint8(0, dataPage, true);
    view.setUint8(7, resistance / 0.5, true);

    return view;
}

function dataPage49(power) {
    // Data Page 49 (0x31) – Target Power
    const dataPage = 49;
    const unit     = 0.25;
    let buffer     = new ArrayBuffer(8);
    let view       = new DataView(buffer);

    view.setUint8( 0, dataPage, true);
    view.setUint16(6, power / unit, true);

    return view;
}

function compansateGradeOffset(slope) {
    // slope is coming as -> 1.8% * 100 = 180
    // 0 = -200%, 20000 = 0%, 40000 = 200%
    return 20000 + (slope);
}

// compansateGradeOffset(0)   === 20000
// compansateGradeOffset(1)   === 20100
// compansateGradeOffset(4.5) === 20450
// compansateGradeOffset(10)  === 21000

function dataPage51(slope) {
    // Data Page 51 (0x33) – Track Resistance
    const dataPage  = 51;
    const gradeUnit = 0.01;
    const crrUnit   = 5*Math.pow(10,-5); // 5x10^-5
    const grade     = compansateGradeOffset(slope);
    const crr       = 0xFF; // default value
    let buffer      = new ArrayBuffer(8);
    let view        = new DataView(buffer);

    view.setUint8( 0, dataPage,          true);
    view.setUint16(5, grade, true);
    view.setUint8( 7, crr,               true);

    return view;
}

function controlMessage(content, channel = 5) {
    const sync   = 164;
    const length = 9;
    const type   = 79; // Acknowledged 0x4F
    let buffer   = new ArrayBuffer(13);
    let view     = new DataView(buffer);
    view.setUint8(0, sync,    true);
    view.setUint8(1, length,  true);
    view.setUint8(2, type,    true);
    view.setUint8(3, channel, true);

    let j = 4;
    for(let i = 0; i < 8; i++) {
        view.setUint8(j, content.getUint8(i), true);
        j++;
    }

    const crc = xor(view);
    view.setUint8(12, crc, true);

    return view;
}

function powerTargetMsg(power, channel = 5) {
    return controlMessage(dataPage49(power, channel));
}
function resistanceTargetMsg(level, channel = 5) {
    return controlMessage(dataPage48(level, channel));
}
function slopeTargetMsg(slope, channel = 5) {
    return controlMessage(dataPage51(slope, channel));
}

class FECBLE {
    constructor(args) {
        this.device    = args.device;
        this.info      = {};
        this.features  = {};
        this.status    = {};
        this.onPower   = args.onPower;
        this.onCadence = args.onCadence;
        this.onSpeed   = args.onSpeed;
        this.onConfig  = args.onConfig;
    }

    async connect() {
        const self = this;
        await self.device.notify(services.fecOverBle.uuid,
                                 services.fecOverBle.fec2.uuid,
                                 self.onData.bind(self));

        await self.device.getCharacteristic(services.fecOverBle.uuid,
                                            services.fecOverBle.fec3.uuid);

        const features = {
            readings: ['Power', 'Speed', 'Cadence'],
            targets:  ['Power', 'Resistance', 'Simulation'],
            params: {
                power:      {min: 0, max: 4096, inc: 1},
                resistance: {min: 0, max:  100, inc: 1}
            }
        };

        self.onConfig({ features });
    }
    async setPowerTarget(value) {
        const self   = this;
        const msg    = powerTargetMsg(value);
        const buffer = msg.buffer;
        let res      =
            await self.device.writeCharacteristic(services.fecOverBle.fec3.uuid, buffer);
    }
    async setResistanceTarget(value) {
        const self   = this;
        const msg    = resistanceTargetMsg(value);
        const buffer = msg.buffer;
        let res      =
            await self.device.writeCharacteristic(services.fecOverBle.fec3.uuid, buffer);
    }
    async setSlopeTarget(args) {
        const self   = this;
        const msg    = slopeTargetMsg(args.grade);
        const buffer = msg.buffer;
        let res      =
            await self.device.writeCharacteristic(services.fecOverBle.fec3.uuid, buffer);
    }
    onData(e) {
        const self     = this;
        const dataview = e.target.value;
        const data     = dataMsg(dataview);
        if(data.page === 25) {
            self.onPower(data.power);
            self.onCadence(data.cadence);
        }
        if(data.page === 16) {
            self.onSpeed(data.speed);
        }
        return data;
    }
}

export { FECBLE };
