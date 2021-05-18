import { nthBit, nthBitToBool } from '../../functions.js';

const distributedSystemsValues = {
    0: 'legacy',
    1: 'nondistributed',
    2: 'distributed',
    3: 'RFU'
};

const pedalPowerBalanceSupported           = (flags) => nthBitToBool(flags, 0);
const accumulatedTorqueSupported           = (flags) => nthBitToBool(flags, 1);
const wheelRevolutionDataSupported         = (flags) => nthBitToBool(flags, 2);
const crankRevolutionDataSupported         = (flags) => nthBitToBool(flags, 3);
const extremeMagnitudesSupported           = (flags) => nthBitToBool(flags, 4);
const extremeAnglesSupported               = (flags) => nthBitToBool(flags, 5);
const topBottomDeadSpotAnglesSupported     = (flags) => nthBitToBool(flags, 6);
const accumulatedEnergySupported           = (flags) => nthBitToBool(flags, 7);
const offsetCompensationIndicatorSupported = (flags) => nthBitToBool(flags, 8);
const offsetCompensationSupported          = (flags) => nthBitToBool(flags, 9);
const cpmcContentMaskingSupported          = (flags) => nthBitToBool(flags, 10);
const multipleSensorLocationsSupported     = (flags) => nthBitToBool(flags, 11);
const crankLengthAdjustmentSupported       = (flags) => nthBitToBool(flags, 12);
const chainLengthAdjustmentSupported       = (flags) => nthBitToBool(flags, 13);
const chainWeightAdjustmentSupported       = (flags) => nthBitToBool(flags, 14);
const spanLengthAdjustmentSupported        = (flags) => nthBitToBool(flags, 15);
const sensorMeasurementContext             = (flags) => nthBitToBool(flags, 16);
const instMeasurementDirectionSupported    = (flags) => nthBitToBool(flags, 17);
const factoryCalibrationDateSupported      = (flags) => nthBitToBool(flags, 18);
const enhancedOffsetCompensationSupported  = (flags) => nthBitToBool(flags, 19);
const distributeSystemSupported            = (flags) => {
    const value = nthBit(flags, 20) + (nthBit(flags, 21) << 1); // size 2
    return distributedSystemsValues[value];
};


function cpsFeatureDecoder(dataview) {
    // 0x31d40140c490
    const flags = dataview.getUint32(0, true);

    const feature = {
        pedalPowerBalanceSupported:           pedalPowerBalanceSupported(flags),
        accumulatedTorqueSupported:           accumulatedTorqueSupported(flags),
        wheelRevolutionDataSupported:         wheelRevolutionDataSupported(flags),
        crankRevolutionDataSupported:         crankRevolutionDataSupported(flags),
        extremeMagnitudesSupported:           extremeMagnitudesSupported(flags),
        extremeAnglesSupported:               extremeAnglesSupported(flags),
        topBottomDeadSpotAnglesSupported:     topBottomDeadSpotAnglesSupported(flags),
        accumulatedEnergySupported:           accumulatedEnergySupported(flags),
        offsetCompensationIndicatorSupported: offsetCompensationIndicatorSupported(flags),
        offsetCompensationSupported:          offsetCompensationSupported(flags),
        cpmcContentMaskingSupported:          cpmcContentMaskingSupported(flags),
        multipleSensorLocationsSupported:     multipleSensorLocationsSupported(flags),
        crankLengthAdjustmentSupported:       crankLengthAdjustmentSupported(flags),
        chainLengthAdjustmentSupported:       chainLengthAdjustmentSupported(flags),
        chainWeightAdjustmentSupported:       chainWeightAdjustmentSupported(flags),
        spanLengthAdjustmentSupported:        spanLengthAdjustmentSupported(flags),
        sensorMeasurementContext:             sensorMeasurementContext(flags),
        instMeasurementDirectionSupported:    instMeasurementDirectionSupported(flags),
        factoryCalibrationDateSupported:      factoryCalibrationDateSupported(flags),
        enhancedOffsetCompensationSupported:  enhancedOffsetCompensationSupported(flags),
        distributeSystemSupported:            distributeSystemSupported(flags),
    };

    return feature;
}

export { cpsFeatureDecoder };
