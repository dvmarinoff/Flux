const services = {
    fitnessMachine: {
        uuid: '00001826-0000-1000-8000-00805f9b34fb',
        indoorBikeData:                {uuid: '00002ad2-0000-1000-8000-00805f9b34fb'},
        fitnessMachineControlPoint:    {uuid: '00002ad9-0000-1000-8000-00805f9b34fb'},
        fitnessMachineFeature:         {uuid: '00002acc-0000-1000-8000-00805f9b34fb'},
        supportedResistanceLevelRange: {uuid: '00002ad6-0000-1000-8000-00805f9b34fb'},
        supportedPowerRange:           {uuid: '00002ad8-0000-1000-8000-00805f9b34fb'},
        fitnessMachineStatus:          {uuid: '00002ada-0000-1000-8000-00805f9b34fb'}
    },
    cyclingPower: {
        uuid: '00001818-0000-1000-8000-00805f9b34fb',
        cyclingPowerMeasurement:  {uuid: '00002a63-0000-1000-8000-00805f9b34fb'},
        cyclingPowerFeature:      {uuid: '00002a65-0000-1000-8000-00805f9b34fb'},
        cyclingPowerControlPoint: {uuid: '00002a66-0000-1000-8000-00805f9b34fb'},
        sensorLocation:           {uuid: '00002a5A-0000-1000-8000-00805f9b34fb'},
    },
    fecOverBle: {
        uuid: '6e40fec1-b5a3-f393-e0a9-e50e24dcca9e',
        fec2: {uuid: '6e40fec2-b5a3-f393-e0a9-e50e24dcca9e'},
        fec3: {uuid: '6e40fec3-b5a3-f393-e0a9-e50e24dcca9e'}
    },
    heartRate: {
        uuid: '0000180d-0000-1000-8000-00805f9b34fb',
        heartRateMeasurement: {uuid: '00002a37-0000-1000-8000-00805f9b34fb'}
    },
    batteryService: {
        uuid: '0000180f-0000-1000-8000-00805f9b34fb',
        batteryLevel: {uuid: '00002a19-0000-1000-8000-00805f9b34fb'}
    },
    deviceInformation: {
        uuid: '0000180a-0000-1000-8000-00805f9b34fb',
        manufacturerNameString: {uuid: '00002a29-0000-1000-8000-00805f9b34fb'},
        modelNumberString:      {uuid: '00002a24-0000-1000-8000-00805f9b34fb'},
        firmwareRevisionString: {uuid: '00002a26-0000-1000-8000-00805f9b34fb'}
    }
};

export { services };
