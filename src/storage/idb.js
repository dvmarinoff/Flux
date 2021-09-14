//
// IDB
//

import { xf, exists } from '../functions.js';
import { uuid } from './uuid.js';

function promisify(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = function(event) {
            return resolve(request.result);
        };
        request.onerror = function(event) {
            return reject(request.error);
        };
    });
}

function IDB(args = {}) {
    let db;

    function setDB(idb) {
        db = idb;
    }

    function open(name, version, storeName) {
        console.log(`:idb :open :db '${name}' :store-name '${storeName}' ...`);
        let openReq = window.indexedDB.open(name, version);

        return new Promise((resolve, reject) => {
            openReq.onupgradeneeded = function(e) {
                setDB(openReq.result);

                switch(e.oldVersion) {
                case 0: createStore(storeName);
                case 1: update();
                }
            };
            openReq.onerror = function() {
                console.error(`:idb :error :open :db '${name}'`, openReq.error);
                return reject(openReq.error);
            };
            openReq.onsuccess = function() {
                setDB(openReq.result);
                return resolve(openReq.result);
            };
        });
    }

    function deleteStore(name) {
        let deleteReq = db.deleteObjectStore(name);

        return promisify(deleteReq).then(res => {
            console.log(`:idb :delete-store '${name}'`);
            return res;
        }).catch(err => {
            console.error(`:idb :error :delete-store '${name}'`, err);
            return {};
        });
    }

    function createStore(name, keyPath = 'id') {
        if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, {keyPath: keyPath});
            console.log(`:idb :create-store '${name}'`);
        } else {
            console.error(`:idb :error :createStore 'trying to create store with existing name: ${name}'`);
        }
    }

    function createStores(storeNames, keyPaths) {
        storeNames.forEach((storeName, i) => {
            createStore(storeName, keyPaths[i]);
        });
    }

    function update() {
        console.log(`:idb :update`);
    }

    function transaction(storeName, method, param = undefined, type = 'readonly') {
        let transaction = db.transaction(storeName, type);
        let store = transaction.objectStore(storeName);
        let req;

        if(param === undefined) {
            req = store[method]();
        } else {
            req = store[method](param);
        }

        return promisify(req).then(res => {
            console.log(`:idb :${method} :store '${storeName}' :success`);
            return res;
        }).catch(err => {
            console.error(`:idb :error :${method} :store '${storeName}'`, err);
            return [];
        });
    }

    function add(storeName, item) {
        return transaction(storeName, 'add', item, 'readwrite');
    }

    function put(storeName, item) {
        return transaction(storeName, 'put', item, 'readwrite');
    }

    function get(storeName, key) {
        return transaction(storeName, 'get', key, 'readonly');
    }

    function getAll(storeName) {
        return transaction(storeName, 'getAll', undefined, 'readonly');
    }

    function remove(storeName, id) {
        return transaction(storeName, 'delete', id, 'readwrite');
    }

    function clear(storeName) {
        return transaction(storeName, 'clear', undefined, 'readwrite');
    }

    function setId(item, id = undefined) {
        if(!exists(item.id)) {
            if(!exists(id)) {
                id = uuid();
            };
            Object.assign(item, {id: id});
        }
        return item;
    }

    return Object.freeze({
        open,
        createStore,
        deleteStore,
        add,
        put,
        get,
        getAll,
        remove,
        clear,
        setId,
    });
}

const idb = IDB();

export { idb };
