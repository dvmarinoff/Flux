import { xf } from './xf.js';

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
}

export { Storage };
