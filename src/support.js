function isWebBLESupported () {
    let ble = navigator.bluetooth;
    if(ble === undefined || ble === null) {
        return false;
    }
    return true;
}

function isIDBSupported() {
    let idb = window.indexedDB;
    if(idb === undefined || idb === null) {
        return false;
    }
    return true;
}

function isWakeLockSupported() {
    let wl = navigator.wakeLock;

    if(wl === undefined || wl === null) {
        return false;
    }
    return true;
}

function isFlexBoxSupported() {
    if ('CSS' in window && CSS.supports('display', 'flex')) {
        return true;
    }
    return false;
}
