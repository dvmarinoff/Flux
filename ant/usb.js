import { xf } from '../xf.js';
import { first, empty, splitAt } from '../functions.js';
import { message } from './message.js';

const DynastreamId       = 4047;
const ANT_USB_2_Stick_Id = 1008;
const ANT_USB_m_Stick_Id = 1009;

function isAntStick(portInfo) {
    return portInfo.usbVendorId === DynastreamId;
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

class USB {
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
            throw new Error(`USB trying to set invalid port.`);
        }
    }
    get reader() { return this._reader; }
    set reader(x) {
        const self = this;
        if(self.isReadable(x)) {
            this._reader = x;
        } else {
            console.error(x);
            throw new Error(`USB trying to set invalid reader.}`);
        }
    }
    get writer() { return this._writer; }
    set writer(x) {
        const self = this;
        if(self.isWritable(x)) {
            this._writer = x;
        } else {
            console.error(x);
            throw new Error(`USB trying to set invalid writer.`);
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

        xf.sub('connect', e => {
            self.onConnect(e);
            self.restore();
        }, navigator.serial);

        xf.sub('disconnect', e => {
            self.onDisconnect(e);
        }, navigator.serial);

        self.restore();
    }
    isAvailable() {
        const self = this;
        return 'serial' in navigator;
    }
    onNotAvailable() {
        const self = this;
        console.warn('ANT+ usb support is not available on this browser');
    }
    async onConnect(e) {
        const self = this;
        const port = e.target;
        const info = port.getInfo();
        if(isAntStick(info)) {
            console.log('ANT+ usb connected');
        }
    }
    onDisconnect(e) {
        const self = this;
        const port = e.target;
        const info = port.getInfo();
        if(isAntStick(info)) {
            console.log('ANT+ usb disconnected');
            xf.dispatch('ant:disconnected');
        }
    }
    async requestAnt() {
        const self   = this;
        const filter = [{usbVendorId: DynastreamId}];
        const port   = await navigator.serial.requestPort({filters: filter});
        return port;
    }
    async getKnownAnt() {
        const self  = this;
        const ports = await navigator.serial.getPorts();
        if(includesAntStick(ports)) {
            self.port = getAntStick(ports);
            console.log(`ANT+ stick found ${self.port}`);
            return true;
        } else {
            console.warn('ANT+ stick not found');
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
        xf.dispatch('usb:ready');
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
                console.error(`ant+ usb reader error: ${error}`);
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

export { USB };
