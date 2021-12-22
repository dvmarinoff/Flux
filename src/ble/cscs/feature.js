import { equals, exists, existance } from '../../functions.js';

function Feature() {
    function encode() {}
    function decode() {}

    return Object.freeze({
        encode,
        decode
    });
}

const feature = Feature();

export { feature };
