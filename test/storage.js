class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = String(value);
    }

    removeItem(key) {
        delete this.store[key];
    }
};

global.localStorage = new LocalStorageMock;



var ftp = LocalStorageItem({fallback: 200, parse: parseInt}); // throws

ftp = LocalStorageItem({key: 'ftp', fallback: 200, parse: parseInt});

ftp.get(); // 200

ftp.restore(); // 200

ftp.set(256); // 256

ftp.get(); // 256
