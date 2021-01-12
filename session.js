import { xf } from './xf.js';
import { first, second, third, last } from './functions.js';

class Session {
    constructor(args) {
        this.idb = args.idb || {};
        this.data = {};
        this.init();
    }
    init() {}
    async restore() {
        let self = this;
        let sessions = await self.idb.getAll(self.idb.db, 'session');
        let session = last(sessions);

        if(!self.storeEmpty(sessions)) {
          if(session.elapsed > 0) {
              // restore db state
              xf.dispatch(`session:restore`, session);
              console.log('dispatch session:restore');
          } else {
              console.log('dispatch session:clear');
              self.clear(self.idb);
          }
        }
        console.log(`sessions`);
        console.log(sessions);
    }
    async backup(idb, session) {
        let self = this;
        idb.put(idb.db, 'session', self.setSessionId(session));
    }
    async clear(idb) {
        let self = this;
        idb.clearEntries(idb.db, 'session');
    }
    setSessionId(session) {
        session['id'] = 0;
        return session;
    }
    storeEmpty(res) {
        return res.length < 1;
    }
}

export { Session };
