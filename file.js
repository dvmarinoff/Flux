import { xf } from './xf.js';

class File {
    constructor(args) {}
    async readTextFile(file) {
        let self = this;
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = _ => {
            let res = reader.result;
            console.log(res);
            xf.dispatch('file:workout', res);
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
}

export { File };
