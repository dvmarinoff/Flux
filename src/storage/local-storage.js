//
// LocalStorageItem
//

import { equals, exists, existance } from '../functions.js';

function LocalStorageItem(args = {}) {
    const defaults = {
        fallback: '',
        isValid:  function (v) { return exists(v); },
        parse:    function(str) { return str; },
        encode:   function(str) { return str; },
    };

    let key      = args.key;
    let fallback = existance(args.fallback, defaults.fallback);
    let isValid  = existance(args.isValid, defaults.isValid);
    let parse    = existance(args.parse, defaults.parse);
    let encode   = existance(args.encode, defaults.encode);

    if(!exists(key)) throw new Error('LocalStorageItem needs a key!');

    function restore() {
        const inStorageValue = get();

        if(equals(inStorageValue, fallback)) {
            set(fallback);
        }

        return get();
    }

    function get() {
        const value = window.localStorage.getItem(`${key}`);

        if(!exists(value)) {
            console.warn(`Trying to get non-existing value from Local Storage at key ${key}!`);
            return fallback;
        }

        return parse(value);
    }

    function set(value) {
        if(isValid(value)) {
            window.localStorage.setItem(`${key}`, encode(value));
            return value;
        } else {
            console.warn(`Trying to enter invalid ${key} value in Local Storage: ${typeof value}`, value);
            window.localStorage.setItem(`${key}`, fallback);
            return fallback;
        }
    }

    function remove() {
        window.localStorage.removeItem(`${key}`);
    }

    return Object.freeze({
        restore,
        get,
        set,
        remove,
    });
}

export { LocalStorageItem };

