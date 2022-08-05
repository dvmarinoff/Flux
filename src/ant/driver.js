import { xf, equals, existance, isArray, dataviewToArray, delay } from '../functions.js';
import { time } from '../utils.js';
import { SerialDriver, SerialPolyfillDriver } from './web-serial.js';
import { ids } from './constants.js';

function Driver(args = {}) {
    let _driver;
    let _numOfChannels = 8;

    let _abortController = new AbortController();
    let _signal = { signal: _abortController.signal };

    function getOS() {
        if(!equals(navigator.appVersion.indexOf('Win'), -1)) return 'windows';
        if(!equals(navigator.appVersion.indexOf('Mac'), -1)) return 'macos';
        if(!equals(navigator.appVersion.indexOf('Android'), -1)) return 'android';
        if(!equals(navigator.appVersion.indexOf('Linux'), -1)) return 'linux';
        return 'unknown';
    }

    function setup(os) {
        let result = ':error';
        let driver = undefined;

        console.log(os);

        if(equals(os, 'windows')) {
            // not supported
            _driver = SerialPolyfillDriver({onData: onRx});
            result = ':success';
            driver = 'serial-polyfill';
        }
        if(equals(os, 'macos')) {
            _driver = SerialPolyfillDriver({onData: onRx});
            result = ':success';
            driver = 'serial-polyfill';
        }
        if(equals(os, 'linux')) {
            _driver = SerialDriver({onData: onRx});
            result = ':success';
            driver = 'web-serial';
        }
        if(equals(os, 'android')) {
            _driver = SerialPolyfillDriver({onData: onRx});
            result = ':success';
            driver = 'serial-polyfill';
        }

        return {
            result,
            driver,
            platform: os,
        };
    }

    function start() {
        _abortController = new AbortController();
        _signal = { signal: _abortController.signal };

        xf.sub('ui:ant:driver:switch', onSwitch.bind(self), _signal);
        xf.sub('ant:driver:tx', onTx, _signal);
    }

    function stop() {
        _abortController.abort();
    }

    function init() {
        const os = getOS();
        const result = setup(os);

        if(equals(result.result, ':success')) {
            console.log(`:ant :driver :enable '${result.driver}'`);
            xf.dispatch(`ant:driver:enable`);
            start();
        } else {
            xf.dispatch(`ant:driver:disable`);
            console.log(`:ant :driver :disable`);
            console.error(`The platform ${os} does not support serial driver!`);
        }
    }

    async function open() {
        xf.dispatch(`ant:driver:connecting`);
        await _driver.open(onOpen);
    }

    function close() {
        _driver.close();
        xf.dispatch('ant:driver:closed');
    }

    function onSwitch() {
        console.log(`onSwitch() _driver.isOpen(): ${_driver.isOpen()}`);
        if(_driver.isOpen()) {
            close();
        } else {
            open();
        }
    }

    async function onOpen() {
        await delay(1000);
        xf.dispatch('ant:driver:ready');
        xf.dispatch(`ant:driver:connected`);
    }

    function onRx(data) {
        channelDispatch(getChannel(data), data);
    }

    function isGlobal(data) {
    }

    function getId(data) { return data[2]; }

    function getChannel(data) { return data[3]; }

    function channelDispatch(channel, data) {

        console.log(`[${time()}] ant: rx: ${data}`);

        if(equals(channel, 0)) {
            for(let channel=0; channel<_numOfChannels; channel++) {
                xf.dispatch(`ant:driver:${channel}:rx`,
                            new DataView(new Uint8Array(data).buffer));
            }
        } else {
            xf.dispatch(`ant:driver:${channel}:rx`,
                        new DataView(new Uint8Array(data).buffer));
        }
    }

    function onTx(dataview) {
        _driver.write(dataview);
    }

    return Object.freeze({
        init,
        start,
        stop,
        open,
        close,
    });
}

const driver = Driver();

export { driver };
