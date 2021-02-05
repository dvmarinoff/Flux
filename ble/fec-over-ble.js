const nthBit       = (field, bit) => (field >> bit) & 1;
const toBool       = (bit) => !!(bit);
const nthBitToBool = (field, bit) => toBool(nthBit(field, bit));

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

function fecMessage(dataview) {
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

export { fecMessage }
