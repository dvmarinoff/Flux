import { xf } from './xf.js';

const types = {
    transaction: ['readonly', 'readwrite', 'versionchange'],
};

class IDB {
    constructor() {
        this.db = undefined;
        this.init();
    }
    init() {
        let self = this;
        xf.sub('idb:open-success', idb => {
            console.log(`idb:open-success`);
            self.db = idb;
        });
        xf.sub('idb:open-error', e => {
            console.warn(`idb:open-error`);
        });
    }
    open(name, version, storeName = '') {
        let self = this;
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
    delete(idb, name) {
        let self = this;
        let deleteReq = idb.deleteDatabase(name);

        return self.promisify(deleteReq).then(res => {
            console.log(`idb delete ${name} success`);
            return res;
        }).catch(err => {
            console.error(`idb delete ${name} error: ${err}`);
            return {};
        });
    }
    update(idb) {
        let self = this;
        xf.dispatch('idb:update-success', idb);
        return idb;
    }
    createStore(idb, name) {
        let self = this;
        if (!idb.objectStoreNames.contains(name)) {
            idb.createObjectStore(name, {keyPath: 'id'});
            xf.dispatch('idb:create-success', idb);
        } else {
            console.error(`idb trying to create store with existing name: ${name}`);
        }
    }
    add(idb, storeName, item) {
        let self = this;
        return self.transaction(idb, storeName, 'add', item, 'readwrite');
    }
    put(idb, storeName, item) {
        let self = this;
        return self.transaction(idb, storeName, 'put', item, 'readwrite');
    }
    get(idb, storeName, key) {
        let self = this;
        return self.transaction(idb, storeName, 'get', key, 'readonly');
    }
    getAll(idb, storeName) {
        let self = this;
        return self.transaction(idb, storeName, 'getAll', undefined, 'readonly');
    }
    deleteEntry(idb, storeName, id) {
        let self = this;
        return self.transaction(idb, storeName, 'delete', id, 'readwrite');
    }
    clearEntries(idb, storeName) {
        let self = this;
        return self.transaction(idb, storeName, 'clear', undefined, 'readwrite');
    }
    transaction(idb, storeName, method, param = undefined, type = 'readonly') {
        let self = this;
        let transaction = idb.transaction(storeName, type);
        let store = transaction.objectStore(storeName);
        let req;
        // console.log(`${storeName}: ${method}`);
        // console.log(transaction);
        // console.log(store);

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

class Storage {
    constructor(){
        this.init();
    }
    init() {
        let self        = this;
        let ftp         = window.localStorage.getItem('ftp');
        let weight      = window.localStorage.getItem('rkg');
        let theme       = window.localStorage.getItem('theme');
        let measurement = window.localStorage.getItem('measurement');

        if(ftp === null || ftp === undefined) {
            ftp = 250;
            self.setFtp(ftp);
        }
        if(weight === null || weight === undefined) {
            weight = 75;
            self.setWeight(weight);
        }
        if(measurement === null || measurement === undefined) {
            measurement = 'metric';
            self.setMeasurement(measurement);
        }
        if(theme === null || theme === undefined) {
            theme = 'dark';
            self.setTheme(theme);
        }

        xf.dispatch('storage:ftp', parseInt(ftp));
        xf.dispatch('storage:weight', parseInt(weight));
        xf.dispatch('storage:theme', theme);
        xf.dispatch('storage:measurement', measurement);

        xf.sub('ui:ftp', ftp => {
            self.setFtp(parseInt(ftp));
        });
        xf.sub('ui:weight', weight => {
            self.setWeight(parseInt(weight));
        });
        xf.sub('db:theme', theme => {
            self.setTheme(theme);
        });
        xf.sub('db:measurement', measurement => {
            self.setMeasurement(measurement);
        });
    }
    setFtp(ftp) {
        if(isNaN(ftp) || ftp > 600 || ftp < 30) {
            console.warn(`Trying to enter Invalid FTP value in Storage: ${ftp}`);
        } else {
            window.localStorage.setItem('ftp', Math.round(ftp));
            xf.dispatch('storage:ftp', ftp);
        }
    }
    setWeight(weight) {
        if(isNaN(weight) || weight > 400 || weight < 20) {
            console.warn(`Trying to enter Invalid FTP value in Storage: ${weight}`);

        } else {
            window.localStorage.setItem('rkg', Math.round(weight));
            xf.dispatch('storage:weight', weight);
        }
    }
    setTheme(theme) {
        if(theme === 'dark' || theme === 'white') {
            window.localStorage.setItem('theme', theme);
        } else {
            console.warn(`Trying to enter Invalid Theme system value in Storage: ${theme}`);
        }
    }
    setMeasurement(measurement) {
        if(measurement === 'metric' || measurement === 'imperial') {
            window.localStorage.setItem('measurement', measurement);
        } else {
            console.warn(`Trying to enter Invalid Measurement system value in Storage: ${measurement}`);
        }
    }
}

export { Storage, IDB };
