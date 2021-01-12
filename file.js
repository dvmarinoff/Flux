import { xf } from './xf.js';

class FileHandler {
    constructor(args) {}
    async readTextFile(file) {
        let self = this;
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = _ => {
            let res = reader.result;
            console.log(res);
            xf.dispatch('file:upload:workout', res);
        };
        reader.onerror = _ => {
            let err = reader.error;
            console.error(`Error reading local file: `);
            console.error(reader.error);
        };
    }
    async readBinaryFile() {
        self.unsupportedFormat();
    }
    unsupporedFormat() {
        console.warn(`.fit files and other binary formats are not yet supported!`);
    }
    readFile(file) {
        let self = this;
        let ext = file.name.split('.').pop();
        switch(ext) {
            case 'zwo': self.readTextFile(file); break;
            case 'erg': self.readTextFile(file); break;
            case 'mrc': self.readTextFile(file); break;
            case 'fit': self.readBinaryfile(file); break;
            default: self.unsupportedFormat();     break;
        }
    }
    saveFile() {
        let self = this;
        let a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        return function (blob, name) {
            let url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = name;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    };
    downloadActivity(activity) {
        let self = this;
        let blob = new Blob([activity], {type: 'application/octet-stream'});
        let date = new Date();
        let fileDate =
            `workout-${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}`;

        self.saveFile()(blob,`ex${fileDate}.fit`);
    }
}

export { FileHandler };
