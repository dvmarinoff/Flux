import { xf } from '../xf.js';

class LocalStorage {
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
export { LocalStorage };
