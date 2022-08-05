import { xf, equals, exists, existance, dataviewToArray } from '../functions.js';
import { message } from './message.js';

//                             id  ch to  res
// channel response   [164, 3, 64, 0, 81, 0, 182]
//                             id  ch    res
// channel event      [164, 3, 64, 0, 1, 0, x]
//                             id  ch res
// requested response [164, 3, 82, 0, 2, 246]

// Case 1: write Config msg, and wait for channel response
//         send:     [164, 5, 81, 0, 0, 0, 0, 0, 240]
//         response: [164, 3, 64, 0, 81, 0, 182]
//
// Case 2: write Acknowledged Data with control data page, wait for channel event
//         TRANSFER_TX_COMPLETED, success
//         TX_TRANSFER_FAILED, fail and retry until success
//
//         send:       [164, 9, 79, 0,  49, 255,255,255,255,255, 75,0,  103]
//         response 1: [164, 3, 64, 0, 1, 5, x] 'event_transfer_tx_completed'
//         response 2: [164, 3, 64, 0, 1, 6, x] 'event_transfer_tx_failed'
//
// channel response decoded { id, channelNumber, initMsgId, responseCode, valid, }
// channel event decoded    { id, channelNumber, eventCode, valid, }

function Q(args = {}) {
    let _q = new Map();

    function push(dataview) {
        const id = dataview.getUint8(2, true);

        const promise = new Promise(function (resolve, reject) {
            _q.set(id, {resolve: resolve});
        });

        return promise;
    }

    function pull(decoded) {
        const id = decoded.initMsgId;
        const p = _q.get(id);
        if(exists(p)) {
            p.resolve(decoded);
            _q.delete(id);
        }
    }

    return Object.freeze({
        push,
        pull,
    });
}

export { Q };

