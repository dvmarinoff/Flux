import { equals, exists, expect, compose2, dataviewToArray, print, } from '../functions.js';
import { webBle, uuids } from './web-ble.js';
import { Characteristic } from './characteristic.js';

// TODO:
// - add support for mapping write methods to parsers in the service spec object,
//   like 'write' for the WRITE property of a characteristic
// - in the start() methods handle startNotificationWithRetry fail if something fails
//   we need to disconnect the device

// Usage:
//
// function onData(msg) {
// // do something with the decoded data message
// }
//
// function onControl(msg) {
// // do something with the decoded response message
// }
//
// const spec = {
//     measurement: {
//         uuid: uuids.indoorBikeData,
//         notify: {callback: onData, parser: indoorBikeDataParser},
//     },
//     control: {
//         uuid: uuids.fitnessMachineControlPoint,
//         notify: {callback: onControl, parser: controlResponseParser},
//     },
// };
//
// const service = Service({service: BluetoothRemoteGATTService, spec,});
// await service.setup();
//
// service.characteristcics?.control.write(Dataview);
//
function Service(args = {}) {

    // config
    // BluetoothRemoteGATTService{
    //     device: BluetoothDevice,
    //     uuid: String,
    //     isPrimary: Bool,
    // }
    const _service = expect(
        args.service, 'Service needs BluetoothRemoteGATTService!'
    );

    // String
    const _name = args.name ?? webBle.uuidToName(_service.uuid);

    // spec, is the declarative specification of the characteristics under this service
    //
    // the structure of a spec object is the following:
    // {
    //     <characteristic-class>?: {
    //         uuid: UUID,
    //         <characteristic-property>: {callback: Function, parser: Parser},
    //     },
    // }
    // where:
    // <characteristic-class> is one of:
    // - 'measurement' for the data transmitting characteristic as in Cycling Power
    // measurement, Heart Rate measurement, etc.
    // - 'control' for the control point characteristic if one exists
    // - 'response' for a response characteristic if one exists
    // - 'status' for a status characteristic if one exists
    //
    // <characteristic-property> is one of:
    // - 'notify' for the NOTIFY property of a characteristic
    //
    // - callback is the function that will return the message decoded
    // - parser is an object with decode or encode method that can handle the
    // parsing of the dataview received from a characteristic,
    // note that the parsed message will be availble in the configured callback
    //
    // Example with FTMS:
    // const spec = {
    //     measurement: {
    //         uuid: uuids.indoorBikeData,
    //         notify: {callback: onData, parser: indoorBikeDataParser},
    //     },
    //     control: {
    //         uuid: uuids.fitnessMachineControlPoint,
    //         notify: {callback: onControl, parser: controlResponseParser},
    //     },
    //     status: {
    //         uuid: uuids.fitnessMachineStatus,
    //         notify: {callback: onStatus, parser: statusParser},
    //     },
    // };
    //
    const spec = args.spec ?? {};

    // protocol is the configurable function where the specific steps for each
    // characteristcs initialization will be executed. For example FTMS needs
    // to receive unlock message before it will start transmitting and responding
    // this is the place to add service specific init code.
    //
    // Void -> Bool
    const protocol = args.protocol ?? defaultProtocol;

    async function defaultProtocol() {
        return true;
    }

    function defaultCallback(msg) {
        console.log(`ble: ${getName()} on-data: `, msg);
    }

    // if a parser is not configured in the spec object the default one will used
    // decode(), method will decode the received messages to:
    // {raw: [Int]}, where the raw contains the the raw message, this is useful for
    // debuging and when developing a new device
    // encode(), method will log back the device name and data, but it won't write
    // to the characteristic
    const defaultParser = {
        decode: (dataview) => {
            const msg = {raw: dataviewToArray(dataview)};
            print.log(`rx: ${getName()} msg: `, msg);
            return msg;
        },
        encode: (data = {}) => {
            print.log(`tx: ${getName()} msg: `, data);
        }
    };
    // end config

    //
    // state
    //
    // public state

    // {'<characteristic-name>': Characteristic}
    let characteristics = {};
    // end public state

    // private state

    // [BluetoothRemoteGATTCharacteristic {
    //     service: BluetoothRemoteGATTService,
    //     uuid: String,
    //     properties: BluetoothCharacteristicProperties,
    //     oncharacteristicvaluechanged: null,
    //     value: null,
    // ]
    let _gattCharacteristics;

    // {'<characteristic-uuid>': BluetoothRemoteGATTCharacteristic}
    let _characteristics;

    // Bool
    let _started = false;

    // end private state
    // end state

    // accessors

    // Void -> String
    function getName() {
        return _name;
    }

    // Void -> String
    function isStarted() {
        return _started;
    }
    // end accessors

    async function getCharacteristics() {
        _gattCharacteristics = await _service.getCharacteristics();
        _characteristics = gattListToObject(_gattCharacteristics);
    }

    // start notifications on the configured characteristics
    //
    // Void -> Bool
    async function start() {
        for(const key in spec) {
            characteristics[key] = Characteristic({
                characteristic: _characteristics[spec[key].uuid]
            });

            if(exists(spec[key].notify)) {
                await characteristics[key].startNotificationsWithRetry(
                    compose2(
                        spec[key].notify?.callback ?? defaultCallback,
                        spec[key].notify?.parser?.decode ?? defaultParser,
                    ),
                );
            }
        }

        _started = true;
        return true;
    }

    // stop notifications on the configured characteristics
    //
    // Void -> Bool
    async function stop() {
        for(const key in spec) {
            await characteristics[key]?.stopNotifications();
        }
        _started = false;
    }

    // execute all steps needed to init the service
    // - get characteristics
    // - start notifications
    // - do any service specific work in the protocol method
    //
    // Void -> Bool
    async function setup() {
        try {
            let resChars = await getCharacteristics();
            let resStart = await start();
            let resProtocol = await protocol();
            return resStart && resProtocol;
        } catch(e) {
            console.warn(`ble: error: service: setup: `, e);
            return false;
        }
    }

    return {
        start,
        stop,
        isStarted,
        getCharacteristics,
        setup,
        characteristics,
    };
}

// think of the following as static methods

// BluetoothRemoteGATTService -> String
function serviceToString(service) {
    for(let name in uuids) {
        if(uuids[name] === service.uuid) {
            return `uuid: ${service.uuid} primary-service: ${name} `;
        }
    }

    return `uuid: ${service.uuid} primary-service: unknown`;
}

// [BluetoothRemoteGATTService] -> {'<service-uuid>': BluetoothRemoteGATTService}
function gattListToObject(xs) {
    return xs.reduce((acc, x) => {
        acc[x.uuid] = x;
        return acc;
    }, {});
}

export {
    Service,
    serviceToString,
    gattListToObject,
};

