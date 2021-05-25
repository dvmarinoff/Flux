import { nthBitToBool } from '../functions.js';

// HR
function dataPage2(msg) {
    // HR Manufacturer Information (0x02)
    const manufacturerId = msg[5];
    const serialNumber   = (msg[7] << 8) + (msg[6]);
}
function dataPage3(msg) {
    // HR Product Information (0x03)
    const hardware = msg[5];
    const software = msg[6];
    const model    = msg[7];

    return { hardware, software, model };
}
function toBatteryPercentage(x) {
    if(x === 255) return 'not supported';
    if(x > 100)   return '--';
    return x;
}
function dataPage7(msg) {
    // HR Battery Status (0x07)
    const level       = toBatteryPercentage(msg[5]);
    const voltage     = msg[6];
    const descriptive = msg[7];

    return { level, voltage, descriptive };
}

// FE-C
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
function readStatus(status) {
    const powerCalibration = nthBitToBool(status, 0);      // 0: 'not required', 1: 'required', Zero Offset
    const resistanceCalibration = nthBitToBool(status, 1); // 0: 'not required', 1: 'required', Spin Down
    const userConfiguration = nthBitToBool(status, 2);     // 0: 'not required', 1: 'required';

    return { powerCalibration,
             resistanceCalibration,
             userConfiguration };
}
function dataPage25(dataview) {
    // Specific Trainer data, 0x19
    const updateEventCount = dataview.getUint8(5);
    const cadence          = dataview.getUint8(6);  // rpm
    const powerLSB         = dataview.getUint8(9);  // 8bit Power Lsb
    const powerMSB         = dataview.getUint8(10); // 4bit Power Msb + 4bit Status
    const flags            = dataview.getUint8(11);

    const power  = decodePower(powerMSB, powerLSB);
    const status = readStatus(decoupleStatus(powerMSB));

    return { power, cadence, status, page: 25 };
}
function compansateGradeOffset(slope) {
    // slope is coming as -> 1.8% * 100 = 180
    // 0 = -200%, 20000 = 0%, 40000 = 200%
    //
    // compansateGradeOffset(0)   === 20000
    // compansateGradeOffset(1)   === 20100
    // compansateGradeOffset(4.5) === 20450
    // compansateGradeOffset(10)  === 21000
    return 20000 + (slope);
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

const page = {
    // HR
    dataPage2,
    dataPage3,
    dataPage7,
    // FE-C
    dataPage16,
    dataPage25,
    dataPage48,
    dataPage49,
    dataPage51,
};

export { page };
