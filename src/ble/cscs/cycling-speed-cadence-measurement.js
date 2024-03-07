//
// Cycling Speed and Cadence Measurement Characteristic
//

import { toFixed } from '../../functions.js';
import { RevsOverTime, RateAdjuster } from './revs-over-time.js';

const wheelRevolutionDataPresent        = (flags) => ((flags >> 0) & 1) === 1;
const crankRevolutionDataPresent        = (flags) => ((flags >> 1) & 1) === 1;
const cumulativeWheelRevolutionsPresent = (flags) => ((flags >> 2) & 1) === 1;

const fields = {
    flags:                      {resolution: 1,        unit: '',  size: 1, type: 'Uint8',  present: ((_) => true)},
    cumulativeWheelRevolutions: {resolution: 1,        unit: '',  size: 4, type: 'Uint32', present: wheelRevolutionDataPresent},
    lastWheelEventTime:         {resolution: (1/1024), unit: 's', size: 2, type: 'Uint16', present: wheelRevolutionDataPresent},
    cumulativeCrankRevolutions: {resolution: 1,        unit: '',  size: 2, type: 'Uint16', present: crankRevolutionDataPresent},
    lastCrankEventTime:         {resolution: (1/1024), unit: 's', size: 2, type: 'Uint16', present: crankRevolutionDataPresent},
};

const order = [
    'flags',
    'cumulativeWheelRevolutions',
    'lastWheelEventTime',
    'cumulativeCrankRevolutions',
    'lastCrankEventTime',
];


function CSCMeasurement(args = {}) {
    const defaults = {
        wheelCircumference: 2.105, // meters or 700x25
    };

    const architecture = true;
    let wheelCircumference = args.wheelCircumference ?? defaults.wheelCircumference;

    const cadence = RevsOverTime({
        resolution: 1,
        maxRevs:    (2**16) * fields.cumulativeCrankRevolutions.resolution, // 1
        maxTime:    (2**16) * fields.lastCrankEventTime.resolution, // 1024
        // revs per second to revs per 60 seconds
        format:     (x) => Math.round(x * 60),
    });

    const rateAdjuster = RateAdjuster({
        sensor: 'cscs',
        onDone: function(maxRateCount) {
            cadence.setMaxRateCount(maxRateCount);
        }
    });

    function getField(field, dataview, i) {
        return dataview[`get${field.type}`](i, architecture) * field.resolution;
    }

    function decode(dataview) {
        const byteLength = dataview.byteLength;

        if(!rateAdjuster.isDone()) {
            rateAdjuster.update({ts: Date.now()});
        }

        return order.reduce(function(acc, fieldName) {
            const field = fields[fieldName];

            if((acc.i + field.size) > byteLength) return acc;

            if(field.present(acc.flags)) {
                const value = getField(field, dataview, acc.i);
                const unit  = field.unit;
                const name  = field.short ?? fieldName;

                if(acc.i === 0) {
                    acc.flags = value;
                }

                acc.data[name] = value;

                if(name === 'lastCrankEventTime') {
                    acc.data['cadence'] = cadence.calculate(
                        acc.data['cumulativeCrankRevolutions'],
                        acc.data['lastCrankEventTime'],
                    );
                }

                acc.i += field.size;
            };

            return acc;

        }, {i: 0, flags: 0, data: {}}).data;
    }

    return Object.freeze({
        decode,
    });
}

const cscMeasurement = CSCMeasurement();

export {
    CSCMeasurement,
    cscMeasurement,
};

