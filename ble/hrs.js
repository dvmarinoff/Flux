
function dataviewToHeartRateMeasurement(dataview) {

    console.log(`dataviewToHeartRateMeasurement`);
    console.log(dataview);
    let data = {
        flags: dataview.getUint8(0, true),
        hr:    dataview.getUint8(1, true)
    };

    return data;
}

let hrs = {
    dataviewToHeartRateMeasurement
};

export { hrs };
