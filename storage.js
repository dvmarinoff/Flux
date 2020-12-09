import { xf } from './xf.js';

class IDB {
    constructor() {
        this.db = undefined;
        this.init();
    }
    init() {
        let self = this;
        xf.sub('idb:open:success', e => {
            console.log(`idb:open:success ${e.detail.data}`);
            self.db = e.detail.data;
        });
        xf.sub('idb:delete:success', e => {
            console.log(`idb:delete:success ${e.detail.data}`);
            self.db = e.detail.data;
        });
        xf.sub('idb:create:success', e => {
            console.log(`idb:create:success ${e.detail.data}`);
            // self.db = e.detail.data;
        });
    }
    open(name, version) {
        let self = this;
        let openReq = window.indexedDB.open(name, version);

        openReq.onupgradeneeded = function(e) {
            let idb = openReq.result;
            switch(e.oldVersion) {
                case 0: self.createStore(idb, name);
                case 1: self.update(idb);
            }
        };
        openReq.onerror = function() {
            console.error(`idb open error: ${openReq.error}`);
            xf.dispatch('idb:open:error');
        };
        openReq.onsuccess = function() {
            let idb = openReq.result;
            xf.dispatch('idb:open:success', idb);
        };
    }
    delete(name) {
        let deleteReq = indexedDB.deleteDatabase(name);
        deleteReq.onerror = function() {
            console.error(`idb delete error: ${deleteReq.error}`);
        };
        deleteReq.onsuccess = function() {
            let res = deleteReq.result;
            xf.dispatch('idb:delete:success', res);
        };
    }
    update(idb) {
        xf.dispatch('idb:update:success', idb);
        return idb;
    }
    createStore(idb, name) {
        if (!idb.objectStoreNames.contains(name)) {
            idb.createObjectStore(name, {keyPath: 'id'});
            xf.dispatch('idb:create:success', idb);
        } else {
            console.error(`idb trying to create store with existing name: ${name}`);
        }
    }
    add(idb, storeName, item, type = 'readonly') {
        let transaction = idb.transaction(storeName, type);
        let store = transaction.objectStore(storeName);
        let addReq = store.add(item);
        addReq.onsuccess = function() {
            let res = addReq.result;
            console.log(`idb add success: ${res}`);
        };
        addReq.onerror = function() {
            let err = addReq.error;
            console.error(`idb add error: ${err}, , store: ${storeName} item: ${item}`);
        };
        transaction.oncomplete = function() {
            let res = transaction;
            console.log(`idb transaction complete: ${res}`);
        };
    }
    put(idb, storeName, item, type = 'readonly') {
        let transaction = idb.transaction(storeName, type);
        let store = transaction.objectStore(storeName);
        let addReq = store.add(item);
        addReq.onsuccess = function() {
            let res = addReq.result;
            console.log(`idb put success: ${res}`);
        };
        addReq.onerror = function() {
            let err = addReq.error;
            console.error(`idb put error: ${err}, , store: ${storeName} item: ${item}`);
        };
    }
}

let types = {
    transaction: ['readonly', 'readwrite', 'versionchange'],
};

class Storage {
    constructor(){
        this.init();
    }
    init() {
        let self   = this;
        let ftp    = window.localStorage.getItem('ftp');
        let weight = window.localStorage.getItem('rkg');

        if(ftp === null || ftp === undefined) {
            ftp = 250;
            self.setFtp(ftp);
        }

        if(weight === null || weight === undefined) {
            weight = 75;
            self.setWeight(weight);
        }

        xf.dispatch('storage:ftp', parseInt(ftp));
        xf.dispatch('storage:weight', parseInt(weight));

        xf.sub('ui:ftp', e => {
            self.setFtp(parseInt(e.detail.data));
        });

        xf.sub('ui:weight', e => {
            self.setWeight(parseInt(e.detail.data));
        });
    }
    open() {
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
    setSession(data) {
        window.localStorage.setItem('inProgress', data.inProgress);
        window.localStorage.setItem('elapsed', data.elapsed);
        window.localStorage.setItem('lapTime', data.lapTime);
        window.localStorage.setItem('targetPwr', data.targetPwr);
        window.localStorage.setItem('workoutIntervalIndex', data.workoutIntervalIndex);
    }
    getSession() {
        let data = {};
        data.elapsed = window.localStorage.getItem('elapsed');
        data.lapTime = window.localStorage.getItem('lapTime');
        data.targetPwr = window.localStorage.getItem('targetPwr');
        data.workoutIntervalIndex = window.localStorage.getItem('workoutIntervalIndex');
        return data;
    }
    getInProgress() {
        let inProgress = window.localStorage.getItem('inProgress');
        return inProgress ?? false;
    }
    setInProgress(value) {
        window.localStorage.setItem('inProgress', value);
    }
}

export { Storage };
