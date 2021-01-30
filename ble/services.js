const services = {
    fitnessMachine: {
        uuid: 0x1826,
        indoorBikeData: {uuid: 0x2AD2},
        fitnessMachineControlPoint: {uuid: 0x2AD9},
        fitnessMachineFeature: {uuid: 0x2ACC},
        supportedResistanceLevelRange: {uuid: 0x2AD6},
        supportedPowerRange: {uuid: 0x2AD8},
        fitnessMachineStatus: {uuid: 0x2ADA}
    },
    cyclingPower: {
        uuid: 0x1818,
        cyclingPowerMeasurement: {uuid: 0x2A63},
        cyclingPowerFeature: {uuid: 0x2A65},
        cyclingPowerControlPoint: {uuid: 0x2A66},
        sensorLocation: {uuid: 0x2A5A},
    },
    fecOverBle: {
        uuid: 0xFEC1,
        fec3: {uuid: 0xFEC3}
    },
    heartRate: {
        uuid: 0x180D,
        heartRateMeasurement: {uuid: 0x2A37}
    },
    batteryService: {
        uuid: 0x180F,
        batteryLevel: {uuid: 0x2A19}
    },
    deviceInformation: {
        uuid: 0x180A,
        manufacturerNameString: {uuid: 0x2A29},
        modelNumberString: {uuid: 0x2A24},
        firmwareRevisionString: {uuid: 0x2A26}
    }
};

export { services };
