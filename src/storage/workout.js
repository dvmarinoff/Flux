import { first, second, third, last } from '../functions.js';
import { IDBStore } from './idb-store.js';

class Workout extends IDBStore {
    postInit() {}
}

export { Workout };
