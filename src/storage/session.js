import { xf } from '../xf.js';
import { first, second, third, last } from '../functions.js';
import { IDBStore } from './idb-store.js';

class Session extends IDBStore {
    postInit() {}
    async restore() {
        const self = this;
        const sessions = await self.idb.getAll(self.idb.db, `${self.name}`);
        let session = last(sessions);

        if(!self.isEmpty(sessions)) {
          if(session.elapsed > 0) {
              // restore db state
              xf.dispatch(`${self.name}:restore`, session);
              console.log(`dispatch ${self.name}:restore`);
          } else {
              console.log(`dispatch ${self.name}:clear`);
              self.clear(self.idb);
          }
        }
    }
    setId(data, id = false) {
        const self = this;
        id = 0;
        Object.assign(data, {id: id});
        return data;
    }
    isEmpty(data) {
        const self = this;
        return (data.length < 1);
    }
}

export { Session };
