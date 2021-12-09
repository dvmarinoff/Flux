import { nthBitToBool }  from '../../functions.js';

const reading =  {
    avgSpeed:            (flags) => nthBitToBool(flags,  0),
    cadence:             (flags) => nthBitToBool(flags,  1),
    distance:            (flags) => nthBitToBool(flags,  2),
    inclination:         (flags) => nthBitToBool(flags,  3),
    elevationGain:       (flags) => nthBitToBool(flags,  4),
    pace:                (flags) => nthBitToBool(flags,  5),
    stepCount:           (flags) => nthBitToBool(flags,  6),
    resistanceLevel:     (flags) => nthBitToBool(flags,  7),
    strideCount:         (flags) => nthBitToBool(flags,  8),
    expendedEnergy:      (flags) => nthBitToBool(flags,  9),
    heartRate:           (flags) => nthBitToBool(flags, 10),
    metabolicEquivalent: (flags) => nthBitToBool(flags, 11),
    elapsedTime:         (flags) => nthBitToBool(flags, 12),
    remainingTime:       (flags) => nthBitToBool(flags, 13),
    power:               (flags) => nthBitToBool(flags, 14),
    forceOnBelt:         (flags) => nthBitToBool(flags, 15),
    userDataRetention:   (flags) => nthBitToBool(flags, 16)
};

const target =  {
    speed:                (flags) => nthBitToBool(flags,  0),
    inclination:          (flags) => nthBitToBool(flags,  1),
    resistance:           (flags) => nthBitToBool(flags,  2),
    power:                (flags) => nthBitToBool(flags,  3),
    heartRate:            (flags) => nthBitToBool(flags,  4),
    expendedEnergy:       (flags) => nthBitToBool(flags,  5),
    stepNumber:           (flags) => nthBitToBool(flags,  6),
    strideNumber:         (flags) => nthBitToBool(flags,  7),
    distance:             (flags) => nthBitToBool(flags,  8),
    trainingTime:         (flags) => nthBitToBool(flags,  9),
    timeTwoHRZones:       (flags) => nthBitToBool(flags, 10),
    timeThreeHRZones:     (flags) => nthBitToBool(flags, 11),
    timeFiveHRZones:      (flags) => nthBitToBool(flags, 12),
    simulation:           (flags) => nthBitToBool(flags, 13),
    wheelCircumference:   (flags) => nthBitToBool(flags, 14),
    spinDown:             (flags) => nthBitToBool(flags, 15),
    cadence:              (flags) => nthBitToBool(flags, 16)
};

function FitnessMachineFeature() {

    function decode(dataview) {
        const featureFlags = dataview.getUint32(0, true); // 0-31 flags
        const targetFlags  = dataview.getUint32(4, true); // 0-31 flags

        let readings = [];
        let targets  = [];

        if(reading.avgSpeed(featureFlags)) readings.push('Speed');
        if(reading.cadence(featureFlags))  readings.push('Cadence');
        if(reading.distance(featureFlags)) readings.push('Distance');
        if(reading.power(featureFlags))    readings.push('Power');

        if(target.speed(targetFlags))      targets.push('Speed');
        if(target.cadence(targetFlags))    targets.push('Cadence');
        if(target.distance(featureFlags))  targets.push('Distance');
        if(target.resistance(targetFlags)) targets.push('Resistance');
        if(target.power(targetFlags))      targets.push('Power');
        if(target.simulation(targetFlags)) targets.push('Simulation');
        if(target.spinDown(targetFlags))   targets.push('SpinDown');

        return {
            readings,
            targets
        };
    }

    function encode() {
    }

    return Object.freeze({
        encode,
        decode
    });
}

const feature = FitnessMachineFeature();

export { feature };
