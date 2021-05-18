
function requestControl() {
    const OpCode = 0x00;
    let buffer   = new ArrayBuffer(1);
    let view     = new DataView(buffer);
    view.setUint8(0, OpCode, true);

    return view;
}

export {
    requestControl,
}
