import { equals, existance, curry2, xor,
         nthBit, nthBitToBool } from '../functions.js';
import { format } from '../utils.js';
import { DataPage } from './common.js';

function DataPage48() {
    // Data Page 48 (0x30) – Basic Resistance
    const number = 48;

    const definitions = {
        resistance: {
            resolution: 0.5, unit: '', min: 0, max: 100, invalid: 0, default: 0
        },
    };

    const data   = DataPage({definitions});
    const length = data.length;

    function encode(args = {}) {
        const resistance = data.encodeField('resistance', args.resistance);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8(0, number,     true);
        view.setUint8(7, resistance, true);

        return view;
    }

    function decode(dataview) {
        const dataPage = dataview.getUint8(0, true);
        const resistance = data.decodeField('resistance', dataview.getUint8(7, true));

        return { dataPage, resistance, };
    }

    return Object.freeze({
        number,
        length,
        definitions,
        encode,
        decode,
    });
}

function DataPage49() {
    // Data Page 49 (0x31) – Target Power
    const number = 49;

    const definitions = {
        power: {
            resolution: 0.25, unit: 'W', min: 0, max: 4000, invalid: 0, default: 0
        },
    };

    const data   = DataPage({definitions});
    const length = data.length;

    function encode(args = {}) {
        const power = data.encodeField('power', args.power);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, number, true);
        view.setUint16(6, power,  true);

        return view;
    }

    function decode(dataview) {
        const dataPage = dataview.getUint8(0, true);
        const power = data.decodeField('power', dataview.getUint16(6, true));

        return { dataPage, power, };
    }

    return Object.freeze({
        number,
        length,
        definitions,
        encode,
        decode,
    });
}

function DataPage50() {
    // Data Page 50 (0x32) – Wind Resistance
    const number = 50;

    let values = {
        frontalArea: {
            mtb: 0.57, commuter: 0.55, roadTouring: 0.40, roadRacing: 0.36,
        },
        drag: {
            mtb: 1.20, commuter: 1.15, roadTouring: 1.0, roadRacing: 0.88,
        },
        airDensity: {
            sea15deg: 1.275,
        },
    };

    const definitions = {
        windResistance: {
            resolution: 0.01, unit: 'kg/m', min: 0, max: 1.86, invalid: 0xFF, default: 0.51
        },
        windSpeed: {
            resolution: 1, unit: 'km/h', min: -127, max: 127, invalid: 0xFF, default: 0, offset: 127
        },
        draftingFactor: {
            resolution: 0.01, unit: '', min: 0, max: 1, invalid: 0xFF, default: 1.0
        },
    };

    const data   = DataPage({definitions});
    const length = data.length;

    function calcWindRasistance(args = {}) {
        // WindResistanceCoefficient = FrontalSurfaceArea * DragCoefficient * AirDensity
        const frontalArea = existance(args.frontalArea, values.frontalArea.roadTouring);
        const drag        = existance(args.drag, values.drag.roadTouring);
        const airDensity  = existance(args.airDensity, values.airDensity.roadTouring);
        return frontalArea * drag * airDensity;
    }

    // 0x0000 -127 | 0x7F (127) 0 | 0xFE (254) 127
    // applyOffset('WindSpeed', 0)  -> 127
    // applyOffset('WindSpeed', 13) -> 140
    // applyOffset('WindSpeed', 20) -> 147

    function encode(args = {}) {
        const windResistance = data.encodeField('windResistance', args.windResistance);
        const windSpeed      = data.encodeField('windSpeed', args.windSpeed, data.applyOffset);
        const draftingFactor = data.encodeField('draftingFactor', args.draftingFactor);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8(0, number,         true);
        view.setUint8(5, windResistance, true);
        view.setUint8(6, windSpeed,      true);
        view.setUint8(7, draftingFactor, true);

        return view;
    }

    function decode(dataview) {
        const dataPage       = dataview.getUint8(0, true);
        const windResistance = data.decodeField('windResistance', dataview.getUint8(5));
        const windSpeed      = data.decodeField('windSpeed', dataview.getUint8(6), data.removeOffset);
        const draftingFactor = data.decodeField('draftingFactor', dataview.getUint8(7));

        return { dataPage, windResistance, windSpeed, draftingFactor, };
    }

    return Object.freeze({
        number,
        length,
        definitions,
        values,
        calcWindRasistance,
        encode,
        decode,
    });
}

function DataPage51(args = {}) {
    // Data Page 51 (0x33) – Track Resistance
    const number = 51;

    const definitions = {
        grade: {
            resolution: 0.01, unit: '%', min: -200, max: 200, invalid: 0xFFFF, default: 0, offset: 200
        },
        crr: {
            resolution: 0.00005, unit: '', min: 0, max: 0.0127, invalid: 0xFF, default: 0.004
        },
    };

    // Simulated Grade (%) = (Raw Grade Value x 0.01%) – 200.00%
    // 0x0000 -200.00% | 0x4E20 (20000) 0.00% | 0x9C40 (40000) +200.00%
    //
    // applyOffset('grade', 0)   -> 20000
    // applyOffset('grade', 1)   -> 20100
    // applyOffset('grade', 4.5) -> 20450

    const data   = DataPage({definitions});
    const length = data.length;

    function encode(args = {}) {
        const grade = data.encodeField('grade', args.grade, data.applyOffset);
        const crr   = data.encodeField('crr', args.crr);

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, number, true);
        view.setUint16(5, grade,  true);
        view.setUint8( 7, crr,    true);

        return view;
    }

    function decode(dataview) {
        const dataPage = dataview.getUint8(0, true);
        const grade    = data.decodeField('grade', dataview.getUint16(5, true), data.removeOffset);
        const crr      = data.decodeField('crr', dataview.getUint8(7, true));

        return { dataPage, grade, crr, };
    }

    return Object.freeze({
        number,
        length,
        definitions,
        encode,
        decode,
    });
}

function DataPage55(args = {}) {
    // Data Page 55 (0x37) – User Configuration
    const number = 55;

    const definitions = {
        userWeight:     {resolution: 0.01, unit: 'kg', min: 0, max: 655.34, invalid: 0xFFFF, default: 75},
        diameterOffset: {resolution: 1,    unit: 'mm', min: 1, max: 10,     invalid: 0xF,    default: 0xF},
        bikeWeight:     {resolution: 0.05, unit: 'kg', min: 0, max: 50,     invalid: 0xFFF,  default: 10},
        wheelDiameter:  {resolution: 0.01, unit: 'm',  min: 0, max: 2.54,   invalid: 0xFF,   default: 0.7},
        gearRatio:      {resolution: 0.03, unit: '',   min: 3, max: 7.65,   invalid: 0x00,   default: 0x00},
    };

    const data   = DataPage({definitions});
    const length = data.length;

    function encode(args = {}) {
        const userWeight     = data.encodeField('userWeight', args.userWeight);
        const diameterOffset = data.encodeField('diameterOffset', args.diameterOffset);
        const bikeWeight     = data.encodeField('bikeWeight', args.bikeWeight);
        const wheelDiameter  = data.encodeField('wheelDiameter', args.wheelDiameter);
        const gearRatio      = data.encodeField('gearRatio', args.gearRatio);

        const bikeWeightMSN = bikeWeight >> 4;
        const bikeWeightLSN = bikeWeight & 0b1111;
        const combined      = (bikeWeightLSN << 4) + diameterOffset; // 0-3 diameter offset, 4-7 bike weight LSN

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, number,        true);
        view.setUint16(1, userWeight,    true);
        view.setUint8( 4, combined,      true);
        view.setUint8( 5, bikeWeightMSN, true);
        view.setUint8( 6, wheelDiameter, true);
        view.setUint8( 7, gearRatio,     true);

        return view;
    }

    function decode(dataview) {
        const dataPage       = dataview.getUint8(0, true);
        const userWeight     = data.decodeField('userWeight', dataview.getUint16(1, true));
        const combined       = dataview.getUint8(4, true);
        const bikeWeightLSN  = (combined >> 4);
        const bikeWeightMSN  = dataview.getUint8(5, true);
        const diameterOffset = data.encodeField('diameterOffset', (combined & 0b1111));
        const bikeWeight     = data.decodeField('bikeWeight', (bikeWeightMSN << 4) + bikeWeightLSN);
        const wheelDiameter  = data.decodeField('wheelDiameter', dataview.getUint8(6, true));
        const gearRatio      = data.decodeField('gearRatio', dataview.getUint8(7, true));

        return {
            dataPage,
            userWeight,
            diameterOffset,
            bikeWeight,
            wheelDiameter: format(wheelDiameter, 10),
            gearRatio,
        };
    }

    return Object.freeze({
        number,
        length,
        definitions,
        encode,
        decode,
    });
}


function FEState() {
    // FEState Field

    function toNumber(state) {
        if(equals(state, 'ASLEEP'))   return 1;
        if(equals(state, 'READY'))    return 2;
        if(equals(state, 'IN_USE'))   return 3;
        if(equals(state, 'FINISHED')) return 4;
        return 2;
    }

    function fromNumber(number) {
        if(equals(number, 1)) return 'ASLEEP';
        if(equals(number, 2)) return 'READY';
        if(equals(number, 3)) return 'IN_USE';
        if(equals(number, 4)) return 'FINISHED';
        return 'READY';
    }

    function encode(args = {}) {
        const defaults = {
            feState: 'READY',
            lapToggle: 0, // change of value indicates new lap
        };

        const feState   = existance(args.feState, defaults.feState);
        const lapToggle = existance(args.lapToggle, defaults.lapToggle);

        return toNumber(feState) + (lapToggle << 2);
    }

    function decode(bitField) {
        const feState   = fromNumber(bitField & 0b11);
        const lapToggle = nthBit(bitField, 2);

        return { feState, lapToggle };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function EquipmentType() {
    // EquipmentType Field

    function fromNumber(number) {
        if(equals(number, 19)) return 'Treadmill';
        if(equals(number, 20)) return 'Elliptical';
        if(equals(number, 22)) return 'Rower';
        if(equals(number, 23)) return 'Climber';
        if(equals(number, 24)) return 'Nordic Skier';
        if(equals(number, 25)) return 'Trainer/Stationary Bike';
        // console.log(`Unknown equipment type number: ${number}`);
        return 'Unset';
    };

    function toNumber(str) {
        if(equals(str, 'Treadmill'))               return 19;
        if(equals(str, 'Elliptical'))              return 20;
        if(equals(str, 'Rower'))                   return 22;
        if(equals(str, 'Climber'))                 return 23;
        if(equals(str, 'Nordic Skier'))            return 24;
        if(equals(str, 'Trainer/Stationary Bike')) return 25;
        console.log('Unknown equipment type name');
        return 25;
    };

    function encode(args = {}) {
        return toNumber(args.equipmentType);
    }

    function decode(value) {
        return fromNumber(value & 0b1111);
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function Capabilities() {
    // Capabilities Field

    function numberToHRDataSource(number) {
        if(equals(number, 0)) return 'Unknown';
        if(equals(number, 1)) return 'ANT+ HRM';
        if(equals(number, 2)) return 'EM HRM';
        if(equals(number, 3)) return 'Hand Contact';
        return 'Unknown';
    }

    function hrDataSourceToNumber(source) {
        if(equals(source, 'Unknown'))      return 0;
        if(equals(source, 'ANT+ HRM'))     return 1;
        if(equals(source, 'EM HRM'))       return 2;
        if(equals(source, 'Hand Contact')) return 3;
        return 0;
    }

    function encode(args = {}) {
        const defaults = {
            hrDataSource: 'Unknown',
            distance: false,
            virtualSpeed: false,
        };

        const hrDataSource = existance(args.hrDataSource, defaults.hrDataSource);
        const distance     = existance(args.distance, defaults.distance);
        const virtualSpeed = existance(args.virtualSpeed, defaults.virtualSpeed);

        return hrDataSourceToNumber(hrDataSource) +
               (+(distance) << 2) +
               (+(virtualSpeed) << 3);
    }

    function decode(bitField) {
        const hrDataSource = numberToHRDataSource(bitField & 0b11);
        const distance     = nthBitToBool(bitField, 2);
        const virtualSpeed = nthBitToBool(bitField, 3);

        return {
            hrDataSource,
            distance,
            virtualSpeed,
        };
    }

    return Object.freeze({
        numberToHRDataSource,
        hrDataSourceToNumber,
        encode,
        decode,
    });
}

function DataPage16() {
    // Data Page 16 (0x10) – General FE Data
    const number = 16;

    const definitions = {
        elapsedTime: {
            resolution: 0.25, unit: 's', min: 0, max: 64, default: 0
        },
        distance: {
            resolution: 1, unit: 'm', min: 0, max: 256, default: 0
        },
        speed: {
            resolution: 0.001, unit: 'm/s', min: 0, max: 65.534, invalid: 0xFFFF, default: 0
        },
        heartRate: {
            resolution: 1, unit: 'bpm', min: 0, max: 254, invalid: 0xFF, default: 0xFF
        },
    };

    const data   = DataPage({definitions});
    const length = data.length;

    const feStateField       = FEState();
    const equipmentTypeField = EquipmentType();
    const capabilitiesField  = Capabilities();

    const encodeSpeed = curry2((prop, value) => {
        return value / definitions[prop].resolution / 3.6;
    });

    const decodeSpeed = curry2((prop, value) => {
        return format(value * definitions[prop].resolution * 3.6, 100);
    });

    function encode(args = {}) {
        const equipmentType = equipmentTypeField.encode(args.equipmentType);
        const elapsedTime   = data.encodeField('elapsedTime', args.elapsedTime);
        const distance      = data.encodeField('distance', args.distance);
        const speed         = data.encodeField('speed', args.speed, encodeSpeed);
        const heartRate     = data.encodeField('heartRate', args.heartRate);
        const capabilities  = capabilitiesField.encode(args.capabilities);
        const feState       = feStateField.encode(args.feState);

        const combined = (feState << 4) + capabilities;

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, number,        true);
        view.setUint8( 1, equipmentType, true);
        view.setUint8( 2, elapsedTime,   true);
        view.setUint8( 3, distance,      true);
        view.setUint16(4, speed,         true);
        view.setUint8( 6, heartRate,     true);
        view.setUint8( 7, combined,      true);

        return view;
    }

    function decode(dataview) {
        const dataPage      = dataview.getUint8(0, true);
        const equipmentType = equipmentTypeField.decode('equipmentType', dataview.getUint8(1, true));
        const elapsedTime   = data.decodeField('elapsedTime', dataview.getUint8(2, true));
        const distance      = data.decodeField('distance', dataview.getUint8(3, true));
        const speed         = data.decodeField('speed', dataview.getUint16(4, true), decodeSpeed);
        const heartRate     = data.decodeField('heartRate', dataview.getUint8(6, true));
        const combined      = dataview.getUint8(7, true);

        const capabilities  = capabilitiesField.decode(combined & 0b1111);
        const feState       = feStateField.decode(combined >> 4);

        return {
            dataPage,
            equipmentType,
            elapsedTime,
            speed,
            heartRate,
            capabilities,
            feState
        };
    }

    return Object.freeze({
        number,
        length,
        definitions,
        encode,
        decode
    });
}

function TrainerStatus() {
    // TrainerStatus Field

    function encode(status = {}) {
        return  (existance(status.power, 0)) +
               ((existance(status.resistance, 0)) << 1) +
               ((existance(status.user, 0)) << 2);
    }

    function decode(bitField = 0) {
        return {
            power:      nthBit(bitField, 0), // is it required
            resistance: nthBit(bitField, 1), // is it required
            user:       nthBit(bitField, 2), // is it required
        };
    }

    return Object.freeze({
        encode,
        decode
    });
}

function TrainerFlags() {
    // TrainerFlags Field, for target power mode

    function numberToLimits(number) {
        if(equals(number, 0)) return 'ok';
        if(equals(number, 1)) return 'low';
        if(equals(number, 2)) return 'high';
        // max or min target power limit reached
        if(equals(number, 3)) return 'undetermined';
        return 'ok';
    }

    function limitsToNumber(limits) {
        if(equals(limits, 'ok'))           return 0;
        if(equals(limits, 'low'))          return 1;
        if(equals(limits, 'high'))         return 2;
        // max or min target power limit reached
        if(equals(limits, 'undetermined')) return 3;
        return 'ok';
    }

    function encode(args = {}) {
        return limitsToNumber(args.limits);
    }

    function decode(bitField) {
        const limits = numberToLimits(bitField & 0b11);

        return {
            limits,
        };
    }

    return Object.freeze({
        encode,
        decode
    });
}

function DataPage25(args = {}) {
    // Data Page 25 (0x19) – Specific Trainer
    const number = 25;

    const definitions = {
        cadence: {
            resolution: 1, unit: 'rpm', min: 0, max: 254, invalid: 0xFF, default: 0,
        },
        accumulatedPower: {
            resolution: 1, unit: 'W', min: 0, max: 65536, default: 0,
        },
        power: {
            resolution: 1, unit: 'W', min: 0, max: 4094, invalid: 0xFFF, default: 0,
        },
    };

    const data   = DataPage({definitions});
    const length = data.length;

    const feStateField       = FEState();
    const trainerStatusField = TrainerStatus();
    const trainerFlagsField  = TrainerFlags();

    function encode(args = {}) {
        const eventCount       = args.eventCount || 0;
        const cadence          = data.encodeField('cadence', args.cadence);
        const accumulatedPower = data.encodeField('accumulatedPower', args.accumulatedPower);
        const power            = data.encodeField('power', args.power);
        const status           = trainerStatusField.encode(args.status);
        const feState          = feStateField.encode(args.feState);
        const flags            = trainerFlagsField.encode(args.flags);

        const combined = (status << 12) + power;

        const combined2 = (feState << 4) + flags;

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, number,           true);
        view.setUint8( 1, eventCount,       true);
        view.setUint8( 2, cadence,          true);
        view.setUint16(3, accumulatedPower, true);
        view.setUint16(5, combined,         true);
        view.setUint8( 7, combined2,        true);

        return view;
    }

    function decode(dataview) {
        const dataPage         = dataview.getUint8(0, true);
        const eventCount       = dataview.getUint8(1, true);
        const cadence          = data.decodeField('cadence', dataview.getUint8(2, true));
        const accumulatedPower = data.decodeField('accumulatedPower', dataview.getUint16(3, true));
        const powerLSB         = dataview.getUint8(5, true);
        const combined         = dataview.getUint8(6, true);
        const combined2        = dataview.getUint8(7, true);

        const power  = ((combined & 0b1111) << 8) + powerLSB;
        const status = trainerStatusField.decode(combined >> 4);

        const flags   = trainerFlagsField.decode(combined2 & 0b1111);
        const feState = feStateField.decode(combined2 >> 4);

        return {
            dataPage,
            eventCount,
            cadence,
            accumulatedPower,
            power,
            status,
            flags,
            feState,
        };
    }

    return Object.freeze({
        number,
        length,
        definitions,
        encode,
        decode,
    });
}

function DataPage26(args = {}) {
    // Data Page 26 (0x1A) – Specific Trainer Torque Data
    const number = 26;

    const definitions = {
        grade: {
            resolution: 0.01, unit: '%', min: 0, max: 400, invalid: 0xFFFF, default: 0, offset: 200
        },
    };

    const data   = DataPage({definitions});
    const length = data.length;

    const feStateField = FEState();

    function encode(args = {}) {
        const eventCount = args.eventCount || 0;
        const wheelTicks = args.wheelTicks || 0;
        const wheelPeriod = args.wheelPeriod || 0;
        const accumulatedTorque = args.accumulatedTorque || 0;
        const capabilitiesReserved = 0x0;
        const feState = feStateField.encode(args.feState);
        const combined = (feState << 4) + capabilitiesReserved;

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8( 0, number,            true);
        view.setUint8( 1, eventCount,        true);
        view.setUint8( 2, wheelTicks,        true);
        view.setUint16(3, wheelPeriod,       true);
        view.setUint16(5, accumulatedTorque, true);
        view.setUint8( 7, combined,          true);

        return view;
    }

    function decode(dataview) {
        const dataPage          = dataview.getUint8( 0, true);
        const eventCount        = dataview.getUint8( 1, true);
        const wheelTicks        = dataview.getUint8( 2, true);
        const wheelPeriod       = dataview.getUint16(3, true);
        const accumulatedTorque = dataview.getUint16(5, true);
        const combined          = dataview.getUint8( 7, true);
        const feState           = feStateField.decode(combined >> 4);

        return {
            dataPage,
            eventCount,
            wheelTicks,
            wheelPeriod,
            accumulatedTorque,
            feState,
        };
    }

    return Object.freeze({
        number,
        length,
        definitions,
        encode,
        decode,
    });
}

function FEC() {
    const pages = {
        dataPage48: DataPage48(),
        dataPage49: DataPage49(),
        dataPage50: DataPage50(),
        dataPage51: DataPage51(),
        dataPage55: DataPage55(),

        dataPage16: DataPage16(),
        dataPage25: DataPage25(),
        // dataPage26: DataPage26(),
    };

    function decode(dataview) {
        const dataPage = dataview.getUint8(0, true);
        if(equals(dataPage, 48)) return pages.dataPage48.decode(dataview);
        if(equals(dataPage, 49)) return pages.dataPage49.decode(dataview);
        if(equals(dataPage, 50)) return pages.dataPage50.decode(dataview);
        if(equals(dataPage, 51)) return pages.dataPage51.decode(dataview);
        if(equals(dataPage, 55)) return pages.dataPage55.decode(dataview);
        if(equals(dataPage, 16)) return pages.dataPage16.decode(dataview);
        if(equals(dataPage, 25)) return pages.dataPage25.decode(dataview);
        return dataview;
    }

    return {
        ...pages,
        decode,
    };
}

const fec = FEC();

export { fec };
