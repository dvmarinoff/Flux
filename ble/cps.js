
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
    {name: 'Pedal Power Balance', requirement: 'Optional',
     format: 'Uint8', unit: 'Percentage', binaryExponent: -1,
     informativeText: 'Unit is in percentage with a resolution of 1/2.',
    },
    {name: '',
     requirement: '',
     format: '',
     unit: '',
     decimalExponent: 0,
     informativeText: '',
    },

    {name: '',
     requirement: '',
     format: '',
     unit: '',
     decimalExponent: 0,
     informativeText: '',
    },
    {name: '',
     requirement: '',
     format: '',
     unit: '',
     decimalExponent: 0,
     informativeText: '',
    },

    // {name: 'Flags',
    //  requirement: 'Mandatory',
    //  format: 'Uint16',
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



function dataviewToCyclingPowerMeasurement(dataview) {

//               0  1  2  3  4  5  6  7  8  9 10 11 12 13
//  value: (0x) 30-00-21-00-2A-00-00-00-C4-60-12-00-F7-04
//

    const flagsField = 0;
    const instantaneousPowerField = 2;

    let data = {
        flags:  dataview.getUint16(flagsField, true),
        power:  dataview.getInt16(instantaneousPowerField, true),
    };

    return data;
}

let cps = {
    dataviewToCyclingPowerMeasurement: dataviewToCyclingPowerMeasurement,
};

export { cps };
