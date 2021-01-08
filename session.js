import { xf } from './xf.js';
import { first, second, third, last } from './functions.js';

class Session {
    constructor(args) {
        this.idb = args.idb || {};
        this.data = {};
        this.init();
    }
    init() {
        let self = this;

        // xf.reg('db:elapsed', elapsed => self.data.elapsed);

        // xf.sub('lock:release', e => {
        //     // console.log(db);
        // });

        // xf.sub('lock:beforeunload', e => {
        //     // backupSession(idb, data);
        // });
    }
    async restore(idb) {
        let self = this;
        let sessions = await self.idb.getAll(self.idb.db, 'session');
        // let sessions = await idb.getAll(idb.db, 'session');
        let session = last(sessions);

        if(session.hasOwnProperty('elapsed')) {
          if(session.elapsed > 0) {
              // restore db state
              xf.dispatch(`session:restore`, session);
              // restore components state
              xf.dispatch(`session:watchRestore`, session);
              console.log('dispatch session:restore');
          } else {
              console.log('dispatch session:clear');
              self.clear(self.idb);
          }
        }
        console.log(`sessions`);
        console.log(sessions);
    }
    async backup(idb, db) {
        let self = this;
        let session = self.dbToSession(db);
        idb.put(idb.db, 'session', session);
    }
    async clear(idb) {
        let self = this;
        idb.clearEntries(idb.db, 'session');
    }

    dbToSession(db) {
        let session = {
            id: 0,
            elapsed:   db.elapsed,
            lapTime:   db.lapTime,
            stepTime:  db.stepTime,
            targetPwr: db.targetPwr,
            records:   db.records,
            workoutStepIndex:     db.workoutStepIndex,
            workoutIntervalIndex: db.workoutIntervalIndex,
        };

        console.log(session);
        return session;
    }
    // sessionToDb(db, session) {
    //     // db.records = session.records;
    //     db.elapsed = session.elapsed;
    //     // db.target  = session.target;
    // }
}

export { Session };
