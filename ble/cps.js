const cyclingPowerMeasurment =
[
    {name: 'Flags',
     requirement: 'Mandatory',
     format: 'Uint16',
     bitField: [
         {index: 0, size: 1, name: 'PedalPowerBalance',
          enumerations: [{key: 0, value: false}, {key: 1, value: true}]},

         {index: 1, size: 1, name: 'PedalPowerBalanceReference',
          enumerations: [{key: 0, value: 'Unknown'}, {key: 1, value: 'Left'}]},

         {index: 2, size: 1, name: 'AccumulatedTorque',
          enumerations: [{key: 0, value: false}, {key: 1, value: true}]},

         {index: 3, size: 1, name: 'AccumulatedTorqueSource',
          enumerations: [{key: 0, value: 'Wheel Based'}, {key: 1, value: 'Crank Based'}]},

         {index: 4, size: 1, name: 'WheelRevolutionData',
          enumerations: [{key: 0, value: false}, {key: 1, value: true}]},

         {index: 5, size: 1, name: 'CrankRevolutionData',
          enumerations: [{key: 0, value: false}, {key: 1, value: true}]},

         {index: 6, size: 1, name: 'ExtremeForceMagnitudes',
          enumerations: [{key: 0, value: false}, {key: 1, value: true}]},

         {index: 7, size: 1, name: 'ExtremeTorqueMagnitudes',
          enumerations: [{key: 0, value: false}, {key: 1, value: true}]},

         {index: 8, size: 1, name: 'TopDeadSpotAngle',
          enumerations: [{key: 0, value: false}, {key: 1, value: true}]},

         {index: 9, size: 1, name: 'BottomDeadSpotAngle',
          enumerations: [{key: 0, value: false}, {key: 1, value: true}]},

         {index: 10, size: 1, name: 'AccumulatedEnergy',
          enumerations: [{key: 0, value: false}, {key: 1, value: true}]},

         {index: 11, size: 1, name: 'OffsetCompensationIndicator',
          enumerations: [{key: 0, value: false}, {key: 1, value: true}]},

         {index: 12, size: 3, name: 'ReservedForFutureUse '},
     ],
    },
    {name: 'InstantaneousPower', requirement: 'Mandatory',
     format: 'Int16', unit: 'Watt', decimalExponent: 0,
     informativeText: 'Unit is in watts with a resolution of 1.',
    },
    {name: 'PedalPowerBalance', requirement: 'Optional',
     format: 'Uint8', unit: 'Percentage', binaryExponent: -1,
     informativeText: 'Unit is in percentage with a resolution of 1/2.',
    },
    {name: 'AccumulatedTorque', requirement: 'Optional',
     format: 'Uint16',
     unit: 'N m',
     binaryExponent: -5,
     informativeText: 'Unit is in newton metres with a resolution of 1/32.',
    },

    {name: 'WheelRevolutionDataCumulativeWheelRevolutions', requirement: 'C1',
     format: 'Uint32', unit: 'unitless', decimalExponent: 0,
     informativeText: 'Unitless. C1:When present, these fields are always present as a pair.',
    },
    {name: 'WheelRevolutionDataLastWheelEventTime', requirement: 'C1',
     format: 'Uint16', unit: 'second', binaryExponent: -11,
     informativeText: 'Unit is in seconds with a resolution of 1/2048. C1:When present, these fields are always present as a pair.',
    },

    {name: 'CrankRevolutionDataCumulativeCrankRevolutions', requirement: 'C2',
     format: 'Uint16', unit: 'unitless', decimalExponent: 0,
     informativeText: 'Unitless. C2:When present, these fields are always present as a pair.',
    },
    {name: 'CrankRevolutionDataLastCrankEventTime', requirement: 'C3',
     format: 'Int16', unit: 'N', binaryExponent: -10,
     informativeText: 'Unit is in newtons with a resolution of 1. C3:When present, these fields are always present as a pair.',
    },


    {name: 'ExtremeForceMagnitudesMinimumForceMagnitude', requirement: 'C3',
     format: 'Int16', unit: 'N', decimalExponent: 0,
     informativeText: 'Unit is in newtons with a resolution of 1. C3:When present, these fields are always present as a pair.',
    },
    {name: 'ExtremeTorqueMagnitudesMaximumTorqueMagnitude', requirement: 'C4',
     format: 'Int16', unit: 'N m', binaryExponent: -5,
     informativeText: 'Unit is in newton metres with a resolution of 1/32. C4:When present, these fields are always present as a pair.',
    },
    {name: 'ExtremeTorqueMagnitudesMinimumTorqueMagnitude', requirement: 'C4',
     format: 'Int16', unit: 'N m', binaryExponent: -5,
     informativeText: 'Unit is in newton metres with a resolution of 1/32. C4:When present, these fields are always present as a pair.',
    },

    {name: 'ExtremeAnglesMaximumAngle', requirement: 'C5',
     format: 'Uint12', unit: 'degree', decimalExponent: 0,
     informativeText: `Unit is in degrees with a resolution of 1.
                       C5: When present, this field and the "Extreme Angles - Minimum Angle" field are always present as a
                       pair and are concatenated into a UINT24 value (3 octets). As an example, if the Maximum Angle is
                       0xABC and the Minimum Angle is 0x123, the transmitted value is 0x123ABC.`,
    },

    {name: 'ExtremeAnglesMinimumAngle', requirement: 'C5',
     format: 'Uint12', unit: 'degree', decimalExponent: 0,
     informativeText: `Unit is in degrees with a resolution of 1.
                       C5: When present, this field and the "Extreme Angles - Maximum Angle" field are always present as a
                       pair and are concatenated into a UINT24 value (3 octets). As an example, if the Maximum Angle is
                       0xABC and the Minimum Angle is 0x123, the transmitted value is 0x123ABC.`,
    },

    {name: 'TopDeadSpotAngle', requirement: 'Optional',
     format: 'Uint16', unit: 'degree', decimalExponent: 0,
     informativeText: 'Unit is in degrees with a resolution of 1.',
    },

    {name: 'BottomDeadSpotAngle', requirement: 'Optional',
     format: 'Uint16', unit: 'degree', binaryExponent: 0,
     informativeText: 'Unit is in degrees with a resolution of 1.',
    },

    {name: 'AccumulatedEnergy', requirement: 'Optional',
     format: 'Uint16', unit: 'J', binaryExponent: 0,
     informativeText: 'Unit is in kilojoules with a resolution of 1.',
    },
];

let cyclingPowerFeatureSupport =
[
    {name: 'PedalPowerBalance',           value: false, msg: 'Pedal Power Balance'},
    {name: 'AccumulatedTorque',           value: false, msg: 'Accumulated Torque'},
    {name: 'WheelRevolutionData',         value: false, msg: 'Wheel Revolution Data'},
    {name: 'CrankRevolutionData',         value: false, msg: 'Crank Revolution Data'},
    {name: 'ExtremeMagnitudes',           value: false, msg: 'Extreme Magnitudes'},
    {name: 'ExtremeAngles',               value: false, msg: 'Extreme Angles'},
    {name: 'TopAndBottomDeadSpotAngles',  value: false, msg: 'Top and Bottom Dead Spot Angles'},
    {name: 'AccumulatedEnergy',           value: false, msg: 'Accumulated Energy'},
    {name: 'OffsetCompensationIndicator', value: false, msg: 'Offset Compensation Indicator'},
    {name: 'SensorMeasurementContext',    value: false, msg: 'Sensor Measurement Context'},
    {name: 'InstantaneousMeasurementDirection', value: false, msg: 'InstantaneousMeasurementDirection'},
    {name: 'OffsetCompensation',          value: false, msg: ''},
    {name: 'CPMCContentMasking',          value: false, msg: 'Cycling Power Measurement Characteristic Content Masking'},
    {name: 'MultipleSensorLocations',     value: false, msg: 'Multiple Sensor Locations'},
    {name: 'CrankLengthAdjustment',       value: false, msg: 'Crank Length Adjustment'},
    {name: 'ChainLengthAdjustment',       value: false, msg: 'Chain Length Adjustment'},
    {name: 'ChainWeightAdjustment',       value: false, msg: 'Chain Weight Adjustment'},
    {name: 'SpanLengthAdjustment',        value: false, msg: 'Span Length Adjustment'},
    {name: 'FactoryCalibrationDate',      value: false, msg: 'Factory Calibration Date'},
    {name: 'EnhancedOffsetCompensation',  value: false, msg: 'Enhanced Offset Compensation'},
];

let cyclingPowerMeasurementFlags =
[
    {name: 'PedalPowerBalance',           value: false, msg: 'Pedal Power Balance'},
    {name: 'PedalPowerBalanceReference',  value: false, msg: 'Pedal Power Balance Reference'},
    {name: 'Accumulated Torque',          value: false, msg: 'Accumulated Torque'},
    {name: 'Accumulated Torque Source',   value: false, msg: 'Accumulated Torque Source'},
    {name: 'WheelRevolutionData',         value: false, msg: 'Wheel Revolution Data'},
    {name: 'CrankRevolutionData',         value: false, msg: 'Crank Revolution Data'},
    {name: 'ExtremeForceMagnitudes',      value: false, msg: 'Extreme Force Magnitudes'},
    {name: 'ExtremeTorqueMagnitudes',     value: false, msg: 'Extreme Torque Magnitudes'},
    {name: 'ExtremeAngles',               value: false, msg: 'Extreme Angles'},
    {name: 'TopDeadSpotAngle',            value: false, msg: 'Top Dead Spot Angle'},
    {name: 'BottomDeadSpotAngle',         value: false, msg: 'Bottom Dead Spot Angle'},
    {name: 'AccumulatedEnergy',           value: false, msg: 'Accumulated Energy'},
    {name: 'OffsetCompensationIndicator', value: false, msg: 'Offset Compensation Indicator'},
];



function flagsToFieldsPresent(flags) {
    return {};
}

flagsToFieldsPresent(30);

function isCadenceSupported(flags) {}

function dataviewToCyclingPowerMeasurement(dataview) {

//               0  1  2  3  4  5  6  7  8  9 10 11 12 13
//  value: (0x) 30-00-21-00-2A-00-00-00-C4-60-12-00-F7-04
//

    const flagsFieldIndex = 0;
    const instantaneousPowerFieldIndex = 2;

    let flags = dataview.getUint16(flagsFieldIndex, true);
    let power = dataview.getInt16(instantaneousPowerFieldIndex, true);

    let fields = flagsToFieldsPresent(30);

    let data = {
        flags:  flags,
        power: power,
    };

    if(isCadenceSupported(flags)) {
        const crankRevolutionsFieldIndex = 0;
        let cadence = dataview.getInt16(crankRevolutionsFieldIndex, true);
        data['cadence'] = cadence;
    }

    return data;
}

let cps = {
    dataviewToCyclingPowerMeasurement,
};

export { cps };
