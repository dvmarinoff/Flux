const nthBit       = (field, bit) => (field >> bit) & 1;
const toBool       = (bit) => !!(bit);
const nthBitToBool = (field, bit) => toBool(nthBit(field, bit));

function xor(view) {
    let cs = 0;
    for (let i=0; i < view.byteLength; i++) {
        cs ^= view.getUint8(i);
    }
    return cs;
}

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
    const equipmentType = dataview.getUint8(5);
    const speed         = dataview.getUint16(8, true);
    const flags         = dataview.getUint8(11);
    // const distance      = dataview.getUint8(7); // 255 rollover
    // const hr            = dataview.getUint8(10); // optional

    return { speed, page: 16 };
}

function dataMsg(dataview) {
    let sync     = dataview.getUint8(0);
    let length   = dataview.getUint8(1);
    let type     = dataview.getUint8(2);
    let channel  = dataview.getUint8(3);
    let dataPage = dataview.getUint8(4);

    if(dataPage === 25) {
        // let { power, cadence, status } = dataPage25(dataview);
        // console.log(`pwr: ${power}, cad: ${cadence}`);
        return dataPage25(dataview);
    }
    if(dataPage === 16) {
        // let { speed } = dataPage16(dataview);
        // console.log(`spd: ${speed}`);
        return dataPage16(dataview);
    }
    return { page: 0 };
}

function dataPage48(resistance) {
    // Data Page 48 (0x30) – Basic Resistance
    let buffer   = new ArrayBuffer(8);
    let view     = new DataView(buffer);
    let dataPage = 48;

    view.setUint8(0, dataPage, true);
    view.setUint8(7, resistance, true);

    return view;
}

function dataPage49(power) {
    // Data Page 49 (0x31) – Target Power
    let buffer   = new ArrayBuffer(8);
    let view     = new DataView(buffer);
    let dataPage = 49;

    view.setUint8(0, dataPage, true);
    view.setUint16(6, power, true);

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
    let buffer   = new ArrayBuffer(8);
    let view     = new DataView(buffer);
    let dataPage = 51;

    let grade = compansateGradeOffset(slope);
    let crr   = 0xFF; // default value

    view.setUint8(0, dataPage, true);
    view.setUint16(5, grade, true);
    view.setUint8(7, crr , true);

    return view;
}

function controlMessage(content, channel = 5) {
    let buffer   = new ArrayBuffer(13);
    let view     = new DataView(buffer);

    const sync    = 164;
    const length  = 9;
    const type    = 79; // Acknowledged 0x4F
    view.setUint8(0, sync,    true);
    view.setUint8(1, length,  true);
    view.setUint8(2, type,    true);
    view.setUint8(3, channel, true);

    let j = 4;
    for(let i = 0; i < length; i++) {
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
    return controlMessage(dataPage49(level, channel));
}
function slopeTargetMsg(slope, channel = 5) {
    return controlMessage(dataPage49(slope, channel));
}

let ant = { dataMsg, powerTargetMsg, resistanceTargetMsg, slopeTargetMsg };

export { ant };
