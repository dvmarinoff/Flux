function Q() {
    const isFound = (selector, res) => {
        return res === null || res === undefined ? false : true;
    };
    const isIdSelector = (selector) => {
        return selector.charAt(0) === '#' ? true : false;
    };
    const get = (selector) => {
        let res = document.querySelector(selector);
        if(!isFound(selector, res)) {
            throw new Error(`q Error ${selector} is not found: ${res}`);
        }
        return res;
    };
    const getAll = (selector) => {
        let res = document.querySelectorAll(selector);
        if(!isFound(selector, res)) {
            throw new Error(`q Error ${selector} is not found: ${res}`);
        }
        return res;
    };
    const getId = (selector) => {
        let res = document.getElementById(selector);
        if(!isFound(selector, res)) {
            throw new Error(`q Error ${selector} is not found: ${res}`);
        }
        return res;
    };
    return {
        get: get,
        getAll: getAll,
        getId: getId,
    };
}

let q = Q();

export { q };
