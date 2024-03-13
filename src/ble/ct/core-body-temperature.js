//
// Core Body Temperature characteristic
//

const skinTemperaturePresent = (flags) => ((flags >> 0) & 1) === 1;
const coreReservedPresent    = (flags) => ((flags >> 1) & 1) === 1;
const qualityAndStatePresent = (flags) => ((flags >> 2) & 1) === 1;
const heartRatePresent       = (flags) => ((flags >> 4) & 1) === 1;

const Flags = {
    skinTemperature: { bit: 0, values: ['notPresent', 'present']},
    coreReserved:    { bit: 1, values: ['notPresent', 'present']},
    qualityAndState: { bit: 2, values: ['notPresent', 'present']},
    temperatureUnit: { bit: 3, values: ['C', 'F']},
    heartRate:       { bit: 4, values: ['notPresent', 'present']},
};

const Fields = {
    flags: {
        resolution: 1, size: 1, type: 'Uint8', present: ((_) => true)
    },
    coreBodyTemperature: {
        resolution: 0.01, size: 2, type: 'Int16', invalid: 0x7FFF, present: ((_) => true)
    },
    skinTemperature: {
        resolution: 0.01, size: 2, type: 'Int16', present: skinTemperaturePresent,
    },
    coreReserved: {
        resolution: 1, size: 2, type: 'Int16', present: coreReservedPresent,
    },
    qualityAndState: {
        resolution: 1, size: 1, type: 'Uint8', present: qualityAndStatePresent,
    },
    heartRate: {
        resolution: 1, size: 1, type: 'Uint8', present: heartRatePresent,
    },
};

const order = [
    'flags',
    'coreBodyTemperature',
    'skinTemperature',
    'coreReserved',
    'qualityAndState',
    'heartRate',
];

const QualityAndState = {
};

function CoreBodyTemperature(args = {}) {
    const architecture = true;

    function getField(field, dataview, i) {
        return dataview[`get${field.type}`](i, architecture) * field.resolution;
    }

    // Int -> String
    function readTemperatureUnit(flags) {
        return ((flags >> 3) & 1) === 0 ? 'C' : 'F';
    }

    // Example 1:
    // core body temperature, 38.12
    // skin temperature, 38.47
    //
    // [0b00000001, 228,   14,    7,   15,]
    // [0x01,      0xe4, 0x0e, 0x07, 0x0f,]
    //
    // Example 2:
    // core body temperature, 38.12
    // skin temperature, 38.47
    // core reserved, 0
    // quality and state, 011 good, 10 heart rate supported receiveing signal
    // heart rate, 130
    //
    // [0b00010111, 228,   14,    7,   15,    0,    0, 0b00010011, 130]
    // [0x17,      0xE4, 0x0E, 0x07, 0x0F, 0x00, 0x00, 0x13,     , 0x82]
    //
    // Dataview -> {'<field-name>': {value: Number, unit: String}}
    function decode(dataview) {
        const byteLength = dataview.byteLength;

        return order.reduce(function(acc, fieldName, i) {
            const field = Fields[fieldName];

            if((acc.i + field.size) > byteLength) return acc;

            if(field.present(acc.flags)) {
                const value = getField(field, dataview, acc.i);
                const unit  = field?.unit ?? '';
                const name  = field?.short ?? fieldName;

                if(acc.i === 0) {
                    acc.flags = value;
                    acc.temperatureUnit = readTemperatureUnit(value);
                } else {
                    // acc.data[name] = {value, unit,};
                    acc.data[name] = value;
                }
                acc.i += field.size;
            };

            return acc;
        }, {i: 0, flags: 0, data: {}}).data;
    }

    function encode(args = {}) {
        const coreBodyTemperature = Math.round(
            args.coreBodyTemperature /
            Fields.coreBodyTemperature.resolution
        ) ?? Fields.coreBodyTemperature.invalid;

        // construct based on what is present in args
        let flags = args.flags ?? 0b00000000;
        let length = 3; // depends on flags, min 3, max 9

        if('skinTemperature' in args) {
            flags = flags | 0b00000001;
            length += Fields.skinTemperature.size;
        }

        const dataview = new DataView(new ArrayBuffer(length));

        dataview.setUint8(0, flags, architecture);
        dataview.setInt16(1, coreBodyTemperature, architecture);

        if('skinTemperature' in args) {
            const skinTemperature = Math.round(
                args.skinTemperature /
                Fields.skinTemperature.resolution
            );
            dataview.setInt16(3, skinTemperature, architecture);
        }

        return dataview;
    }

    return Object.freeze({
        decode,
        encode,
    });
}

const coreBodyTemperature = CoreBodyTemperature();

export {
    CoreBodyTemperature,
    coreBodyTemperature,
};

