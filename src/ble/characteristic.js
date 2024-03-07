import { exists, arrayBufferToArray, wait, time, print, } from '../functions.js';
import { webBle } from './web-ble.js';

function Characteristic(args = {}) {
    //
    // config
    //
    // BluetoothRemoteGATTCharacteristic
    const _characteristic = args.characteristic;

    // Uuid
    const uuid = _characteristic.uuid;

    // String
    const name = args.name ?? webBle.uuidToName(_characteristic.uuid);

    // Function
    // some browsers don't have writeValueWithResponse,
    // but writeValue is depricated, so try the first or fallback to last.
    const writterFn = exists(_characteristic.writeValueWithResponse) ?
          'writeValueWithResponse' :
          'writeValue';

    // Int, ms
    const responseTimeout = args.responseTimeout ?? 1000;

    // end  config

    //
    // state
    //
    // private state

    // Int
    let _responseTimeoutId;

    // Bool
    let _ready = true;

    let abortController;
    let signal;

    // end private state
    // end state

    // accesor methods
    function isReady() {
        return _ready;
    }
    // end accesor methods

    //
    // methods
    //

    // Function -> Bool;
    async function startNotifications(handler) {
        try {
            abortController = new AbortController();
            signal = { signal: abortController.signal };

            await _characteristic.startNotifications();
            _characteristic.addEventListener(
                'characteristicvaluechanged', (e) => handler(e.target.value), signal
            );

            print.log(`ble: notifications: started: on: ${name} ${uuid}.`);
            return true;
        } catch(e) {
            console.error(`notifications: failed: starting: on: name: ${name} uuid: ${uuid}`, e);
            return false;
        }
    }

    // Function, Int, Int -> Bool;
    async function startNotificationsWithRetry(handler, attempts = 10, txRate = 250) {
        const success = await startNotifications(handler);
        if(success) {
            return true;
        } else {
            if(attempts > 0) {
                await wait(txRate);
                print.log(`ble: startNotificationsWithRetry: fail: 'trying again'`);
                return await startNotificationsWithRetry(handler, attempts-1);
            } else {
                print.log(`ble: startNotificationsWithRetry: fail: 'give up'`);
                return false;
            }
        }
    }

    // Function -> Bool;
    async function stopNotifications(handler) {
        try {
            await _characteristic.stopNotifications();
            abortController.abort();

            print.log(`notifications: stopped: on: ${name} ${uuid}.`);
            return true;
        } catch(e) {
            console.error(`notifications: failed: stopping: on: name: ${name} uuid: ${uuid}`, e);
            return false;
        }
    }

    // {} -> Any
    async function read(args = {}) {
        const fallback = args.fallback;

        try{
            const value = await _characteristic.readValue();
            return value;
        } catch(e) {
            console.error(`ble: characteristic: :failed :read on: ${name} uuid: ${uuid}`, e);
            return fallback;
        }
    }

    // DataView -> Bool
    async function write(value) {
        let res;
        try{
            res = await _characteristic[writterFn](value);
            return true;
        } catch(e) {
            print.warn(`ble: characteristic: failed: write: on: ${name} uuid: ${uuid} value: [${arrayBufferToArray(value)}]`, e);
            return false;
        }
    }

    // Any, Int, Int -> Bool
    async function writeWithRetry(value, attempts = 10, txRate = 250) {
        let success = await write(value);
        if(success) {
            print.log(`ble: characteristic: writeWithRetry: success:`);
            return true;
        } else {
            if(attempts > 0) {
                print.log(`ble: characteristic: writeWithRetry: fail: continue:`);
                await wait(txRate);
                return await writeWithRetry(value, attempts-1);
            } else {
                print.log(`ble: characteristic: writeWithRetry: fail: break:`);
                return false;
            }
        }
    }

    // Void -> Void
    function block() {
        _responseTimeoutId = setTimeout(release, responseTimeout);
        _ready = false;
    }

    // Void -> Void
    function release() {
        clearTimeout(_responseTimeoutId);
        _ready = true;
    }
    // end methods

    return Object.freeze({
        startNotifications,
        startNotificationsWithRetry,
        stopNotifications,
        read,
        write,
        writeWithRetry,

        isReady,
        block,
        release,
    });
}

export { Characteristic };

