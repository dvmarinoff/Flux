//
// Saturated Muscle Oxygen Service
//

import { Spec } from '../common.js';

function SensorData(args = {}) {

    const definitions = {
        sensorCount: {
            size: 2, resolution: 1, unit: '', min: 0, max: 32767,
        },
        currentSaturatedHemoglobin: {
            size: 2, resolution: 0.1, unit: '%', min: 0, max: 1000,
        },
        previousSaturatedHemoglobin: {
            size: 2, resolution: 0.1, unit: '%', min: 0, max: 1000,
        },
        totalHemoglobinSaturation: {
            size: 2, resolution: 0.01, unit: 'g/dl', min: 0, max: 4000,
        },
        requestTimeSetBit: {
            size: 1, resolution: 1, unit: '', min: 0, max: 1,
        },
    };

    const spec = Spec({definitions});

    function encode(args = {}) {
        throw new Error("SmOS SensorData.encode is not yet implemented!");
    }

    // Example:
    //
    // (0x) CB-06- 15-02- 16-02- C0-04 -00
    //      1739   533    534    1216   0
    //
    // (0x) CC-06- 12-02- 12-02- C1-04 -00
    //      1740   530    530    1217   0
    //
    // (0x) CD-06- 12-02- 12-02- C1-04 -00
    //      1741   530    530    1217   0
    //
    // (0x) CE-06- 13-02- 12-02- C1-04 -00
    //      1742   531    530    1217   0
    //
    // (0x) CF-06- 14-02- 13-02- C1-04 -00
    //      1743   532    531    1217   0
    //
    function decode(dataview) {
        const sensorCount                 = dataview.getUint16(0, true);
        const currentSaturatedHemoglobin  = spec.decodeField(
            'currentSaturatedHemoglobin',
            dataview.getUint16(2, true)
        );
        const previousSaturatedHemoglobin = spec.decodeField(
            'previousSaturatedHemoglobin',
            dataview.getUint16(4, true)
        );
        const totalHemoglobinSaturation   = spec.decodeField(
            'totalHemoglobinSaturation',
            dataview.getUint16(6, true)
        );
        const requestTimeSetBit           = dataview.getUint8( 8, true);

        return {
            sensorCount,
            currentSaturatedHemoglobin,
            previousSaturatedHemoglobin,
            totalHemoglobinSaturation,
            requestTimeSetBit,
        };
    }

    return Object.freeze({
        encode,
        decode,
    });
}

function DeviceControl(args = {}) {
    const length = 3;

    const definitions = {
        dataControl: {
            size: 1, resolution: 1, unit: '', min: 0, max: 5,
        },
        updateType: {
            size: 1, resolution: 1, unit: '', min: 0, max: 5,
        },
    };

    const values = {
        dataControl: {
            notIncluded: 0,
            reset: 1,
            markLap: 2,
            start: 3,
            stop: 4,
            clearData: 5,
        },
        updateType: {
            'doNotChange': 0,
            '2sDataSmoothing': 1, // Default
            '2sNoDataSmoothing': 2,
            '2sDataSmoothing': 3,
            '0.5sNoDataSmoothing': 4,
            '1sDataSmoothing': 5,
        },
        antProfile: {
            doNotChange: 0,
            matchExisting: 1,
            matchExisting: 2,
            matchExisting: 3,
        },
        antBleSelector: {
            doNotChange: 0,
            antPlus: 1,
            ble: 2,
            both: 3,
            neither: 4,
        }
    };

    const defaults = {
        dataControl:    values.dataControl.notIncluded,
        updateType:     values.updateType.doNotChange,
        antProfile:     values.antProfile.doNotChange,
        antBleSelector: values.antBleSelector.doNotChange,
    };

    function encode(args = {}) {
        const dataControl = args.dataControl ?? defaults.dataControl;
        const updateType  = args.updateType ?? defaults.updateType;

        // Depricated
        const antProfile     = defaults.antProfile;
        const antBleSelector = defaults.antBleSelector;
        const compound       = (antProfile << 4) + antBleSelector;
        // end Depricated

        const buffer = new ArrayBuffer(length);
        const view   = new DataView(buffer);

        view.setUint8(0, dataControl, true);
        view.setUint8(1, updateType, true);
        view.setUint8(1, compound, true);

        return view.buffer;
    }

    function decode(dataview) {
        throw new Error("SmO2 DeviceControl.decode is not yet implemented!");
    }

    return Object.freeze({
        encode,
        decode,
        length,
        definitions,
        values,
        defaults,
    });
}

const sensorData = SensorData();
const deviceControl = DeviceControl();

export {
    sensorData,
    deviceControl
}
