import { first, last, exists } from '../functions.js';

const values = {
    Dynastream_Id:      4047, // 0x0FCF
    ANT_USB_2_Stick_Id: 1008,
    ANT_USB_m_Stick_Id: 1009,
    Baud_Rate:          115200,
};

function filter() {
    return [{vendorId: values.Dynastream_Id}];
}

function isSupported() {
    return 'usb' in navigator;
}

async function request(filter = filter()) {
    let device;
    try {
        device = await navigator.usb.requestDevice();
    } catch(err) {
        console.log(`:usb :no-device-selected`);
    }
    return device;
}

class USB {
};

export { USB };
