
const values = {
    Dynastream_Id:      4047, // 0x0FCF
    ANT_USB_2_Stick_Id: 1008,
    ANT_USB_m_Stick_Id: 1009,
    Baud_Rate:          115200,
};

function USB() {

    const filters = {
        dynastream: [{vendorId: values.Dynastream_Id}],
    };

    async function request(args = {}) {
        let device = {};
        try {
            device = await navigator.usb.requestDevice();
        } catch(err) {
            console.log({usb: {error: 'requesting device'}});
        }
        return device;
    }
}

const usb = USB();

export { usb };
