
function supportedPowerRange(dataview) {
    // (0x) 00-00-20-03-01-00
    let min = dataview.getUint16(0, dataview, true);
    let max = dataview.getUint16(2, dataview, true);
    let inc = dataview.getUint16(4, dataview, true);

    return { min, max, inc };
}

function supportedResistanceLevelRange(dataview) {
    // (0x) 00-00-E8-03-01-00
    let min = dataview.getUint16(0, dataview, true);
    let max = dataview.getUint16(2, dataview, true);
    let inc = dataview.getUint16(4, dataview, true);

    return { min, max, inc };
}

export {
    supportedPowerRange,
    supportedResistanceLevelRange
};
