const services = {
    gap:               '00001800-0000-1000-8000-00805f9b34fb',
    fitnessMachine:    '00001826-0000-1000-8000-00805f9b34fb',
    cyclingPower:      '00001818-0000-1000-8000-00805f9b34fb',
    heartRate:         '0000180d-0000-1000-8000-00805f9b34fb',
    batteryService:    '0000180f-0000-1000-8000-00805f9b34fb',
    deviceInformation: '0000180a-0000-1000-8000-00805f9b34fb',
    fec:               '6e40fec1-b5a3-f393-e0a9-e50e24dcca9e',
};

const characteristics = {
    // Fitness Machine
    indoorBikeData:                '00002ad2-0000-1000-8000-00805f9b34fb',
    fitnessMachineControlPoint:    '00002ad9-0000-1000-8000-00805f9b34fb',
    fitnessMachineFeature:         '00002acc-0000-1000-8000-00805f9b34fb',
    supportedResistanceLevelRange: '00002ad6-0000-1000-8000-00805f9b34fb',
    supportedPowerRange:           '00002ad8-0000-1000-8000-00805f9b34fb',
    fitnessMachineStatus:          '00002ada-0000-1000-8000-00805f9b34fb',

    // Cycling Power
    cyclingPowerMeasurement:       '00002a63-0000-1000-8000-00805f9b34fb',
    cyclingPowerFeature:           '00002a65-0000-1000-8000-00805f9b34fb',
    cyclingPowerControlPoint:      '00002a66-0000-1000-8000-00805f9b34fb',
    sensorLocation:                '00002a5A-0000-1000-8000-00805f9b34fb',

    // Heart Rate
    heartRateMeasurement:          '00002a37-0000-1000-8000-00805f9b34fb',

    // Battery
    batteryLevel:                  '00002a19-0000-1000-8000-00805f9b34fb',

    // Device Information
    manufacturerNameString:        '00002a29-0000-1000-8000-00805f9b34fb',
    modelNumberString:             '00002a24-0000-1000-8000-00805f9b34fb',
    firmwareRevisionString:        '00002a26-0000-1000-8000-00805f9b34fb',

    // FEC over BLE
    fec2:                          '6e40fec2-b5a3-f393-e0a9-e50e24dcca9e',
    fec3:                          '6e40fec3-b5a3-f393-e0a9-e50e24dcca9e',
};

const uuids = { ...services, ...characteristics };

export { uuids };
