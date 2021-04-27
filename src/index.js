import { xf, prn } from './functions.js';
import './db.js';
import './views/views.js';
import './controllers/controllers.js';
import './watch.js';
import './lock.js';



function start() {
    prn('start app.');
    xf.dispatch('app:start');
}
function stop() {}

start();
