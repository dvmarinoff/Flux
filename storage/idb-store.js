import { xf } from '../xf.js';

class IDBStore {
    constructor(args) {
        this._idb   = args.idb || {};
        this._name  = args.name;
        this._data  = {};
        this.postInit();
    }
    get name()  { return this._name; }
    set name(x) { this.name = x; }
    get idb()   { return this._idb; }
    set idb(x)  { this.idb = x; }
    get data()  { return this._data; }
    set data(x) { this.data = x; }
    postInit() {}
    async restore() {
        const self = this;
        const data = await self.get();
        xf.dispatch(`${self.name}:restore`, data);
        console.log(`${self.name}:restore ${data.length}`);
        return data;
    }
    async get() {
        const self = this;
        const data = await self.idb.getAll(self.idb.db, `${self.name}`);
        self.data = data;
        return data;
    }
    async save(idb, data, id = false) {
        const self = this;
        idb.put(idb.db, `${self.name}`, self.setId(data, id));
    }
    async delete(idb, id) {
        const self = this;
        idb.deleteEntry(idb.db, `${self.name}`, id);
    }
    setId(data, id = false) {
        const self = this;
        if(!id) { id = (Date.now()); };
        Object.assign(data, {id: id});
        return data;
    }
    async clear(idb) {
        const self = this;
        idb.clearEntries(idb.db, `${self.name}`);
    }
}


export { IDBStore };
