import { xf, exists, equals, prn } from '../functions.js';

const types = {
    transaction: ['readonly', 'readwrite', 'versionchange'],
};

class IDB {
    constructor() {
        this.db = undefined;
        this.init();
    }
    init() {
        const self = this;
        xf.sub('idb:open-success', idb => {
            console.log(`idb:open-success`);
            self.db = idb;
        });
        xf.sub('idb:open-error', e => {
            console.warn(`idb:open-error`);
        });
    }
    open(name, version, storeName = '') {
        const self = this;
        console.log(`idb:open ${name}:${storeName} ...`);
        let openReq = window.indexedDB.open(name, version);

        return new Promise((resolve, reject) => {
            openReq.onupgradeneeded = function(e) {
                let idb = openReq.result;
                switch(e.oldVersion) {
                case 0: self.createStore(idb, storeName);
                case 1: self.update(idb);
                }
            };
            openReq.onerror = function() {
                console.error(`idb open error: ${openReq.error}`);
                xf.dispatch('idb:open-error');
                return reject(openReq.error);
            };
            openReq.onsuccess = function() {
                let idb = openReq.result;
                xf.dispatch('idb:open-success', idb);
                return resolve(openReq.result);
            };
        });
    }
    deleteStore(idb, name) {
        const self = this;
        let deleteReq = idb.deleteDatabase(name);

        return self.promisify(deleteReq).then(res => {
            console.log(`idb delete ${name} success`);
            return res;
        }).catch(err => {
            console.error(`idb delete ${name} error: ${err}`);
            return {};
        });
    }
    createStore(idb, name) {
        const self = this;
        if (!idb.objectStoreNames.contains(name)) {
            idb.createObjectStore(name, {keyPath: 'id'});
            xf.dispatch('idb:create-success', idb);
        } else {
            console.error(`idb trying to create store with existing name: ${name}`);
        }
    }
    update(idb) {
        const self = this;
        xf.dispatch('idb:update-success', idb);
        return idb;
    }
    add(idb, storeName, item) {
        const self = this;
        return self.transaction(idb, storeName, 'add', item, 'readwrite');
    }
    put(idb, storeName, item) {
        const self = this;
        return self.transaction(idb, storeName, 'put', item, 'readwrite');
    }
    get(idb, storeName, key) {
        const self = this;
        return self.transaction(idb, storeName, 'get', key, 'readonly');
    }
    getAll(idb, storeName) {
        const self = this;
        return self.transaction(idb, storeName, 'getAll', undefined, 'readonly');
    }
    delete(idb, storeName, id) {
        const self = this;
        return self.transaction(idb, storeName, 'delete', id, 'readwrite');
    }
    clearEntries(idb, storeName) {
        const self = this;
        return self.transaction(idb, storeName, 'clear', undefined, 'readwrite');
    }
    transaction(idb, storeName, method, param = undefined, type = 'readonly') {
        const self = this;
        let transaction = idb.transaction(storeName, type);
        let store = transaction.objectStore(storeName);
        let req;

        if(param === undefined) {
            req = store[method]();
        } else {
            req = store[method](param);
        }

        return self.promisify(req).then(res => {
            console.log(`idb ${method} ${storeName} success`);
            return res;
        }).catch(err => {
            console.error(`idb ${method} ${storeName} error: ${err}`);
            return [];
        });
    }
    promisify(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = function(event) {
                return resolve(request.result);
            };
            request.onerror = function(event) {
                return reject(request.error);
            };
        });
    }
}

const idb = new IDB();

export { idb };
