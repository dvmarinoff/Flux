const kSetLineCoding       = 0x20;
const kSetControlLineState = 0x22;
const kSendBreak           = 0x23;

const kDefaultBufferSize = 255;
const kDefaultDataBits   = 8;
const kDefaultParity     = 'none';
const kDefaultStopBits   = 1;

const kAcceptableDataBits = [16, 8, 7, 6, 5];
const kAcceptableStopBits = [1, 2];
const kAcceptableParity   = ['none', 'even', 'odd'];

const kParityIndexMapping   = ['none', 'odd', 'even'];
const kStopBitsIndexMapping = [1, 1.5, 2];

const SerialPolyfillProtocol = {
    UsbCdcAcm: 'UsbCdcAcm'
};

const kDefaultPolyfillOptions = {
    protocol: SerialPolyfillProtocol.UsbCdcAcm,
    usbControlInterfaceClass: 255,
    usbTransferInterfaceClass: 255,
};

// USBDevice, number -> USBInterface
function findInterface(device, classCode) {
    const configuration = device.configurations[0];
    for (const iface of configuration.interfaces) {
        const alternate = iface.alternates[0];
        if (alternate.interfaceClass === classCode) {
            return iface;
        }
    }
    throw new TypeError(`:serial 'Unable to find interface with class ${classCode}'`);
}

// USBInterface, USBDirection -> USBEndpoint
function findEndpoint(iface, direction) {
    const alternate = iface.alternates[0];
    for (const endpoint of alternate.endpoints) {
        if (endpoint.direction == direction) {
            return endpoint;
        }
    }
    throw new TypeError(`:serial 'Interface ${iface.interfaceNumber} does not have an ${direction} endpoint'`);
}

/**
 * Implementation of the underlying source API[1] which reads data from a USB
 * endpoint. This can be used to construct a ReadableStream.
 *
 * [1]: https://streams.spec.whatwg.org/#underlying-source-api
 */
// implements UnderlyingSource<Uint8Array>
class UsbEndpointUnderlyingSource {
    /**
     * Constructs a new UnderlyingSource that will pull data from the specified
     * endpoint on the given USB device.
     */
    // USBDevice, USBEndpoint, Function
    constructor(device, endpoint, onError = ((x) => x) ) {
        this._device   = device;
        this._endpoint = endpoint;
        this._onError  = onError;
    }
    /**
     * Reads a chunk of data from the device.
     */
    // ReadableStreamDefaultController -> void
    pull(controller) {
        const chunkSize = controller.desiredSize || 64;
        this._device
            .transferIn(this.endpoint_.endpointNumber, chunkSize)
            .then((result) => {
                controller.enqueue(result.data);
            })
            .catch((error) => {
                controller.error(error.toString());
                this.onError_();
            });
    }
}

/**
 * Implementation of the underlying sink API[2] which writes data to a USB
 * endpoint. This can be used to construct a WritableStream.
 *
 * [2]: https://streams.spec.whatwg.org/#underlying-sink-api
 */
// implements UnderlyingSink<Uint8Array>
class UsbEndpointUnderlyingSink {
    /**
     * Constructs a new UnderlyingSink that will write data to the specified
     * endpoint on the given USB device.
     */
    // USBDevice, USBEndpoint, Function
    constructor(device, endpoint, onError = ((x) => x) ) {
        this._device   = device;
        this._endpoint = endpoint;
        this._onError  = onError;
    }

    /**
     * Writes a chunk to the device.
     */
    // Uint8Array, WritableStreamDefaultController -> Promise
    async write(chunk, controller) {
        try {
            const result =
                await this._device.transferOut(this._endpoint.endpointNumber, chunk);
                if (result.status != 'ok') {
                    controller.error(result.status);
                    this._onError();
                }
        } catch (error) {
            controller.error(error.toString());
            this._onError();
        }
    }
}

/* a class used to control serial devices over WebUSB */
class SerialPort {
    // _polyfillOptions;
    // _device;
    // _controlInterface;
    // _transferInterface;
    // _inEndpoint;
    // _outEndpoint;

    // _serialOptions;
    // _readable;
    // _writable;
    // _outputSignals;

    /**
    * constructor taking a WebUSB device that creates a SerialPort instance.
    * @param {USBDevice} device A device acquired from the WebUSB API
    * @param {SerialPolyfillOptions} polyfillOptions Optional options to
    * configure the polyfill.
    */
    // USBDevice, SerialPolyfillOptions
    constructor(device, polyfillOptions = {}) {
        this._polyfillOptions = {
            ...kDefaultPolyfillOptions,
            ...polyfillOptions
        };
        this._outputSignals = {
            dataTerminalReady: false,
            requestToSend:     false,
            break:             false
        };

        this._device = device;
        this._controlInterface  = findInterface(this._device, this._polyfillOptions.usbControlInterfaceClass);
        this._transferInterface = findInterface(this._device, this._polyfillOptions.usbTransferInterfaceClass);
        this._inEndpoint        = findEndpoint(this._transferInterface, 'in');
        this._outEndpoint       = findEndpoint(this._transferInterface, 'out');
    }

  /**
   * Getter for the readable attribute. Constructs a new ReadableStream as
   * necessary.
   * @return {ReadableStream} the current readable stream
   */
    // ReadableStream<Uint8Array> ->
    get readable() {
        if(!this._readable && this._device.opened) {
            this._readable = new ReadableStream(
                new UsbEndpointUnderlyingSource(this._device,
                                                this._inEndpoint,
                                                (() => { this._readable = null; })),
                new ByteLengthQueuingStrategy({
                    highWaterMark: this._serialOptions.bufferSize ?? kDefaultBufferSize, // maybe ||
                }));
        }
        return this._readable;
    }

    /**
     * Getter for the writable attribute. Constructs a new WritableStream as
     * necessary.
     * @return {WritableStream} the current writable stream
     */
    // WritableStream<Uint8Array>
    get writable() {
        if(!this._writable && this._device.opened) {
            this._writable = new WritableStream(
                new UsbEndpointUnderlyingSink(
                    this._device,
                    this._outEndpoint, () => {
                        this._writable = null;
                    }),
                new ByteLengthQueuingStrategy({
                    highWaterMark: this._serialOptions.bufferSize ?? kDefaultBufferSize,
                }));
        }
        return this._writable;
    }

    /**
     * a function that opens the device and claims all interfaces needed to
     * control and communicate to and from the serial device
     * @param {SerialOptions} options Object containing serial options
     * @return {Promise<void>} A promise that will resolve when device is ready
     * for communication
     */
    // SerialOptions -> Promise<void>
    async open(options) {
        this._serialOptions = options;
        this.validateOptions();

        try {
            await this._device.open();
            if(this._device.configuration === null) {
                await this._device.selectConfiguration(1);
            }

            await this._device.claimInterface(this._controlInterface.interfaceNumber);
            if(this._controlInterface !== this._transferInterface) {
                await this._device.claimInterface(this._transferInterface.interfaceNumber);
            }

            await this.setLineCoding();
            await this.setSignals({dataTerminalReady: true});
        } catch (error) {
            if(this._device.opened) {
                await this._device.close();
            }
            throw new Error(`:serial 'Error setting up device'`, error);
        }
    }

    /**
     * Closes the port.
     *
     * @return {Promise<void>} A promise that will resolve when the port is
     * closed.
     */
    // -> Promise<void>
    async close() {
        const promises = [];
        if (this._readable) {
            promises.push(this._readable.cancel());
        }
        if (this._writable) {
            promises.push(this._writable.abort());
        }
        await Promise.all(promises);
        this._readable = null;
        this._writable = null;
        if (this._device.opened) {
            await this.setSignals({dataTerminalReady: false, requestToSend: false});
            await this._device.close();
        }
    }

    /**
     * A function that returns properties of the device.
     * @return {SerialPortInfo} Device properties.
     */
    // -> SerialPortInfo
    getInfo() {
        return {
            usbVendorId:  this._device.vendorId,
            usbProductId: this._device.productId,
        };
    }

    /**
     * A function used to change the serial settings of the device
     * @param {object} options the object which carries serial settings data
     * @return {Promise<void>} A promise that will resolve when the options are
     * set
     */
    // SerialOptions -> Promise<void>
    reconfigure(options) {
        this._serialOptions = {...this._serialOptions, ...options};
        this.validateOptions();
        return this.setLineCoding();
    }

    /**
     * Sets control signal state for the port.
     * @param {SerialOutputSignals} signals The signals to enable or disable.
     * @return {Promise<void>} a promise that is resolved when the signal state
     * has been changed.
     */
    // SerialOutputSignals -> Promise<void>
    async setSignals(signals) {
        this._outputSignals = { ...this._outputSignals, ...signals };

        if(signals.dataTerminalReady !== undefined || signals.requestToSend !== undefined) {
            // The Set_Control_Line_State command expects a bitmap containing the
            // values of all output signals that should be enabled or disabled.
            //
            // Ref: USB CDC specification version 1.1 §6.2.14.
            const value = (this._outputSignals.dataTerminalReady ? 1 << 0 : 0) |
                          (this._outputSignals.requestToSend ? 1 << 1 : 0);

            await this._device.controlTransferOut({
                'requestType': 'class',
                'recipient':   'interface',
                'request':     kSetControlLineState,
                'value':       value,
                'index':       this._controlInterface.interfaceNumber,
            });
        }

        if(signals.break !== undefined) {
            // The SendBreak command expects to be given a duration for how long the
            // break signal should be asserted. Passing 0xFFFF enables the signal
            // until 0x0000 is send.
            //
            // Ref: USB CDC specification version 1.1 §6.2.15.
            const value = this._outputSignals.break ? 0xFFFF : 0x0000;

            await this._device.controlTransferOut({
                'requestType': 'class',
                'recipient':   'interface',
                'request':     kSendBreak,
                'value':       value,
                'index':       this._controlInterface.interfaceNumber,
            });
        }
    }

    /**
     * Checks the serial options for validity and throws an error if it is
     * not valid
     */
    // -> void
    validateOptions() {
        if (!this.isValidBaudRate(this._serialOptions.baudRate)) {
            throw new RangeError(`:serial 'invalid Baud Rate ${this._serialOptions.baudRate}'`);
        }

        if (!this.isValidDataBits(this._serialOptions.dataBits)) {
            throw new RangeError(`:serial 'invalid dataBits ${this._serialOptions.dataBits}'`);
        }

        if (!this.isValidStopBits(this._serialOptions.stopBits)) {
            throw new RangeError(`:serial 'invalid stopBits ${this._serialOptions.stopBits}'`);
        }

        if (!this.isValidParity(this._serialOptions.parity)) {
            throw new RangeError(`:serial 'invalid parity ${this._serialOptions.parity}'`);
        }
    }

    /**
     * Checks the baud rate for validity
     * @param {number} baudRate the baud rate to check
     * @return {boolean} A boolean that reflects whether the baud rate is valid
     */
    // number -> boolean
    isValidBaudRate(baudRate) {
        return baudRate % 1 === 0;
    }

    /**
     * Checks the data bits for validity
     * @param {number} dataBits the data bits to check
     * @return {boolean} A boolean that reflects whether the data bits setting is
     * valid
     */
    // number -> boolean
    isValidDataBits(dataBits) {
        if (typeof dataBits === 'undefined') {
            return true;
        }
        return kAcceptableDataBits.includes(dataBits);
    }

    /**
     * Checks the stop bits for validity
     * @param {number} stopBits the stop bits to check
     * @return {boolean} A boolean that reflects whether the stop bits setting is
     * valid
     */
    // number -> boolean
    isValidStopBits(stopBits) {
        if (typeof stopBits === 'undefined') {
            return true;
        }
        return kAcceptableStopBits.includes(stopBits);
    }

    /**
     * Checks the parity for validity
     * @param {string} parity the parity to check
     * @return {boolean} A boolean that reflects whether the parity is valid
     */
    // ParityType -> boolean
    isValidParity(parity) {
        if (typeof parity === 'undefined') {
            return true;
        }
        return kAcceptableParity.includes(parity);
    }

    /**
     * sends the options alog the control interface to set them on the device
     * @return {Promise} a promise that will resolve when the options are set
     */
    // -> Promise<void>
    async setLineCoding() {
        // Ref: USB CDC specification version 1.1 §6.2.12.
        const buffer = new ArrayBuffer(7);
        const view = new DataView(buffer);
        view.setUint32(0, this._serialOptions.baudRate, true);
        view.setUint8(4, kStopBitsIndexMapping.indexOf(this._serialOptions.stopBits ?? kDefaultStopBits));
        view.setUint8(5, kParityIndexMapping.indexOf(this._serialOptions.parity ?? kDefaultParity));
        view.setUint8(6, this._serialOptions.dataBits ?? kDefaultDataBits);

        const result = await this._device.controlTransferOut({
            'requestType': 'class',
            'recipient':   'interface',
            'request':     kSetLineCoding,
            'value':       0x00,
            'index':       this._controlInterface.interfaceNumber,
        }, buffer);

        if (result.status != 'ok') {
            throw new DOMException(`:serial 'NetworkError' 'Failed to set line coding'`);
        }
    }
}

/** implementation of the global navigator.serial object */
class Serial {
    /**
     * Requests permission to access a new port.
     *
     * @param {SerialPortRequestOptions} options
     * @param {SerialPolyfillOptions} polyfillOptions
     * @return {Promise<SerialPort>}
     */
    // Promise<SerialPort>
    // SerialPortRequestOptions, SerialPolyfillOptions
    async requestPort(options, polyfillOptions) {
        polyfillOptions = {...kDefaultPolyfillOptions, ...polyfillOptions};
        const usbFilters = [];
        if(options && options.filters) {
            for(const filter of options.filters) {
                const usbFilter = {
                    classCode: polyfillOptions.usbControlInterfaceClass,
                };
                if(filter.usbVendorId !== undefined) {
                    usbFilter.vendorId = filter.usbVendorId;
                }
                if(filter.usbProductId !== undefined) {
                    usbFilter.productId = filter.usbProductId;
                }
                usbFilters.push(usbFilter);
            }
        }

        if(usbFilters.length === 0) {
            usbFilters.push({classCode: polyfillOptions.usbControlInterfaceClass});
        }

        console.log(usbFilters);
        const device = await navigator.usb.requestDevice({filters: usbFilters});
        const port = new SerialPort(device, polyfillOptions);
        return port;
  }

    /**
     * Get the set of currently available ports.
     *
     * @param {SerialPolyfillOptions} polyfillOptions Polyfill configuration that
     * should be applied to these ports.
     * @return {Promise<SerialPort[]>} a promise that is resolved with a list of
     * ports.
     */
    // SerialPolyfillOptions -> Promise<SerialPort[]>
    async getPorts(polyfillOptions) {
        polyfillOptions = {...kDefaultPolyfillOptions, ...polyfillOptions};
        const devices = await navigator.usb.getDevices();
        const ports = [];
        devices.forEach((device) => {
            try {
                const port = new SerialPort(device, polyfillOptions);
                ports.push(port);
            } catch (e) {
                // Skip unrecognized port.
            }
        });
        return ports;
    }

    // temp patch
    addEventListener(event, handleEvent) {
        navigator.usb.addEventListener(event, handleEvent);
    }
    removeEventListener(event, handleEvent) {
        navigator.usb.removeEventListener(event, handleEvent);
    }
}



/* an object to be used for starting the serial workflow */
const serialPolyfill = new Serial();

export { serialPolyfill, SerialPort };
