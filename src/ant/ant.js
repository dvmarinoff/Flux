import { first, last, exists, prn } from '../functions.js';
import { Serial } from 'serial.js';

// private
const _type = 'ant';

const _ = {};

// public
class ANT {
    get type() { return _type; }
}

export { ANT, _ };
