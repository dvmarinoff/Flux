import { first, last, exists, prn } from '../functions.js';

const values = {
    Dynastream_Id:      4047,
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

async function requestPort(filters = filter()) {
    const port = await navigator.serial.requestPort({ filters: filters });
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


class Serial {}



export { Serial, values, filter, requestPort, getPorts, open };


// class Serial {

//     async read() {
//         const self = this;
//         while (self.port.readable && self.keepReading) {
//             self.reader = self.port.readable.pipeThrough(new TransformStream(new MessageTransformer())).getReader();
//             try {
//                 while (true) {
//                     const { value, done } = await self.reader.read();
//                     if (done) { break; }
//                     self.onData(value);
//                 }
//             } catch (error) {
//                 console.error(`ant+ usb reader error: ${error}`);
//             } finally {
//                 self.reader.releaseLock();
//             }
//         }
//         self.writer.releaseLock();
//         await self.port.close();
//     }
// }

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

// const self   = this;
// const port   = await navigator.serial.requestPort({filters: filter});
// return port;
// self.writer = self.port.writable.getWriter();


// function isAntStick(portInfo) {
//     return portInfo.usbVendorId === Dynastream_Id;
// }

// function includesAntStick(ports) {
//     if(empty(ports)) return false;
//     const antSticks = ports.filter(p => isAntStick(p.getInfo()));
//     if(empty(antSticks)) return false;
//     return true;
// }

// function getAntStick(ports) {
//     return first(ports.filter(p => isAntStick(p.getInfo())));
// }
