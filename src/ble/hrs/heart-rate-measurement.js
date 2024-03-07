//
// Heart Rate Spec
// Heart Rate Measurement characteristic
//

const heartRateFormat = (flags) => ((flags >> 0) & 1) === 1;
const inContact       = (flags) => ((flags >> 1) & 1) === 1;
const sensorContact   = (flags) => ((flags >> 2) & 1) === 1;
const energyExpanded  = (flags) => ((flags >> 3) & 1) === 1;
const rrInterval      = (flags) => ((flags >> 4) & 1) === 1;

function readHeartRate(dataview) {
    const flags = dataview.getUint8(0, true);
    const datatype = heartRateFormat(flags) ? 'Uint16' : 'Uint8';
    return dataview['get' + datatype](1, true);
}

function HeartRateMeasurement(args = {}) {

    function decode(dataview) {
        return {
            heartRate: readHeartRate(dataview)
        };
    }

    return Object.freeze({
        decode,
    });
}

const heartRateMeasurement = HeartRateMeasurement();

export {
    HeartRateMeasurement,
    heartRateMeasurement
};

