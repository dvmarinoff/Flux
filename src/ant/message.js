import { nthBitToBool, xor } from '../functions.js';
import { page } from './page.js';



function control(content, channel = 5) {
    const sync   = 164;
    const length = 9;
    const type   = 79; // Acknowledged 0x4F
    let buffer   = new ArrayBuffer(13);
    let view     = new DataView(buffer);
    view.setUint8(0, sync,    true);
    view.setUint8(1, length,  true);
    view.setUint8(2, type,    true);
    view.setUint8(3, channel, true);

    let j = 4;
    for(let i = 0; i < 8; i++) {
        view.setUint8(j, content.getUint8(i), true);
        j++;
    }

    const crc = xor(view);
    view.setUint8(12, crc, true);

    return view;
}
function data(dataview) {
    const sync     = dataview.getUint8(0);
    const length   = dataview.getUint8(1);
    const type     = dataview.getUint8(2);
    const channel  = dataview.getUint8(3);
    const dataPage = dataview.getUint8(4);

    if(dataPage === 25) {
        return page.dataPage25(dataview);
    }
    if(dataPage === 16) {
        return page.dataPage16(dataview);
    }
    return { page: 0 };
}

const message = {
    control,
    data,
};

export { message };
