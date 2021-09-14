//
// File Handler
//

class FileHandler {
    constructor(args) {}
    readTextFile(file) {
        const self = this;
        let reader = new FileReader();
        reader.readAsText(file);

        return new Promise((resolve, reject) => {
            reader.onload = function(event) {
                return resolve(reader.result);
            };
            reader.onerror = function(event) {
                return reject(reader.error);
            };
        });
    }
    async readBinaryFile() {
        self.unsupportedFormat();
    }
    unsupporedFormat() {
        console.warn(`.fit workout files and other binary formats are not yet supported!`);
    }
    readFile(file) {
        const self = this;
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
        const self = this;
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
}

const fileHandler = new FileHandler();

export { fileHandler };
