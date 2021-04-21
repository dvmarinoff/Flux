import { first, last, exists } from '../../src/functions.js';
import { services, characteristics } from '../../src/ble/uuids.js';
import { WebBLE, _ } from '../../src/ble/web-ble.js';

describe('request device', () => {

    let hrm = {filter: {primary: [services.heartRate], optional: [services.deviceInformation]}};
    let ble = new WebBLE({});

    test('', async function() {
        let device = await ble.request(hrm.filter);
        expect(device.name).toBeDefined();
        expect(device.gatt).toBeDefined();
    });
});

// {filters: [{services: [services.fitnessMachine]},
//            {services: [services.fecOverBle]}],
//  optionalServices: [services.deviceInformation]});
describe('web ble filter', () => {
    let hrm = {filter: {primary: [services.heartRate],
                        optional: [services.deviceInformation]}};

    let hrmFilter = {filters: [{services: [services.heartRate]}],
                     optionalServices: [services.deviceInformation]};

    expect(_.toWebBLEFilter(hrm.filter)).toEqual(hrmFilter);
});

describe('primary filter', () => {
    let hrm = {filter: {primary: [services.heartRate],
                        optional: [services.deviceInformation]}};

    let hrmPrimaryFilter = [{services: [services.heartRate]}];

    expect(_.toPrimary(hrm.filter.primary)).toEqual(hrmPrimaryFilter);
});
