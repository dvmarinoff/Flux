//
// FEC3 Custom characteristic
//

import { getBits, dataviewToArray, print, } from '../../functions.js';

function applyDefinition(field, value) {
    const _value = value ?? field.default;
    const _resolution = field.resolution ?? 1;
    const _offset = field.offset ?? 0;
    return (_value / _resolution) + (_offset / _resolution);
}

function removeDefinition(field, value) {
    const _value = value ?? field.default;
    const _resolution = field.resolution ?? 1;
    const _offset = field.offset ?? 0;
    return (_value - (_offset * _resolution)) * _resolution;
}

function DataPage48() {
    // Data Page 48 (0x30) – Basic Resistance
    const number = 48;
    const length = 8;
    const architecture = true;

    const fields = {
        dataPage:  { size: 1, type: 'Uint8',  default: 48, },
        resistance: {
            size: 1, type: 'Uint8', default: 0, resolution: 0.5, unit: '',
        },
    };

    function encode(dataview, start = 4, payload = {}) {
        const resistance = applyDefinition(fields.resistance, payload?.resistance);

        dataview.setUint8(start+0, number,     architecture);
        dataview.setUint8(start+7, resistance, architecture);

        print.log(`:tx :fec :basic-resistance ${payload?.resistance} ${resistance}`);

        return dataview;
    }

    return Object.freeze({
        number,
        length,
        fields,
        encode,
    });
}

function DataPage50() {
    // DataPage 50 (0x32) - Wind Resistance
    const number = 50;
    const length = 8;
    const architecture = true;

    const fields = {
        dataPage:       {size: 1, type: 'Uint8', default: 50,},
        reserved1:      {size: 1, type: 'Uint8', default: 0,},
        reserved2:      {size: 1, type: 'Uint8', default: 0,},
        reserved3:      {size: 1, type: 'Uint8', default: 0,},
        reserved4:      {size: 1, type: 'Uint8', default: 0,},
        windResistance: {size: 1, type: 'Uint8', default: 0.51, resolution: 0.01,},
        windSpeed:      {size: 1, type: 'Uint8', default: 0, resolution: 1, offset: 127},
        draftingFactor: {size: 1, type: 'Uint8', default: 1.0, resolution: 0.01,},
    };

    function encode(dataview, start = 4, payload = {}) {
        const dataPage = fields.dataPage.default;
        const windResistance = applyDefinition(fields.windResistance, payload?.windResistance);
        const windSpeed = applyDefinition(fields.windSpeed, payload?.windSpeed);
        const draftingFactor = applyDefinition(fields.draftingFactor, payload?.draftingFactor);

        print.log(`:tx :fec :wind-resistance :windResistance ${windResistance} windSpeed: ${windSpeed} :draftingFactor ${draftingFactor}`);

        dataview.setUint8(start+0, dataPage, architecture);
        dataview.setUint8(start+5, windResistance, architecture);
        dataview.setUint8(start+6, windSpeed, architecture);
        dataview.setUint8(start+7, draftingFactor, architecture);

        return dataview;
    }

    return Object.freeze({
        number,
        encode,
    });
}

function DataPage51() {
    // DataPage 51 (0x33) - Track Resistance
    const number = 51;
    const length = 8;
    const architecture = true;

    const fields = {
        dataPage:  {size: 1, type: 'Uint8',  default: 51,},
        reserved1: {size: 1, type: 'Uint8',  default: 0,},
        reserved2: {size: 1, type: 'Uint8',  default: 0,},
        reserved3: {size: 1, type: 'Uint8',  default: 0,},
        reserved4: {size: 1, type: 'Uint8',  default: 0,},
        grade:     {size: 2, type: 'Uint16', default: 0, resolution: 0.01, offset: 200},
        crr:       {size: 1, type: 'Uint8',  default: 0.004, resolution: 0.00005,},
    };

    function encode(dataview, start = 4, payload = {}) {
        const dataPage = fields.dataPage.default;
        const grade = applyDefinition(fields.grade, payload?.grade);
        const crr = applyDefinition(fields.crr, payload?.crr);

        print.log(`:tx :fec :track-resistance :grade ${payload?.grade} :crr ${crr}`);

        dataview.setUint8(start+0, dataPage, architecture);
        dataview.setUint16(start+5, grade, architecture);
        dataview.setUint8(start+7, crr, architecture);

        return dataview;
    }

    return Object.freeze({
        number,
        fields,
        encode,
    });
}

function DataPage49() {
    // Data Page 49 (0x31) – Target Power
    const number = 49;
    const length = 8;
    const architecture = true;

    const fields = {
        dataPage:  {size: 1, type: 'Uint8',  default: 49,},
        power: {
            size: 1, type: 'Uint8', resolution: 0.25, unit: 'W', min: 0, max: 4000, invalid: 0, default: 0
        },
    };

    function encode(dataview, start = 4, payload = {}) {
        const dataPage = fields.dataPage.default;
        const power = applyDefinition(fields.power, payload?.power);

        dataview.setUint8( start+0, dataPage, architecture);
        dataview.setUint16(start+6, power,  architecture);

        print.log(`:tx :fec :target-power :power ${payload?.power}`);

        return dataview;
    }

    return Object.freeze({
        number,
        length,
        fields,
        encode,
    });
}

function DataPage55() {
    // DataPage 55 (0x37) - User Configuration
    const number = 55;
    const length = 8;
    const architecture = true;

    const fields = {
        dataPage:       {size: 1,   type: 'Uint8',    default: 55,},
        userWeight:     {size: 2,   type: 'Uint16',   default: 75,  resolution: 0.01},
        reserved:       {size: 1,   type: 'Reserved', default: 0,},
        diameterOffset: {size: 0.5, type: 'Uint4',    default: 0xF,},
        bikeWeight:     {size: 1.5, type: 'Uint12',   default: 8,   resolution: 0.05},
        wheelDiameter:  {size: 1,   type: 'Uint4',    default: 0.7, resolution: 0.01,},
        gearRatio:      {size: 1,   type: 'Uint8',    default: 0,   resolution: 0.03,},
    };

    function encode(dataview, start = 4, payload = {}) {
        const dataPage = fields.dataPage.default;
        const userWeight = applyDefinition(
            fields.userWeight,
            payload?.userWeight
        );
        const diameterOffset = applyDefinition(
            fields.diameterOffset,
            payload?.diameterOffset
        );
        const bikeWeight = applyDefinition(
            fields.bikeWeight,
            payload?.bikeWeight
        );
        const wheelDiameter = applyDefinition(
            fields.wheelDiameter,
            payload?.wheelDiameter
        );
        const gearRatio = applyDefinition(
            fields.gearRatio,
            payload?.gearRatio
        );

        const combined1 = (getBits(0, 4, bikeWeight) << 4) + diameterOffset;
        const bikeWeightMSB = bikeWeight >> 4;

        print.log(`:tx :fec :user-configuration :userWeight ${userWeight} :bikeWeight ${bikeWeight}`);

        dataview.setUint8( start+0, dataPage, architecture);
        dataview.setUint16(start+1, userWeight, architecture);
        dataview.setUint8( start+4, combined1, architecture);
        dataview.setUint8( start+5, bikeWeightMSB, architecture);
        dataview.setUint8( start+6, wheelDiameter, architecture);
        dataview.setUint8( start+7, gearRatio, architecture);

        return dataview;
    }

    return Object.freeze({
        number,
        fields,
        encode,
    });
}

function DataPage252() {
    const number = 252;
    const length = 8;
    const architecture = true;

    // [0xA4, 0x09, 0x4F, 0x05, 0xFC, 0x00, 0,0, ]

    const RoadSurface = {
        simulationOff: 0,
        concretePlates: 1,
        cattleGrid: 2,
        cobblestonesHard: 3,
        cobblestonesSoft: 4,
        brickRoad: 5,
        offRoad: 6,
        gravel: 7,
        ice: 8,
        woodenBoards: 9,
    };

    const fields = {
        dataPage:             {size: 1,   type: 'Uint8', default: 252,},
        reserved1:            {size: 1,   type: 'Uint8', default: 0,},
        isokineticMode:       {size: 1,   type: 'Uint8', default: 0,},
        isokineticSpeed:      {size: 1,   type: 'Uint8', default: 0,},
        reserved2:            {size: 1,   type: 'Uint8', default: 0,},
        roadSurfaceValue:     {size: 1,   type: 'Uint8', default: RoadSurface.simulationOff,},
        roadSurfaceIntensity: {size: 1,   type: 'Uint8', default: 255,},
        reserved3:            {size: 1,   type: 'Uint8', default: 0,},
    };

    function encode(dataview, start = 4, payload = {}) {
        const roadSurfaceValue = applyDefinition(
            fields.roadSurfaceValue,
            payload?.roadSurfaceValue
        );
        const roadSurfaceIntensity = applyDefinition(
            fields.roadSurfaceIntensity,
            payload?.roadSurfaceIntensity
        );

        dataview.setUint8( start+0, fields.dataPage.default, architecture);
        dataview.setUint8( start+1, fields.reserved1.default, architecture);
        dataview.setUint8( start+2, fields.isokineticMode.default, architecture);
        dataview.setUint8( start+3, fields.isokineticSpeed.default, architecture);
        dataview.setUint8( start+4, fields.reserved2.default, architecture);
        dataview.setUint8( start+5, roadSurfaceValue, architecture);
        dataview.setUint8( start+6, roadSurfaceIntensity, architecture);
        dataview.setUint8( start+7, fields.reserved3.default, architecture);

        return dataview;
    }

    return Object.freeze({
        number,
        fields,
        RoadSurface,
        encode,
    });
}

function DataPage16() {
    // DataPage 16 (0x10) - General FE Data
    const number = 16;
    const length = 8;
    const architecture = true;

    // elapsedTime
    // distance
    // speed
    // heartRate
    function decode(dataview, start = 4, end = length) {
        return {
            speed: 0,
            heartRate: 0,
        };
    }

    return Object.freeze({
        number,
        decode,
    });
}

function DataPage25() {
    // DataPage 25 (0x19) - Trainer Specific
    const number = 25;
    const length = 8;
    const architecture = true;

    const fields = {
        dataPage:         {size: 1,   type: 'Uint8', default: 25},
        eventCount:       {size: 1,   type: 'Uint8', default: 0},
        cadence:          {size: 1,   type: 'Uint8', default: 0},
        accumulatedPower: {size: 2,   type: 'Uint16', default: 0},
        power:            {size: 1.5, type: 'Uint12', default: 0},
        status:           {size: 0.5, type: 'Uint4',},
    };

    function decode(dataview, start = 4, end = length) {
        const dataPage  = dataview.getUint8( start+0, architecture);
        const cadence   = dataview.getUint8( start+2, architecture) ?? 0;
        const combined1 = dataview.getUint16(start+5, architecture);
        const power     = getBits(0, 12, combined1) ?? 0;

        return {
            dataPage,
            cadence,
            power,
        };
    }

    return Object.freeze({
        number,
        decode,
    });
}

function DataPage71() {
    // DataPage 71 (0x47) - Command Status
    const number = 71;
    const length = 8;
    const architecture = true;

    function decode(dataview, start = 4, end = length) {
        const dataPage       = dataview.getUint8(start+0, architecture);
        const lastCommandId  = dataview.getUint8(start+1, architecture);
        const sequenceNumber = dataview.getUint8(start+2, architecture);
        const status         = dataview.getUint8(start+3, architecture);
        const data1          = dataview.getUint8(start+4, architecture);
        const data2          = dataview.getUint8(start+5, architecture);
        const data3          = dataview.getUint8(start+6, architecture);
        const data4          = dataview.getUint8(start+7, architecture);

        print.log(`:rx :fec :command-status ${status} sequence: ${sequenceNumber} :id ${lastCommandId}`);

        return {
            dataPage,
            lastCommandId,
            sequenceNumber,
            status,
            data1,
            data2,
            data3,
            data4,
        };
    }

    return Object.freeze({
        number,
        decode,
    });
}

const messages = {
    // fec3
    dataPage48: DataPage48(),
    dataPage49: DataPage49(),
    dataPage50: DataPage50(),
    dataPage51: DataPage51(),
    dataPage55: DataPage55(),
    dataPage252: DataPage252(),

    // fec2
    dataPage16: DataPage16(),
    dataPage25: DataPage25(),
    dataPage71: DataPage71()
};

export default messages;

