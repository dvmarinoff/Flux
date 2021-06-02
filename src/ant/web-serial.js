import { xf, first, last, exists, empty, splitAt } from '../functions.js';
import { message } from './message.js';

const values = {
    Dynastream_Id:      4047, // 0x0FCF
    ANT_USB_2_Stick_Id: 1008,
    ANT_USB_m_Stick_Id: 1009,
    Baud_Rate:          115200,
};

function filter() {
    return [{usbVendorId: values.Dynastream_Id}];
}

async function isSupported() {
    return 'serial' in navigator;
}

async function request(filters = filter()) {
    let port;
    try {
        port = await navigator.serial.requestPort({ filters: filters });
        return port;
    } catch(err) {
        console.log(`:serial :no-port-selected`);
    }
    return port;
}

async function getPorts() {
    const ports = await navigator.serial.getPorts();
    return ports;
}

async function open(port) {
    await port.open({ baudRate: values.Baud_Rate });
    return port;
}



function isAntStick(portInfo) {
    return portInfo.usbVendorId === values.Dynastream_Id;
}

function includesAntStick(ports) {
    if(empty(ports)) return false;
    const antSticks = ports.filter(p => isAntStick(p.getInfo()));
    if(empty(antSticks)) return false;
    return true;
}

function getAntStick(ports) {
    return first(ports.filter(p => isAntStick(p.getInfo())));
}

class MessageTransformer {
    constructor() {
        this.container = [];
    }
    transform(chunk, controller) {
        const self = this;
        self.container.push(Array.from(chunk));
        self.container = self.container.flat();
        let msgs = splitAt(self.container, 164);
        self.container = msgs.pop();
        msgs.forEach(msg => controller.enqueue(msg));
    }
    flush(controller) {
        const self = this;
        controller.enqueue(self.container);
    }
}

class Serial {
    constructor(args) {
        this._port       = {};
        this._reader     = {};
        this._writer     = {};
        this._baudRate   = args.baudRate || this.defaultBaudRate();
        this._isOpen     = this.defaultIsOpen();
        this.keepReading = true;
        this.onData      = args.onData  || ((x) => x);
        this.onReady     = args.onReady || ((x) => x);
    }
    defaultBaudRate() { return 115200; }
    defaultIsOpen()   { return false; }
    get baudRate()    { return this._baudRate; }
    set baudRate(x)   { this._baudRate = x; }
    get isOpen()      { return this._isOpen; }
    set isOpen(x)     { this._isOpen = x; }
    get port()        { return this._port; }
    set port(x) {
        const self = this;
        if(self.isPort(x)) {
            this._port = x;
        } else {
            console.error(x);
            throw new Error(`:serial 'trying to set invalid port'`);
        }
    }
    get reader() { return this._reader; }
    set reader(x) {
        const self = this;
        if(self.isReadable(x)) {
            this._reader = x;
        } else {
            console.error(x);
            throw new Error(`:serial 'trying to set invalid reader'`);
        }
    }
    get writer() { return this._writer; }
    set writer(x) {
        const self = this;
        if(self.isWritable(x)) {
            this._writer = x;
        } else {
            console.error(x);
            throw new Error(`:serial 'trying to set invalid writer'`);
        }
    }
    isPort(x) {
        return ('readable' in x) && ('writable' in x);
    }
    isWritable(x) {
        return (x instanceof WritableStream) || (x instanceof WritableStreamDefaultWriter);
    }
    isReadable(x) {
        return (x instanceof ReadableStream) || (x instanceof ReadableStreamDefaultReader);
    }
    async init() {
        const self = this;
        if(!(self.isAvailable())) {
            self.onNotAvailable();
            return;
        }

        xf.sub('ui:ant:switch', async function(e) {
            if(self.isOpen) {
                await self.close();
            } else {
                self.port = await self.requestAnt();
                self.open();
            }
        });

        navigator.serial.addEventListener('connect', self.onConnect.bind(self));

        navigator.serial.addEventListener('disconnect', self.onDisconnect.bind(self));

        self.restore();
    }
    isAvailable() {
        const self = this;
        return 'serial' in navigator;
    }
    onNotAvailable() {
        const self = this;
        console.warn('ANT+ support is not available on this browser!');
    }
    async onConnect(e) {
        const self = this;
        const port = e.target;
        const info = port.getInfo();
        if(isAntStick(info)) {
            console.log(':serial connected');
        }
        await self.restore();
        return;
    }
    onDisconnect(e) {
        const self = this;
        const port = e.target;
        const info = port.getInfo();
        if(isAntStick(info)) {
            console.log(':serial :disconnected');

            xf.dispatch('ant:disconnected');
        }
    }
    async requestAnt() {
        const self = this;
        const port = await navigator.serial.requestPort({filters: filter()});
        return port;
    }
    async getKnownAnt() {
        const self  = this;
        const ports = await navigator.serial.getPorts();
        if(includesAntStick(ports)) {
            self.port = getAntStick(ports);
            console.log(`:serial :ant-found`, self.port);
            return true;
        } else {
            console.warn(':serial :ant-not-found');
            return false;
        }
    }
    async restore() {
        const self   = this;
        const hasAnt = await self.getKnownAnt();
        if(hasAnt) { self.open(); }
    }
    async open() {
        const self = this;
        await self.port.open({ baudRate: 115200 });
        self.writer = self.port.writable.getWriter();
        self.isOpen = true;
        self.onReady();

        xf.dispatch('serial:ready');
        xf.dispatch('ant:connected');

        self.read();
    }
    async close() {
        const self = this;
        self.keepReading = false;
        self.isOpen = false;
        await self.reader.cancel();

        xf.dispatch('ant:disconnected');
    }
    async read() {
        const self = this;
        while (self.port.readable && self.keepReading) {
            self.reader = self.port.readable.pipeThrough(new TransformStream(new MessageTransformer())).getReader();
            try {
                while (true) {
                    const { value, done } = await self.reader.read();
                    if (done) { break; }
                    self.onData(value);
                }
            } catch (error) {
                console.error(`:serial :reader-error`, error);
            } finally {
                self.reader.releaseLock();
            }
        }
        self.writer.releaseLock();
        await self.port.close();
    }
    async write(buffer) {
        const self = this;
        return await self.writer.write(buffer);
    }
}

export { Serial };
